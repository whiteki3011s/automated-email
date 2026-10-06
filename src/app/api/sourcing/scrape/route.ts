import { NextResponse } from "next/server";
import { processScrapingChannelJob, MultiChannelScrapeInput } from "@/lib/scraping/scrapingEngine";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targets, channel = "WEB", campaignId } = body;

    let targetList: string[] = [];
    if (Array.isArray(targets)) {
      targetList = targets;
    } else if (typeof targets === "string") {
      targetList = targets.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean);
    }

    if (!targetList || targetList.length === 0) {
      return NextResponse.json({ error: "No targets provided for scraping channel" }, { status: 400 });
    }

    const results = [];
    for (const target of targetList) {
      const output = await processScrapingChannelJob({
        domainOrHandle: target,
        channel: (channel.toUpperCase() as MultiChannelScrapeInput["channel"]) || "WEB",
        campaignId,
      });
      results.push(output);
    }

    const qualifiedCount = results.filter((r) => r.status === "SCRAPED").length;
    const mncExcludedCount = results.filter((r) => r.status === "REJECTED_MNC").length;
    const lowNeedCount = results.filter((r) => r.status === "REJECTED_NO_NEED").length;

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      qualifiedCount,
      mncExcludedCount,
      lowNeedCount,
      results,
    });
  } catch (error: any) {
    console.error("Scraping Channel API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process scraping channel job" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const scrapedLeads = await prisma.lead.findMany({
      where: {
        status: { in: ["SCRAPED", "REJECTED_MNC", "REJECTED_NO_NEED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      count: scrapedLeads.length,
      scrapedLeads,
    });
  } catch (error: any) {
    console.error("Fetch scraping history error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch scraping history" }, { status: 500 });
  }
}
