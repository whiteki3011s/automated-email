import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "@/lib/env";

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

export const sourcingQueue = new Queue("daily-sourcing-queue", { connection });
export const scrapeQueue = new Queue("scrape-lead-queue", { connection });
export const aiDraftQueue = new Queue("ai-draft-queue", { connection });
export const dispatchQueue = new Queue("dispatch-email-queue", { connection });

export { connection };
