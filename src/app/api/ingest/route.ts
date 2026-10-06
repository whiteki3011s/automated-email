import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateLeadTargeting } from "@/lib/sourcing/mncFilter";
import { discoverLiveSmbDomains } from "@/lib/sourcing/realWebDiscovery";
import { scrapeTargetWebsite } from "@/lib/scraping/scraper";
import { generateAIPitch } from "@/lib/ai/generator";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let domains: string[] = [];
    let campaignId = "";
    let searchQuery = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      domains = body.domains || [];
      campaignId = body.campaignId;
      searchQuery = body.searchQuery || (body.autoDiscover ? "boutique web design studio" : "");
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      campaignId = (formData.get("campaignId") as string) || "";
      const rawDomains = formData.get("domains") as string;
      if (rawDomains) {
        domains = rawDomains.split(/[\n,]+/).map((d) => d.trim()).filter(Boolean);
      }
    }

    if (searchQuery) {
      const discovered = await discoverLiveSmbDomains(searchQuery, 10);
      domains = [...domains, ...discovered.map((d) => d.domain)];
    }

    if (!domains || domains.length === 0) {
      return NextResponse.json({ error: "No target domains provided or discovered" }, { status: 400 });
    }

    // Default campaign fallback
    let campaignContext = "High-end UI/UX redesign and Next.js performance optimization services.";
    if (!campaignId) {
      let defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: {
            email: "admin@outreach.io",
            name: "Default Admin",
          },
        });
      }

      let defaultCampaign = await prisma.campaign.findFirst({
        where: { userId: defaultUser.id },
      });
      if (!defaultCampaign) {
        defaultCampaign = await prisma.campaign.create({
          data: {
            userId: defaultUser.id,
            name: "Default Q4 Outreach Campaign",
            serviceContext: campaignContext,
          },
        });
      } else {
        campaignContext = defaultCampaign.serviceContext || campaignContext;
      }
      campaignId = defaultCampaign.id;
    }

    const createdLeads = [];
    const excludedLeads = [];

    for (const domain of domains) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").trim();
      if (!cleanDomain) continue;

      // Check if domain already exists in DB
      const existing = await prisma.lead.findFirst({
        where: { domain: cleanDomain },
      });
      if (existing) {
        createdLeads.push(existing);
        continue;
      }

      const evalResult = evaluateLeadTargeting(cleanDomain);

      if (evalResult.isExcluded) {
        const excludedLead = await prisma.lead.create({
          data: {
            campaignId,
            domain: cleanDomain,
            category: evalResult.category,
            status: "REJECTED_MNC",
            rejectionReason: evalResult.reason,
          },
        });
        excludedLeads.push(excludedLead);
      } else {
        // Ingest into SOURCED stage so lead moves step-by-step through Sourced -> Qualifying -> AI_DRAFTED -> Sent
        const lead = await prisma.lead.create({
          data: {
            campaignId,
            domain: cleanDomain,
            contactEmail: `hello@${cleanDomain}`,
            category: evalResult.category || "SMB",
            qualificationScore: 78,
            status: "SOURCED",
          },
        });

        createdLeads.push(lead);
      }
    }

    return NextResponse.json({
      success: true,
      ingestedCount: createdLeads.length,
      excludedMncCount: excludedLeads.length,
      leads: createdLeads,
      excludedLeads,
    });
  } catch (error: any) {
    console.error("Ingestion API error:", error);
    return NextResponse.json({ error: error.message || "Failed to ingest domains" }, { status: 500 });
  }
}
