"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Zap, Kanban, FileCheck, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

export default function CommandCenter() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    scrapedCount: 0,
    draftedCount: 0,
    sentCount: 0,
    repliedCount: 0,
    activeInboxesCount: 1,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success && data.rawLeads) {
        const raw = data.rawLeads;
        setRecentLeads(raw);
        setStats({
          totalLeads: raw.length,
          scrapedCount: raw.filter((l: any) => l.status === "SCRAPED" || l.status === "AI_DRAFTED" || l.status === "APPROVED" || l.status === "SENT").length,
          draftedCount: raw.filter((l: any) => l.status === "AI_DRAFTED" || l.status === "APPROVED" || l.status === "SENT").length,
          sentCount: raw.filter((l: any) => l.status === "SENT" || l.status === "REPLIED").length,
          repliedCount: raw.filter((l: any) => l.status === "REPLIED").length,
          activeInboxesCount: 1,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunPipeline = async () => {
    try {
      setProcessing(true);
      const res = await fetch("/api/pipeline/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "ALL" }),
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(loadData, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-obsidian-900">
      <Header
        title="Command Center"
        description="High-level operational metrics and real-time lead generation pipeline monitoring."
        onTriggerPipeline={handleRunPipeline}
        isProcessing={processing}
      />

      <div className="p-8 space-y-8">
        {/* Top Metrics Cards */}
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <MetricsOverview stats={stats} />
        )}

        {/* Action Controls & Navigation Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassPanel className="p-5 border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
              <Kanban className="w-4 h-4 text-blue-400" />
              <span>1. Lead Pipeline</span>
            </div>
            <p className="text-xs text-zinc-400">
              Ingest target domains via CSV or API and track their Kanban lifecycle progression.
            </p>
            <Link href="/pipeline" className="block pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                Open Pipeline Board →
              </Button>
            </Link>
          </GlassPanel>

          <GlassPanel className="p-5 border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>2. Draft Approval</span>
            </div>
            <p className="text-xs text-zinc-400">
              Review and manually approve AI cold outreach drafts before queueing email dispatch.
            </p>
            <Link href="/approval" className="block pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                Review Pending Drafts →
              </Button>
            </Link>
          </GlassPanel>

          <GlassPanel className="p-5 border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>3. Deliverability Safeguard</span>
            </div>
            <p className="text-xs text-zinc-400">
              Strict 40 emails/day rate limits per inbox, domain rotation, and plain-text enforcement active.
            </p>
            <Link href="/settings" className="block pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                Manage Inboxes & Settings →
              </Button>
            </Link>
          </GlassPanel>
        </div>

        {/* Activity Stream */}
        <ActivityFeed recentLeads={recentLeads} />
      </div>
    </main>
  );
}
