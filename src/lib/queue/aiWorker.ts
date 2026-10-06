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

    let flaws: string[] = [];
    if (lead.flawsFound) {
      try {
        const parsed = JSON.parse(lead.flawsFound);
        flaws = Array.isArray(parsed) ? parsed : [lead.flawsFound];
      } catch {
        flaws = [lead.flawsFound];
      }
    }

    const serviceContext = lead.campaign?.serviceContext || "High-end UI/UX redesign & web performance.";

    const pitch = await generateAIPitch(
      lead.domain,
      lead.scrapedContent || "",
      flaws,
      serviceContext
    );

    // Check if an email draft already exists for this lead
    const existingEmail = await prisma.email.findFirst({
      where: { leadId: lead.id },
    });

    let email;
    if (existingEmail) {
      email = await prisma.email.update({
        where: { id: existingEmail.id },
        data: {
          subject: pitch.subject,
          bodyText: pitch.bodyText,
          status: "DRAFT",
        },
      });
    } else {
      email = await prisma.email.create({
        data: {
          leadId: lead.id,
          subject: pitch.subject,
          bodyText: pitch.bodyText,
          status: "DRAFT",
        },
      });
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        flawsFound: JSON.stringify(pitch.flaws),
        status: "AI_DRAFTED",
      },
    });

    console.log(`[AIWorker] Email draft created for lead ${lead.domain}`);
    return { leadId: lead.id, emailId: email.id };
  },
  { connection }
);
