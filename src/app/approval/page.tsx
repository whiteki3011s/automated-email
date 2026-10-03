"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { DraftEditor } from "@/components/approval/DraftEditor";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FileCheck, RefreshCw, CheckCheck } from "lucide-react";

export default function ApprovalPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success && data.rawLeads) {
        // Find leads that have AI_DRAFTED status or have DRAFT emails
        const draftedItems: any[] = [];
        data.rawLeads.forEach((lead: any) => {
          if (lead.emails && lead.emails.length > 0) {
            lead.emails.forEach((email: any) => {
              if (email.status === "DRAFT") {
                draftedItems.push({
                  ...email,
                  lead,
                });
              }
            });
          }
        });
        setDrafts(draftedItems);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const activeDraft = drafts[selectedIndex];

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-obsidian-900">
      <Header
        title="Draft Approval Queue"
        description="Human-in-the-loop verification. Review, edit, and approve AI-generated cold pitches before sending."
      />

      <div className="p-8 space-y-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : drafts.length === 0 ? (
          <GlassPanel className="p-12 text-center space-y-3 border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCheck className="w-6 h-6" />
            </div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">Queue Complete</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              There are no pending AI email drafts requiring human review. All drafts have been approved or processed.
            </p>
          </GlassPanel>
        ) : (
          <div className="space-y-6">
            {/* Draft Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
              <span className="text-xs font-mono text-zinc-400 uppercase mr-2 font-semibold">
                Pending ({drafts.length}):
              </span>
              {drafts.map((draft, idx) => (
                <button
                  key={draft.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    idx === selectedIndex
                      ? "bg-silver-liquid text-obsidian-950 font-bold"
                      : "bg-obsidian-850 text-zinc-400 border border-zinc-800 hover:text-white"
                  }`}
                >
                  {draft.lead.domain}
                </button>
              ))}
            </div>

            {/* Active Draft Editor */}
            {activeDraft && (
              <DraftEditor
                key={activeDraft.id}
                email={activeDraft}
                onActionComplete={fetchDrafts}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
