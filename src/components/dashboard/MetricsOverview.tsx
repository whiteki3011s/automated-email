"use client";

import React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Globe, FileText, Send, MessageSquare, ShieldCheck } from "lucide-react";

interface MetricsOverviewProps {
  stats: {
    totalLeads: number;
    scrapedCount: number;
    draftedCount: number;
    sentCount: number;
    repliedCount: number;
    activeInboxesCount: number;
  };
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Domains Scraped"
        value={stats.scrapedCount}
        subtitle={`Out of ${stats.totalLeads} total leads ingested`}
        icon={<Globe className="w-5 h-5 text-blue-400" />}
        trend="+100%"
      />

      <StatCard
        title="AI Drafts Prepared"
        value={stats.draftedCount}
        subtitle="Flaw-based pitches generated"
        icon={<FileText className="w-5 h-5 text-amber-400" />}
      />

      <StatCard
        title="Emails Sent"
        value={stats.sentCount}
        subtitle="100% Plain Text dispatches"
        icon={<Send className="w-5 h-5 text-purple-400" />}
        trend="Max 40/day limit"
      />

      <StatCard
        title="Active Inboxes"
        value={stats.activeInboxesCount || 1}
        subtitle="Load balanced senders"
        icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        trend="Reputation Protected"
      />
    </div>
  );
};
