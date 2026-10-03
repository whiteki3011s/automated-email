import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const rawLeads = await prisma.lead.findMany({
      include: {
        emails: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const leads = rawLeads.map((l) => {
      let flaws = l.flawsFound;
      if (typeof l.flawsFound === "string") {
        try {
          flaws = JSON.parse(l.flawsFound);
        } catch {
          flaws = [l.flawsFound];
        }
      }
      return { ...l, flawsFound: flaws };
    });

    const groupedLeads = {
      SOURCED: leads.filter((l) => l.status === "SOURCED"),
      SCRAPED: leads.filter((l) => l.status === "SCRAPED"),
      AI_DRAFTED: leads.filter((l) => l.status === "AI_DRAFTED"),
      APPROVED: leads.filter((l) => l.status === "APPROVED"),
      SENT: leads.filter((l) => l.status === "SENT"),
      REPLIED: leads.filter((l) => l.status === "REPLIED"),
      REJECTED: leads.filter((l) => l.status === "REJECTED"),
    };

    return NextResponse.json({ success: true, leads: groupedLeads, rawLeads: leads });
  } catch (error: any) {
    console.error("Fetch leads API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch leads",
        leads: { SOURCED: [], SCRAPED: [], AI_DRAFTED: [], APPROVED: [], SENT: [], REPLIED: [], REJECTED: [] },
        rawLeads: [],
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { leadId, status } = await req.json();

    if (!leadId || !status) {
      return NextResponse.json({ error: "Missing leadId or status" }, { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error("Update lead API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update lead status" }, { status: 500 });
  }
}
