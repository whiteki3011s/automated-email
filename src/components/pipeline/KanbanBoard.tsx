"use client";

import React from "react";
import { LeadCard } from "./LeadCard";
import type { LeadItem } from "./LeadCard";
import { GlassPanel } from "@/components/ui/GlassPanel";

const COLUMNS: { key: LeadItem["status"]; title: string; color: string }[] = [
  { key: "SOURCED", title: "Sourced", color: "border-zinc-700" },
  { key: "SCRAPED", title: "Scraped", color: "border-blue-600/60" },
  { key: "AI_DRAFTED", title: "AI Drafted", color: "border-amber-600/60" },
  { key: "APPROVED", title: "Approved", color: "border-emerald-600/60" },
  { key: "SENT", title: "Sent", color: "border-purple-600/60" },
  { key: "REPLIED", title: "Replied", color: "border-teal-500/60" },
];

interface KanbanBoardProps {
  leads: Record<string, LeadItem[]>;
  onSelectLead?: (lead: LeadItem) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onSelectLead }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const columnLeads = leads[col.key] || [];
        return (
          <div key={col.key} className="flex flex-col min-w-[220px]">
            {/* Column Header */}
            <div className={`p-3 rounded-t-xl bg-obsidian-950 border-t-2 ${col.color} border-x border-b border-zinc-800/80 flex items-center justify-between`}>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-obsidian-800 text-silver-300 font-semibold">
                {columnLeads.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="flex-1 p-2.5 bg-obsidian-950/40 border-x border-b border-zinc-800/60 rounded-b-xl space-y-2.5 min-h-[480px]">
              {columnLeads.length === 0 ? (
                <div className="h-32 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
                  <span className="text-[11px] font-mono text-zinc-600">No leads</span>
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onClick={() => onSelectLead?.(lead)} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
