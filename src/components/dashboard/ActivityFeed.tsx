"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";
import { Activity, Globe, Send, FileEdit } from "lucide-react";

interface ActivityFeedProps {
  recentLeads: any[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ recentLeads }) => {
  return (
    <GlassPanel className="p-5 border-zinc-800 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-red" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-white">
            Recent Pipeline Activity
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Live Engine Stream</span>
      </div>

      <div className="space-y-3">
        {recentLeads.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4 text-center">No recent pipeline activity.</p>
        ) : (
          recentLeads.slice(0, 5).map((lead) => (
            <div
              key={lead.id}
              className="p-3 rounded-lg bg-obsidian-850 border border-zinc-800/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-obsidian-800 text-silver-300">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-mono font-medium text-white block">{lead.domain}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Created {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Badge
                variant={
                  lead.status === "SOURCED"
                    ? "sourced"
                    : lead.status === "SCRAPED"
                    ? "scraped"
                    : lead.status === "AI_DRAFTED"
                    ? "drafted"
                    : lead.status === "APPROVED"
                    ? "approved"
                    : lead.status === "SENT"
                    ? "sent"
                    : "default"
                }
              >
                {lead.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
};
