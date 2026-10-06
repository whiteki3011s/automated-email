import * as cheerio from "cheerio";
import { evaluateLeadTargeting } from "./mncFilter";
import { prisma } from "@/lib/prisma";

export interface DiscoveredLead {
  domain: string;
  title?: string;
  source: string;
}

const DYNAMIC_SEARCH_QUERIES = [
  "boutique web design agency",
  "local plumbing contractor",
  "hvac repair service",
  "dental clinic website",
  "digital marketing agency",
  "custom woodworking shop",
  "roofing company austin",
  "specialty coffee roaster",
  "boutique law firm",
  "accounting firm for small business"
];

const SEARCH_ENGINE_PROVIDERS = [
  {
    name: "DuckDuckGo",
    getUrl: (q: string) => `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
    parseHtml: ($: cheerio.CheerioAPI) => {
      const urls: string[] = [];
      $(".result__url").each((_, el) => {
        const text = $(el).text().trim();
        if (text) urls.push(text);
      });
      return urls;
    },
  },
  {
    name: "Bing",
    getUrl: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    parseHtml: ($: cheerio.CheerioAPI) => {
      const urls: string[] = [];
      $("#b_results li.b_algo cite").each((_, el) => {
        const text = $(el).text().trim();
        if (text) urls.push(text);
      });
      return urls;
    },
  },
];

export async function discoverLiveSmbDomains(
  searchQuery?: string,
  limit: number = 10
): Promise<DiscoveredLead[]> {
  const discovered: DiscoveredLead[] = [];

  // Fetch already existing domains in database to prevent re-fetching
  const existingLeads = await prisma.lead.findMany({ select: { domain: true } });
  const existingDomainSet = new Set(existingLeads.map((l) => l.domain.toLowerCase().trim()));

  // Shuffle queries for maximum domain variety
  const queriesToTry = searchQuery
    ? [searchQuery, ...DYNAMIC_SEARCH_QUERIES]
    : [...DYNAMIC_SEARCH_QUERIES].sort(() => Math.random() - 0.5);

  for (const query of queriesToTry) {
    if (discovered.length >= limit) break;

    for (const provider of SEARCH_ENGINE_PROVIDERS) {
      if (discovered.length >= limit) break;

      try {
        const searchUrl = provider.getUrl(query);
        const res = await fetch(searchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) continue;

        const html = await res.text();
        const $ = cheerio.load(html);
        const rawUrls = provider.parseHtml($);

        for (const rawUrl of rawUrls) {
          if (discovered.length >= limit) break;

          let cleanDomain = rawUrl
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "")
            .split("/")[0]
            .split("?")[0]
            .trim()
            .toLowerCase();

          if (
            !cleanDomain ||
            cleanDomain.length < 4 ||
            !cleanDomain.includes(".") ||
            cleanDomain.includes("duckduckgo") ||
            cleanDomain.includes("bing.com") ||
            cleanDomain.includes("google.com") ||
            cleanDomain.includes("wikipedia.org") ||
            cleanDomain.includes("yelp.com") ||
            cleanDomain.includes("facebook.com") ||
            cleanDomain.includes("linkedin.com") ||
            cleanDomain.includes("instagram.com") ||
            cleanDomain.includes("twitter.com") ||
            existingDomainSet.has(cleanDomain)
          ) {
            continue;
          }

          // Evaluate MNC filter
          const targeting = evaluateLeadTargeting(cleanDomain);
          if (!targeting.isExcluded && !discovered.some((d) => d.domain === cleanDomain)) {
            discovered.push({
              domain: cleanDomain,
              title: cleanDomain,
              source: `Live ${provider.name} Search ("${query}")`,
            });
            existingDomainSet.add(cleanDomain);
          }
        }
      } catch (err: any) {
        console.warn(`Search provider ${provider.name} query '${query}' failed:`, err.message);
      }
    }
  }

  if (discovered.length === 0) {
    throw new Error(
      "Live web search discovery returned no unvisited SMB domains. All discovered domains were already ingested or filtered as MNCs. Try a different search query."
    );
  }

  return discovered;
}
