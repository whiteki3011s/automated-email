import { NextResponse } from "next/server";
import { processInboundReply } from "@/lib/ai/responseClassifier";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { leadId, replyText } = await req.json();

    if (!leadId || !replyText) {
      return NextResponse.json({ error: "Missing required fields: leadId and replyText" }, { status: 400 });
    }

    const result = await processInboundReply(leadId, replyText);

    const updatedLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { orderTickets: true },
    });

    return NextResponse.json({
      success: true,
      classification: result,
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error("Reply processing API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process reply" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const orderTickets = await prisma.orderTicket.findMany({
      include: {
        lead: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: orderTickets.length,
      orderTickets,
    });
  } catch (error: any) {
    console.error("Order tickets API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order tickets" }, { status: 500 });
  }
}
