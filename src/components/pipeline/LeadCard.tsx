"use client";

import React from "react";
import { Globe, AlertCircle, CornerDownRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";

export interface LeadItem {
  id: string;
  domain: string;
  companyName?: string;
  contactEmail?: string;
  category?: string;
  qualificationScore?: number;
  rejectionReason?: string;
  status: "SOURCED" | "SCRAPED" | "AI_DRAFTED" | "APPROVED" | "SENT" | "REPLIED" | "REPLIED_ORDER_CREATED" | "REJECTED" | "REJECTED_MNC" | "REJECTED_NO_NEED";
  flawsFound?: any;
  emails?: any[];
  orderTickets?: any[];
  createdAt: string;
}

interface LeadCardProps {
  lead: LeadItem;
  onClick?: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const getFlaws = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [raw];
      }
    }
    return [];
  };

  const flaws = getFlaws(lead.flawsFound);
  const activeEmail = lead.emails && lead.emails.length > 0 ? lead.emails[0] : null;

  const statusVariantMap: Record<string, any> = {
    SOURCED: "sourced",
    SCRAPED: "scraped",
    AI_DRAFTED: "drafted",
    APPROVED: "approved",
    SENT: "sent",
    REPLIED: "replied",
    REPLIED_ORDER_CREATED: "order",
    REJECTED: "rejected",
    REJECTED_MNC: "mnc_excluded",
    REJECTED_NO_NEED: "no_need",
  };

  return (
    <GlassPanel
      hoverEffect
      onClick={onClick}
      className="p-3.5 space-y-2 border-zinc-800/80 bg-obsidian-850/90 text-xs relative group cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <Globe className="w-3.5 h-3.5 text-silver-400 flex-shrink-0" />
          <span className="font-mono font-medium text-white truncate">{lead.domain}</span>
        </div>
        <Badge variant={statusVariantMap[lead.status] || "default"}>
          {lead.status === "REPLIED_ORDER_CREATED" ? "CLIENT ORDER" : lead.status}
        </Badge>
      </div>

      {lead.qualificationScore !== undefined && lead.qualificationScore > 0 && (
        <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-zinc-400">
          <span>Need Score:</span>
          <span className="text-emerald-400 font-bold">{lead.qualificationScore}/100</span>
        </div>
      )}

      {flaws.length > 0 && (
        <div className="mt-1 space-y-1">
          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Flaws Identified ({flaws.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {flaws.slice(0, 2).map((flaw: string, idx: number) => (
              <span
                key={idx}
                className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 truncate max-w-[180px]"
              >
                {flaw}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeEmail && (
        <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-300 flex items-start gap-1.5">
          <CornerDownRight className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2 italic text-silver-300 font-sans">
            "{activeEmail.subject || activeEmail.bodyText}"
          </p>
        </div>
      )}
    </GlassPanel>
  );
};
