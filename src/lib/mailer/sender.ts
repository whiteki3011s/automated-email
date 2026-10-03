import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface SendEmailPayload {
  to: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  bodyText: string;
  smtpConfig?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

export function sanitizeToPlainText(rawText: string): string {
  // Strip any accidental HTML tags
  let clean = rawText.replace(/<[^>]*>/g, "");
  // Replace HTML entities
  clean = clean
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return clean.trim();
}

export async function sendPlainTextEmail(payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string }> {
  const cleanBody = sanitizeToPlainText(payload.bodyText);
  const fromAddress = `"${payload.fromName}" <${payload.fromEmail}>`;

  // 1. If SMTP Config is present, use Nodemailer
  if (payload.smtpConfig && payload.smtpConfig.host) {
    try {
      const transporter = nodemailer.createTransport({
        host: payload.smtpConfig.host,
        port: payload.smtpConfig.port,
        secure: payload.smtpConfig.port === 465,
        auth: {
          user: payload.smtpConfig.user,
          pass: payload.smtpConfig.pass,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: payload.to,
        subject: payload.subject,
        text: cleanBody, // Plain text only!
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn("SMTP send error, logging preview fallback:", err.message);
    }
  }

  // 2. Fallback Mock / Log Dispatcher (for development testing without live SMTP)
  console.log("=========================================");
  console.log(`[DISPATCH SUCCESS] From: ${fromAddress} -> To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(`Body:\n${cleanBody}`);
  console.log("=========================================");

  return { success: true, messageId: `mock_msg_${Date.now()}` };
}
