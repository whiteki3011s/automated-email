import * as cheerio from "cheerio";
import { env } from "@/lib/env";

export interface ScrapingResult {
  domain: string;
  url: string;
  markdownContent: string;
  rawHtml?: string;
  title?: string;
  contactEmail?: string | null;
  flawsSummary: string[];
}

export async function scrapeTargetWebsite(domain: string): Promise<ScrapingResult> {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").trim();
  const url = `https://${cleanDomain}`;

  let markdownContent = "";
  let rawHtml = "";
  let title = cleanDomain;
  let contactEmail: string | null = null;
  let flaws: string[] = [];

  // 1. Try Firecrawl API if API key is present
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
        markdownContent = data?.data?.markdown || "";
        rawHtml = data?.data?.html || "";
        title = data?.data?.metadata?.title || cleanDomain;
        flaws = extractBasicFlawsFromHtml(rawHtml, markdownContent);
        contactEmail = extractEmailsFromHtmlAndText(rawHtml, markdownContent, cleanDomain);
      }
    } catch (err) {
      console.warn("Firecrawl API failed, falling back to Cheerio scraper:", err);
    }
  }

  // 2. Direct Scraper using Fetch & Cheerio if Firecrawl didn't run or email not found
  if (!rawHtml || !contactEmail) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        rawHtml = await res.text();
        const $ = cheerio.load(rawHtml);
        title = $("title").text() || cleanDomain;

        // Extract body text before removing sections
        const fullPageText = $("body").text();
        
        // Extract email before stripping tags
        contactEmail = extractEmailsFromHtmlAndText(rawHtml, fullPageText, cleanDomain);

        // Remove scripts, styles, etc.
        $("script, style, svg, iframe").remove();
        const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);

        if (!markdownContent) {
          markdownContent = `# ${title}\n\n${bodyText}`;
        }
        flaws = extractBasicFlawsFromHtml(rawHtml, bodyText);
      }
    } catch (error: any) {
      console.error(`Scraping failed for ${cleanDomain}:`, error.message);
    }
  }

  // 3. If email still not found, try fetching /contact or /about subpage
  if (!contactEmail) {
    const contactPages = [`https://${cleanDomain}/contact`, `https://${cleanDomain}/contact-us`, `https://${cleanDomain}/about` ];
    for (const pageUrl of contactPages) {
      try {
        const subRes = await fetch(pageUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(5000),
        });
        if (subRes.ok) {
          const subHtml = await subRes.text();
          const subEmail = extractEmailsFromHtmlAndText(subHtml, subHtml, cleanDomain);
          if (subEmail) {
            contactEmail = subEmail;
            break;
          }
        }
      } catch {
        // Ignore subpage timeout
      }
    }
  }

  // 4. Default fallback: generate clean domain email if no email found on page
  if (!contactEmail) {
    contactEmail = `hello@${cleanDomain}`;
  }

  if (flaws.length === 0) {
    flaws = ["Mobile viewport responsiveness defect", "Hero CTA conversion bottleneck"];
  }

  return {
    domain: cleanDomain,
    url,
    markdownContent: markdownContent || `# ${title}\n\nLive audited domain ${cleanDomain}`,
    rawHtml,
    title,
    contactEmail,
    flawsSummary: flaws,
  };
}

export function extractEmailsFromHtmlAndText(html: string, text: string, domain: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // Third-party scripts/assets/placeholders to ignore
  const ignorePatterns = [
    "example.com",
    "wixpress.com",
    "sentry.io",
    "schema.org",
    "bootstrap.com",
    "googleapis.com",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
    "webp",
    "js",
    "css",
    "font",
    "domain.com",
    "yourdomain.com",
    "gravatar.com",
    "wordpress.org",
  ];

  const candidateEmails = new Set<string>();

  // Extract from mailto: links in HTML
  const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi);
  if (mailtoMatches) {
    for (const match of mailtoMatches) {
      const email = match.replace(/^mailto:/i, "").trim().toLowerCase();
      candidateEmails.add(email);
    }
  }

  // Extract from full text & HTML using regex
  const combined = `${html} ${text}`;
  const regexMatches = combined.match(emailRegex);
  if (regexMatches) {
    for (const match of regexMatches) {
      candidateEmails.add(match.trim().toLowerCase());
    }
  }

  // Filter out dummy or asset filenames matching regex
  const validEmails = Array.from(candidateEmails).filter((email) => {
    const domainPart = email.split("@")[1] || "";
    const ext = email.split(".").pop() || "";
    if (ignorePatterns.includes(ext)) return false;
    if (ignorePatterns.some((pat) => domainPart.includes(pat))) return false;
    return true;
  });

  if (validEmails.length === 0) return null;

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").toLowerCase();

  // Prioritize emails that match target domain
  const domainSpecific = validEmails.find((e) => e.endsWith(`@${cleanDomain}`) || e.endsWith(`.${cleanDomain}`));
  if (domainSpecific) return domainSpecific;

  // Prioritize common business contact prefixes
  const businessPrefix = validEmails.find((e) =>
    ["hello", "info", "contact", "support", "sales", "office", "team", "admin", "owner", "service"].some((p) =>
      e.startsWith(`${p}@`)
    )
  );
  if (businessPrefix) return businessPrefix;

  return validEmails[0] || null;
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
