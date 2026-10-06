import { prisma } from "@/lib/prisma";

export interface ClassificationResult {
  intent: "INTERESTED_ORDER" | "QUESTION" | "OBJECTION" | "NOT_INTERESTED" | "UNSUBSCRIBE";
  summary: string;
  orderTicketId?: string;
}

export async function processInboundReply(leadId: string, replyText: string): Promise<ClassificationResult> {
  const normalizedText = replyText.toLowerCase();

  let intent: ClassificationResult["intent"] = "NOT_INTERESTED";
  let summary = "Prospect responded to outreach email.";

  if (
    normalizedText.includes("interested") ||
    normalizedText.includes("let's talk") ||
    normalizedText.includes("lets talk") ||
    normalizedText.includes("send proposal") ||
    normalizedText.includes("start order") ||
    normalizedText.includes("quote") ||
    normalizedText.includes("pricing") ||
    normalizedText.includes("schedule call") ||
    normalizedText.includes("yes")
  ) {
    intent = "INTERESTED_ORDER";
    summary = "High-intent client response requesting service quote/order fulfillment.";
  } else if (normalizedText.includes("unsubscribe") || normalizedText.includes("stop emailing") || normalizedText.includes("remove me")) {
    intent = "UNSUBSCRIBE";
    summary = "Prospect requested unsubscribe/opt-out.";
  } else if (normalizedText.includes("how much") || normalizedText.includes("what is your price")) {
    intent = "QUESTION";
    summary = "Prospect inquiring about pricing/deliverables.";
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error(`Lead with ID ${leadId} not found`);
  }

  if (intent === "INTERESTED_ORDER") {
    // Zero-friction operator handoff: Create Order Ticket directly
    const orderTicket = await prisma.orderTicket.create({
      data: {
        leadId,
        intent: "INTERESTED_ORDER",
        summary,
        clientNeeds: `Target domain: ${lead.domain}. Scraped Flaws: ${lead.flawsFound || "UI/UX & Performance optimization requested."}`,
        status: "PENDING_FULFILLMENT",
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "REPLIED_ORDER_CREATED",
      },
    });

    console.log(`[ResponseClassifier] Created Order Ticket ${orderTicket.id} for lead ${lead.domain}. Ready for operator fulfillment.`);

    return {
      intent,
      summary,
      orderTicketId: orderTicket.id,
    };
  }

  // Update lead status for non-order replies
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: intent === "UNSUBSCRIBE" ? "UNSUBSCRIBED" : "REPLIED",
    },
  });

  return {
    intent,
    summary,
  };
}
