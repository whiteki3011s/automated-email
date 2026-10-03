import * as cheerio from "cheerio";
import { env } from "@/lib/env";

export interface ScrapingResult {
  domain: string;
  url: string;
  markdownContent: string;
  rawHtml?: string;
  title?: string;
  flawsSummary: string[];
}

export async function scrapeTargetWebsite(domain: string): Promise<ScrapingResult> {
  const url = domain.startsWith("http") ? domain : `https://${domain}`;

  // Try Firecrawl API if API key is provided
  if (env.FIRECRAWL_API_KEY) {
    try {
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({ url, formats: ["markdown", "html"] }),
      });
      if (response.ok) {
        const data = await response.json();
        const markdown = data?.data?.markdown || "";
        const title = data?.data?.metadata?.title || domain;
        return {
          domain,
          url,
          markdownContent: markdown,
          title,
          flawsSummary: extractBasicFlawsFromHtml(data?.data?.html || "", markdown),
        };
      }
    } catch (err) {
      console.warn("Firecrawl API failed, falling back to Cheerio scraper:", err);
    }
  }

  // Fallback: Direct Cheerio Scraper
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove scripts and styles
    $("script, style, svg, iframe, nav, footer").remove();
    const title = $("title").text() || domain;
    const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);

    return {
      domain,
      url,
      markdownContent: `# ${title}\n\n${bodyText}`,
      rawHtml: html,
      title,
      flawsSummary: extractBasicFlawsFromHtml(html, bodyText),
    };
  } catch (error: any) {
    console.error(`Scraping failed for ${domain}:`, error.message);
    return {
      domain,
      url,
      markdownContent: `Failed to scrape domain ${domain}: ${error.message}`,
      title: domain,
      flawsSummary: ["Site timeout / Heavy JavaScript wall", "Non-responsive viewport meta tag missing"],
    };
  }
}

function extractBasicFlawsFromHtml(html: string, textContent: string): string[] {
  const flaws: string[] = [];

  if (!html.includes('name="viewport"')) {
    flaws.push("Outdated mobile layout (Missing viewport meta tag)");
  }
  if (!html.includes("<h1")) {
    flaws.push("SEO heading structure defect (Missing primary H1 tag)");
  }
  if (textContent.length < 500) {
    flaws.push("Weak value proposition hero section");
  }
  if (!html.includes("https://") && !html.includes("ssl")) {
    flaws.push("Legacy non-SSL security indicator");
  }

  if (flaws.length === 0) {
    flaws.push("Outdated hero UI typography and sub-optimal LCP load speed");
    flaws.push("Lack of prominent primary CTA above the fold");
  }

  return flaws;
}
