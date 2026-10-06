import { ScrapingResult } from "./scraper";

export interface SocialLeadProfile {
  platform: "INSTAGRAM" | "LINKEDIN" | "GOOGLE_MAPS";
  handleOrName: string;
  websiteUrl?: string;
  contactEmail?: string;
  bioOrDescription?: string;
  flawsFound: string[];
  category: "SMB" | "RISING_BUSINESS";
}

export async function scrapeInstagramProfile(handle: string): Promise<SocialLeadProfile> {
  const cleanHandle = handle.replace(/^@/, "").trim();
  
  // Simulated social media graph extraction adapter
  const bio = `Growing brand (@${cleanHandle}) providing boutique services & products. Direct inquiries via DM or website.`;
  const websiteUrl = `https://${cleanHandle}.com`;
  const flaws = [
    "Unoptimized Link-in-Bio landing page (lacks custom domain)",
    "Missing clear value proposition in Instagram profile bio",
    "No automated DM booking funnel link present",
  ];

  return {
    platform: "INSTAGRAM",
    handleOrName: `@${cleanHandle}`,
    websiteUrl,
    contactEmail: `contact@${cleanHandle}.com`,
    bioOrDescription: bio,
    flawsFound: flaws,
    category: "RISING_BUSINESS",
  };
}

export async function scrapeLinkedInCompany(companyName: string): Promise<SocialLeadProfile> {
  const cleanName = companyName.trim();
  const domain = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
  
  const flaws = [
    "Company LinkedIn tagline lacks clear service differentiation",
    "Company website link redirects to unoptimized legacy portal",
    "Missing modern social proof or client case studies on company page",
  ];

  return {
    platform: "LINKEDIN",
    handleOrName: cleanName,
    websiteUrl: `https://${domain}`,
    contactEmail: `hello@${domain}`,
    bioOrDescription: `SMB business ${cleanName} on LinkedIn (10-50 employees).`,
    flawsFound: flaws,
    category: "SMB",
  };
}

export async function scrapeGoogleMapsDirectory(query: string, location: string): Promise<SocialLeadProfile[]> {
  // Simulated Google Maps directory listing scraper adapter for local SMBs
  const mockBusinesses = [
    { name: `${location} Design Studio`, domain: `${location.toLowerCase()}designstudio.com` },
    { name: `Apex ${query} Services`, domain: `apex${query.toLowerCase()}services.com` },
    { name: `Vanguard ${query} Co`, domain: `vanguard${query.toLowerCase()}co.com` },
  ];

  return mockBusinesses.map((b) => ({
    platform: "GOOGLE_MAPS",
    handleOrName: b.name,
    websiteUrl: `https://${b.domain}`,
    contactEmail: `info@${b.domain}`,
    bioOrDescription: `Local business listing for ${b.name} in ${location}.`,
    flawsFound: [
      "Google Business website link points to HTTP non-secure page",
      "Low mobile responsiveness on local landing page",
      "Missing online appointment scheduling / CTA widget",
    ],
    category: "SMB" as const,
  }));
}
