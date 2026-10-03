import { Worker, Job } from "bullmq";
import { connection } from "./client";
import { prisma } from "@/lib/prisma";
import { generateAIPitch } from "@/lib/ai/generator";

export const aiWorker = new Worker(
  "ai-draft-queue",
  async (job: Job) => {
    const { leadId } = job.data;
    console.log(`[AIWorker] Drafting email for lead ${leadId}...`);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { campaign: true },
    });

    if (!lead) throw new Error(`Lead ${leadId} not found`);

    const flaws = Array.isArray(lead.flawsFound) ? (lead.flawsFound as string[]) : [];
    const serviceContext = lead.campaign?.serviceContext || "High-end UI/UX redesign & web performance.";

    const pitch = await generateAIPitch(
      lead.domain,
      lead.scrapedContent || "",
      flaws,
      serviceContext
    );

    // Save pitch as Email draft
    const email = await prisma.email.create({
      data: {
        leadId: lead.id,
        subject: pitch.subject,
        bodyText: pitch.bodyText,
        status: "DRAFT",
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        flawsFound: pitch.flaws,
        status: "AI_DRAFTED",
      },
    });

    console.log(`[AIWorker] Email draft created for lead ${lead.domain}`);
    return { leadId: lead.id, emailId: email.id };
  },
  { connection }
);
