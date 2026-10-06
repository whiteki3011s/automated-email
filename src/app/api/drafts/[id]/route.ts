import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPlainTextEmail } from "@/lib/mailer/sender";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const draftId = params.id;
    const { action, subject, bodyText } = await req.json();

    const existingEmail = await prisma.email.findUnique({
      where: { id: draftId },
      include: { lead: true },
    });

    if (!existingEmail) {
      return NextResponse.json({ error: "Email draft not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      const finalSubject = subject || existingEmail.subject;
      const finalBody = bodyText || existingEmail.bodyText;

      // Find an active inbox or fallback admin inbox
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
              senderName: "Jamie Stone",
              fromEmail: "jamie@northstar.studio",
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

      // Send the approved email via SMTP / Dispatcher immediately!
      const recipient = existingEmail.lead.contactEmail || `contact@${existingEmail.lead.domain}`;
      const sendResult = await sendPlainTextEmail({
        to: recipient,
        fromName: activeInbox.senderName,
        fromEmail: activeInbox.fromEmail,
        subject: finalSubject,
        bodyText: finalBody,
        smtpConfig: {
          host: activeInbox.smtpHost,
          port: activeInbox.smtpPort,
          user: activeInbox.smtpUser,
          pass: activeInbox.smtpPass,
        },
      });

      const updatedEmail = await prisma.email.update({
        where: { id: draftId },
        data: {
          subject: finalSubject,
          bodyText: finalBody,
          inboxId: activeInbox.id,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      await prisma.lead.update({
        where: { id: existingEmail.leadId },
        data: { status: "SENT" },
      });

      await prisma.inbox.update({
        where: { id: activeInbox.id },
        data: {
          sentTodayCount: activeInbox.sentTodayCount + 1,
          lastSentAt: new Date(),
        },
      });

      // Also process any previously queued emails that were waiting
      const pendingQueuedEmails = await prisma.email.findMany({
        where: { status: "QUEUED" },
        include: { lead: true },
      });

      for (const qEmail of pendingQueuedEmails) {
        try {
          const qRecipient = qEmail.lead.contactEmail || `contact@${qEmail.lead.domain}`;
          await sendPlainTextEmail({
            to: qRecipient,
            fromName: activeInbox.senderName,
            fromEmail: activeInbox.fromEmail,
            subject: qEmail.subject,
            bodyText: qEmail.bodyText,
          });

          await prisma.email.update({
            where: { id: qEmail.id },
            data: { inboxId: activeInbox.id, status: "SENT", sentAt: new Date() },
          });

          await prisma.lead.update({
            where: { id: qEmail.leadId },
            data: { status: "SENT" },
          });
        } catch (e) {
          console.error(`Error sending queued email ${qEmail.id}:`, e);
        }
      }

      return NextResponse.json({
        success: true,
        email: updatedEmail,
        action: "SENT",
        sendResult,
      });
    } else if (action === "REJECT") {
      const updatedEmail = await prisma.email.update({
        where: { id: draftId },
        data: { status: "FAILED", errorMessage: "Rejected by human review" },
      });

      await prisma.lead.update({
        where: { id: existingEmail.leadId },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ success: true, email: updatedEmail, action: "REJECTED" });
    } else {
      // UPDATE ONLY
      const updatedEmail = await prisma.email.update({
        where: { id: draftId },
        data: {
          subject: subject || existingEmail.subject,
          bodyText: bodyText || existingEmail.bodyText,
        },
      });

      return NextResponse.json({ success: true, email: updatedEmail });
    }
  } catch (error: any) {
    console.error("Draft review API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update draft" }, { status: 500 });
  }
}
