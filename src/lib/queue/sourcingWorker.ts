import { Worker, Job } from "bullmq";
import { connection, scrapeQueue } from "./client";
import { prisma } from "@/lib/prisma";
import { evaluateLeadTargeting } from "@/lib/sourcing/mncFilter";
import { discoverLiveSmbDomains } from "@/lib/sourcing/realWebDiscovery";

export const sourcingWorker = new Worker(
  "daily-sourcing-queue",
  async (job: Job) => {
    const { campaignId, searchQuery = "boutique web design agency", targetCount = 10 } = job.data;
    console.log(`[SourcingWorker] Executing real live web discovery for "${searchQuery}"...`);

    // Ensure default campaign if missing
    let activeCampaignId = campaignId;
    if (!activeCampaignId) {
      const defaultCampaign = await prisma.campaign.findFirst();
      if (!defaultCampaign) {
        throw new Error("No active campaign found to assign sourced leads.");
      }
      activeCampaignId = defaultCampaign.id;
    }

    // Live Web Search Discovery
    const discovered = await discoverLiveSmbDomains(searchQuery, targetCount);
    const candidateDomains = discovered.map((d) => d.domain);

    let ingestedCount = 0;
    let mncExcludedCount = 0;
    let duplicateCount = 0;

    for (const domain of candidateDomains) {
      // Deduplication check
      const existing = await prisma.lead.findFirst({ where: { domain } });
      if (existing) {
        duplicateCount++;
        continue;
      }

      // MNC Exclusion Evaluation
      const targeting = evaluateLeadTargeting(domain);
      if (targeting.isExcluded) {
        mncExcludedCount++;
        await prisma.lead.create({
          data: {
            campaignId: activeCampaignId,
            domain,
            category: "MNC_EXCLUDED",
            status: "REJECTED_MNC",
            rejectionReason: targeting.reason,
          },
        });
        continue;
      }

      // Sourced SMB Lead Creation
      const lead = await prisma.lead.create({
        data: {
          campaignId: activeCampaignId,
          domain,
          category: targeting.category,
          sourcePlatform: "WEB_SEARCH",
          status: "SOURCED",
        },
      });

      ingestedCount++;

      // Trigger out-of-band scraping queue
      if (scrapeQueue) {
        await scrapeQueue.add("scrape-lead", { leadId: lead.id, domain: lead.domain });
      }
    }

    console.log(
      `[SourcingWorker] Batch complete. Ingested: ${ingestedCount}, MNC Excluded: ${mncExcludedCount}, Duplicates Skipped: ${duplicateCount}`
    );

    return {
      ingestedCount,
      mncExcludedCount,
      duplicateCount,
    };
  },
  { connection }
);
