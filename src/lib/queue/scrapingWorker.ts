import { Worker, Job } from "bullmq";
import { connection } from "./client";
import { prisma } from "@/lib/prisma";
import { scrapeTargetWebsite } from "@/lib/scraping/scraper";

export const scrapingWorker = new Worker(
  "scrape-lead-queue",
  async (job: Job) => {
    const { leadId, domain } = job.data;
    console.log(`[ScrapingWorker] Processing lead ${leadId} (${domain})...`);

    const result = await scrapeTargetWebsite(domain);

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        scrapedContent: result.markdownContent,
        flawsFound: result.flawsSummary,
        status: "SCRAPED",
      },
    });

    console.log(`[ScrapingWorker] Scraping complete for ${domain}. Flaws: ${result.flawsSummary.length}`);
    return { leadId, flawsCount: result.flawsSummary.length };
  },
  { connection }
);
