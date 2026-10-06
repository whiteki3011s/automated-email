import { Worker, Job } from "bullmq";
import { connection, aiDraftQueue } from "./client";
import { prisma } from "@/lib/prisma";
import { scrapeTargetWebsite } from "@/lib/scraping/scraper";
import { evaluateLeadServiceNeed } from "@/lib/sourcing/qualificationGate";

export const scrapingWorker = new Worker(
  "scrape-lead-queue",
  async (job: Job) => {
    const { leadId, domain } = job.data;
    console.log(`[ScrapingWorker] Processing lead ${leadId} (${domain})...`);

    const result = await scrapeTargetWebsite(domain);
    const qualification = evaluateLeadServiceNeed(result.flawsSummary);

    if (!qualification.qualified) {
      console.warn(`[ScrapingWorker] Lead ${domain} failed qualification gate: ${qualification.rejectionReason}`);
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          scrapedContent: result.markdownContent,
          flawsFound: JSON.stringify(result.flawsSummary),
          contactEmail: result.contactEmail || `hello@${domain}`,
          qualificationScore: qualification.score,
          rejectionReason: qualification.rejectionReason,
          status: "REJECTED_NO_NEED",
        },
      });
      return { leadId, status: "REJECTED_NO_NEED", reason: qualification.rejectionReason };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        scrapedContent: result.markdownContent,
        flawsFound: JSON.stringify(result.flawsSummary),
        contactEmail: result.contactEmail || `hello@${domain}`,
        qualificationScore: qualification.score,
        status: "SCRAPED",
      },
    });

    // Enqueue for AI pitch drafting
    if (aiDraftQueue) {
      await aiDraftQueue.add("draft-pitch", { leadId, domain });
    }

    console.log(`[ScrapingWorker] Scraping & Qualification passed for ${domain} (Email: ${result.contactEmail}). Enqueued for AI drafting.`);
    return { leadId, status: "SCRAPED", score: qualification.score, contactEmail: result.contactEmail };
  },
  { connection }
);
