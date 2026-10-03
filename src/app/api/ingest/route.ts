import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let domains: string[] = [];
    let campaignId = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      domains = body.domains || [];
      campaignId = body.campaignId;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      campaignId = (formData.get("campaignId") as string) || "";
      const rawDomains = formData.get("domains") as string;
      if (rawDomains) {
        domains = rawDomains.split(/[\n,]+/).map((d) => d.trim()).filter(Boolean);
      }
    }

    if (!domains || domains.length === 0) {
      return NextResponse.json({ error: "No target domains provided" }, { status: 400 });
    }

    // Default campaign fallback if campaignId is not provided
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
            serviceContext: "High-end UI/UX redesign and Next.js performance optimization services.",
          },
        });
      }
      campaignId = defaultCampaign.id;
    }

    const createdLeads = [];
    for (const domain of domains) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
      if (!cleanDomain) continue;

      const lead = await prisma.lead.create({
        data: {
          campaignId,
          domain: cleanDomain,
          status: "SOURCED",
        },
      });
      createdLeads.push(lead);
    }

    return NextResponse.json({
      success: true,
      ingestedCount: createdLeads.length,
      leads: createdLeads,
    });
  } catch (error: any) {
    console.error("Ingestion API error:", error);
    return NextResponse.json({ error: error.message || "Failed to ingest domains" }, { status: 500 });
  }
}
