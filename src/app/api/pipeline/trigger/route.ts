import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeTargetWebsite } from "@/lib/scraping/scraper";
import { generateAIPitch } from "@/lib/ai/generator";
import { sendPlainTextEmail } from "@/lib/mailer/sender";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const campaignId = body.campaignId;

    const whereClause = campaignId ? { campaignId } : {};

    // 1. Process SOURCED leads -> SCRAPED
    const sourcedLeads = await prisma.lead.findMany({
      where: { ...whereClause, status: "SOURCED" },
    });

    for (const lead of sourcedLeads) {
      try {
        const scrapeResult = await scrapeTargetWebsite(lead.domain);
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            scrapedContent: scrapeResult.markdownContent,
            flawsFound: JSON.stringify(scrapeResult.flawsSummary),
            status: "SCRAPED",
          },
        });
      } catch (e) {
        console.error(`Scrape trigger error for ${lead.domain}:`, e);
      }
    }

    // 2. Process SCRAPED leads -> AI_DRAFTED
    const scrapedLeads = await prisma.lead.findMany({
      where: { ...whereClause, status: "SCRAPED" },
      include: { campaign: true },
    });

    for (const lead of scrapedLeads) {
      try {
        let flaws: string[] = [];
        if (lead.flawsFound) {
          try {
            flaws = typeof lead.flawsFound === "string" ? JSON.parse(lead.flawsFound) : lead.flawsFound;
          } catch {
            flaws = [String(lead.flawsFound)];
          }
        }

        const pitch = await generateAIPitch(
          lead.domain,
          lead.scrapedContent || "",
          flaws,
          lead.campaign?.serviceContext || "High-end web design and Next.js optimization."
        );

        await prisma.email.create({
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
            flawsFound: JSON.stringify(pitch.flaws),
            status: "AI_DRAFTED",
          },
        });
      } catch (e) {
        console.error(`AI draft trigger error for ${lead.domain}:`, e);
      }
    }

    // 3. Process QUEUED / APPROVED emails -> SENT
    const queuedEmails = await prisma.email.findMany({
      where: { status: "QUEUED" },
      include: { lead: true },
    });

    let sentCount = 0;
    for (const email of queuedEmails) {
      try {
        // Pick active inbox or default fallback
        let activeInbox = await prisma.inbox.findFirst({
          where: { status: "ACTIVE" },
          orderBy: { sentTodayCount: "asc" },
        });

        if (!activeInbox) {
          let defaultUser = await prisma.user.findFirst();
          if (!defaultUser) {
            defaultUser = await prisma.user.create({
              data: { email: "admin@outreach.io", name: "Outreach Admin" },
            });
          }
          activeInbox = await prisma.inbox.findFirst({ where: { userId: defaultUser.id } });
          if (!activeInbox) {
            activeInbox = await prisma.inbox.create({
              data: {
                userId: defaultUser.id,
                senderName: "Abhay Sharma",
                fromEmail: "outreach@domain.com",
                smtpHost: "sandbox.smtp.mailtrap.io",
                smtpPort: 2525,
                smtpUser: "test_user",
                smtpPass: "test_pass",
                dailyLimit: 40,
                sentTodayCount: 0,
              },
            });
          }
        }

        // Send Email
        const recipient = email.lead.contactEmail || `contact@${email.lead.domain}`;
        await sendPlainTextEmail({
          to: recipient,
          fromName: activeInbox.senderName,
          fromEmail: activeInbox.fromEmail,
          subject: email.subject,
          bodyText: email.bodyText,
          smtpConfig: {
            host: activeInbox.smtpHost,
            port: activeInbox.smtpPort,
            user: activeInbox.smtpUser,
            pass: activeInbox.smtpPass,
          },
        });

        // Update Email & Lead status
        await prisma.email.update({
          where: { id: email.id },
          data: {
            inboxId: activeInbox.id,
            status: "SENT",
            sentAt: new Date(),
          },
        });

        await prisma.lead.update({
          where: { id: email.leadId },
          data: { status: "SENT" },
        });

        await prisma.inbox.update({
          where: { id: activeInbox.id },
          data: {
            sentTodayCount: activeInbox.sentTodayCount + 1,
            lastSentAt: new Date(),
          },
        });

        sentCount++;
      } catch (e) {
        console.error(`Email dispatch trigger error for ${email.id}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      processedScraped: sourcedLeads.length,
      processedDrafted: scrapedLeads.length,
      processedSent: sentCount,
    });
  } catch (error: any) {
    console.error("Pipeline trigger API error:", error);
    return NextResponse.json({ error: error.message || "Failed to run pipeline automation" }, { status: 500 });
  }
}
