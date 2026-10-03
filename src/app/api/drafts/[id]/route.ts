import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      const updatedEmail = await prisma.email.update({
        where: { id: draftId },
        data: {
          subject: subject || existingEmail.subject,
          bodyText: bodyText || existingEmail.bodyText,
          status: "QUEUED",
        },
      });

      await prisma.lead.update({
        where: { id: existingEmail.leadId },
        data: { status: "APPROVED" },
      });

      return NextResponse.json({ success: true, email: updatedEmail, action: "APPROVED" });
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
