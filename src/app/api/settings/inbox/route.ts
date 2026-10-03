import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const inboxes = await prisma.inbox.findMany({
      orderBy: { createdAt: "desc" },
    });
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, inboxes, campaigns });
  } catch (error: any) {
    console.error("Inbox settings API error:", error);
    return NextResponse.json({ success: false, inboxes: [], campaigns: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderName, fromEmail, smtpHost, smtpPort, smtpUser, smtpPass, dailyLimit } = body;

    if (!fromEmail || !smtpHost) {
      return NextResponse.json({ error: "Missing required inbox fields" }, { status: 400 });
    }

    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: { email: "admin@outreach.io", name: "Admin" },
      });
    }

    const inbox = await prisma.inbox.create({
      data: {
        userId: defaultUser.id,
        senderName: senderName || "Abhay Sharma",
        fromEmail,
        smtpHost,
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser || fromEmail,
        smtpPass: smtpPass || "",
        dailyLimit: Number(dailyLimit) || 40,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, inbox });
  } catch (error: any) {
    console.error("Create inbox API error:", error);
    return NextResponse.json({ error: error.message || "Failed to create inbox" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { serviceContext } = await req.json();

    if (!serviceContext) {
      return NextResponse.json({ error: "Missing serviceContext" }, { status: 400 });
    }

    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: { email: "admin@outreach.io", name: "Admin" },
      });
    }

    let campaign = await prisma.campaign.findFirst({
      where: { userId: defaultUser.id },
    });

    if (campaign) {
      campaign = await prisma.campaign.update({
        where: { id: campaign.id },
        data: { serviceContext },
      });
    } else {
      campaign = await prisma.campaign.create({
        data: {
          userId: defaultUser.id,
          name: "Default Campaign",
          serviceContext,
        },
      });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Update service context error:", error);
    return NextResponse.json({ error: error.message || "Failed to update service context" }, { status: 500 });
  }
}
