import { Worker, Job } from "bullmq";
import { connection, aiDraftQueue } from "./client";
import { processScrapingChannelJob, MultiChannelScrapeInput } from "@/lib/scraping/scrapingEngine";

export const scrapingChannelWorker = new Worker(
  "multi-channel-scrape-queue",
  async (job: Job) => {
    const { domainOrHandle, channel = "WEB", campaignId, companyName, location } = job.data;
    console.log(`[ScrapingChannelWorker] Processing ${channel} scraping job for ${domainOrHandle}...`);

    const result = await processScrapingChannelJob({
      domainOrHandle,
      channel: (channel.toUpperCase() as MultiChannelScrapeInput["channel"]) || "WEB",
      campaignId,
      companyName,
      location,
    });

    // If qualified, enqueue for AI pitch drafting out-of-band
    if (result.status === "SCRAPED" && aiDraftQueue) {
      await aiDraftQueue.add("draft-pitch", { leadId: result.leadId, domain: result.domain });
    }

    console.log(
      `[ScrapingChannelWorker] Scrape completed for ${domainOrHandle} (Status: ${result.status}, Qualification Score: ${result.qualification.score}/100)`
    );

    return result;
  },
  { connection }
);
