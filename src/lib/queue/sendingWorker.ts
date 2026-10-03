import { Worker, Job } from "bullmq";
import { connection } from "./client";
import { prisma } from "@/lib/prisma";
import { sendPlainTextEmail } from "@/lib/mailer/sender";

export const sendingWorker = new Worker(
  "dispatch-email-queue",
  async (job: Job) => {
    const { emailId } = job.data;
    console.log(`[SendingWorker] Dispatching email ${emailId}...`);

    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: { lead: true },
    });

    if (!email) throw new Error(`Email ${emailId} not found`);

    // Pick an active inbox with capacity (sentTodayCount < dailyLimit)
    const activeInboxes = await prisma.inbox.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sentTodayCount: "asc" },
    });

    let assignedInbox = activeInboxes.find((i) => i.sentTodayCount < i.dailyLimit);

    if (!assignedInbox) {
      // Fallback: Create or get default inbox
      let defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: { email: "admin@outreach.io", name: "Outreach Admin" },
        });
      }

      assignedInbox = await prisma.inbox.findFirst({ where: { userId: defaultUser.id } });
      if (!assignedInbox) {
        assignedInbox = await prisma.inbox.create({
          data: {
            userId: defaultUser.id,
            senderName: "Abhay Sharma",
            fromEmail: "outreach@domain.com",
            smtpHost: "smtp.mailtrap.io",
            smtpPort: 587,
            smtpUser: "test_user",
            smtpPass: "test_pass",
            dailyLimit: 40,
            sentTodayCount: 0,
          },
        });
      }
    }

    // Rate Limit Check
    if (assignedInbox.sentTodayCount >= assignedInbox.dailyLimit) {
      throw new Error(`Inbox ${assignedInbox.fromEmail} has reached daily rate limit of ${assignedInbox.dailyLimit}`);
    }

    const recipient = email.lead.contactEmail || `contact@${email.lead.domain}`;

    const dispatchResult = await sendPlainTextEmail({
      to: recipient,
      fromName: assignedInbox.senderName,
      fromEmail: assignedInbox.fromEmail,
      subject: email.subject,
      bodyText: email.bodyText,
      smtpConfig: {
        host: assignedInbox.smtpHost,
        port: assignedInbox.smtpPort,
        user: assignedInbox.smtpUser,
        pass: assignedInbox.smtpPass,
      },
    });

    // Update Email & Lead Status
    await prisma.email.update({
      where: { id: email.id },
      data: {
        inboxId: assignedInbox.id,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    await prisma.lead.update({
      where: { id: email.leadId },
      data: { status: "SENT" },
    });

    // Increment Inbox Sent Count
    await prisma.inbox.update({
      where: { id: assignedInbox.id },
      data: {
        sentTodayCount: assignedInbox.sentTodayCount + 1,
        lastSentAt: new Date(),
      },
    });

    console.log(`[SendingWorker] Email ${email.id} sent successfully via ${assignedInbox.fromEmail}`);
    return { emailId: email.id, inboxId: assignedInbox.id };
  },
  { connection }
);
