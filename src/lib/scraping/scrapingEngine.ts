import { scrapeTargetWebsite, ScrapingResult } from "./scraper";
import { scrapeInstagramProfile, scrapeLinkedInCompany, scrapeGoogleMapsDirectory, SocialLeadProfile } from "./socialAdapters";
import { evaluateLeadTargeting, TargetingEvaluation } from "@/lib/sourcing/mncFilter";
import { evaluateLeadServiceNeed, QualificationResult } from "@/lib/sourcing/qualificationGate";
import { prisma } from "@/lib/prisma";

export interface MultiChannelScrapeInput {
  domainOrHandle: string;
  channel: "WEB" | "INSTAGRAM" | "LINKEDIN" | "GOOGLE_MAPS";
  campaignId?: string;
  companyName?: string;
  location?: string;
}

export interface ChannelScrapeOutput {
  leadId: string;
  domain: string;
  channel: string;
  targeting: TargetingEvaluation;
  qualification: QualificationResult;
  status: "SCRAPED" | "REJECTED_MNC" | "REJECTED_NO_NEED";
  flaws: string[];
  markdownContent: string;
}

export async function processScrapingChannelJob(input: MultiChannelScrapeInput): Promise<ChannelScrapeOutput> {
  const { domainOrHandle, channel, campaignId, companyName, location } = input;
  const cleanTarget = domainOrHandle.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

  // 1. Get or create active campaign
  let activeCampaignId = campaignId;
  if (!activeCampaignId) {
    let defaultCampaign = await prisma.campaign.findFirst();
    if (!defaultCampaign) {
      const defaultUser = await prisma.user.create({
        data: { email: "admin@outreach.io", name: "Outreach Admin" },
      });
      defaultCampaign = await prisma.campaign.create({
        data: {
          userId: defaultUser.id,
          name: "Default Multi-Channel Campaign",
          serviceContext: "High-end UI/UX redesign and Next.js performance optimization.",
        },
      });
    }
    activeCampaignId = defaultCampaign.id;
  }

  // 2. MNC Exclusion Check
  const targeting = evaluateLeadTargeting(cleanTarget, companyName);
  if (targeting.isExcluded) {
    const lead = await prisma.lead.create({
      data: {
        campaignId: activeCampaignId,
        domain: cleanTarget,
        companyName: companyName || cleanTarget,
        category: "MNC_EXCLUDED",
        sourcePlatform: channel,
        status: "REJECTED_MNC",
        rejectionReason: targeting.reason,
      },
    });

    return {
      leadId: lead.id,
      domain: cleanTarget,
      channel,
      targeting,
      qualification: { qualified: false, score: 0, verifiedFlaws: [], rejectionReason: targeting.reason },
      status: "REJECTED_MNC",
      flaws: [],
      markdownContent: `Lead excluded by MNC filter: ${targeting.reason}`,
    };
  }

  // 3. Multi-Channel Extraction
  let markdownContent = "";
  let flawsFound: string[] = [];
  let contactEmail: string | undefined = undefined;

  if (channel === "INSTAGRAM") {
    const social = await scrapeInstagramProfile(cleanTarget);
    markdownContent = `# Instagram Profile: ${social.handleOrName}\n\nBio: ${social.bioOrDescription}`;
    flawsFound = social.flawsFound;
    contactEmail = social.contactEmail;
  } else if (channel === "LINKEDIN") {
    const social = await scrapeLinkedInCompany(companyName || cleanTarget);
    markdownContent = `# LinkedIn Company: ${social.handleOrName}\n\nSummary: ${social.bioOrDescription}`;
    flawsFound = social.flawsFound;
    contactEmail = social.contactEmail;
  } else if (channel === "GOOGLE_MAPS") {
    const listings = await scrapeGoogleMapsDirectory(companyName || "Service", location || "City");
    const item = listings[0] || { flawsFound: ["Missing modern web booking CTA"], contactEmail: `info@${cleanTarget}` };
    markdownContent = `# Google Maps Directory Listing: ${cleanTarget}\n\nLocation: ${location || "Local Business"}`;
    flawsFound = item.flawsFound;
    contactEmail = item.contactEmail;
  } else {
    // Default WEB site scraping
    const scraped = await scrapeTargetWebsite(cleanTarget);
    markdownContent = scraped.markdownContent;
    flawsFound = scraped.flawsSummary;
    contactEmail = `contact@${cleanTarget}`;
  }

  // 4. Need-Based Qualification Gate Check
  const qualification = evaluateLeadServiceNeed(flawsFound);

  // 5. Database Lead Record Update / Insertion
  const finalStatus = qualification.qualified ? "SCRAPED" : "REJECTED_NO_NEED";

  const lead = await prisma.lead.create({
    data: {
      campaignId: activeCampaignId,
      domain: cleanTarget,
      companyName: companyName || cleanTarget,
      contactEmail,
      sourcePlatform: channel,
      category: targeting.category,
      scrapedContent: markdownContent,
      flawsFound: JSON.stringify(qualification.verifiedFlaws),
      qualificationScore: qualification.score,
      rejectionReason: qualification.rejectionReason,
      status: finalStatus,
    },
  });

  return {
    leadId: lead.id,
    domain: cleanTarget,
    channel,
    targeting,
    qualification,
    status: finalStatus,
    flaws: qualification.verifiedFlaws,
    markdownContent,
  };
}
