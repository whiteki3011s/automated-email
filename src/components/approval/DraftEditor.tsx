"use client";

import React, { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Globe, AlertTriangle, CheckCircle, XCircle, FileEdit, ShieldAlert } from "lucide-react";

interface DraftEditorProps {
  email: {
    id: string;
    subject: string;
    bodyText: string;
    status: string;
    lead: {
      id: string;
      domain: string;
      flawsFound?: any;
      scrapedContent?: string;
    };
  };
  onActionComplete: () => void;
}

export const DraftEditor: React.FC<DraftEditorProps> = ({ email, onActionComplete }) => {
  const [subject, setSubject] = useState(email.subject);
  const [bodyText, setBodyText] = useState(email.bodyText);
  const [saving, setSaving] = useState(false);

  const flaws = Array.isArray(email.lead.flawsFound) ? email.lead.flawsFound : [];

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    try {
      setSaving(true);
      const res = await fetch(`/api/drafts/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, subject, bodyText }),
      });
      const data = await res.json();
      if (data.success) {
        onActionComplete();
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Scraped Domain Flaws Inspection */}
      <GlassPanel className="lg:col-span-5 space-y-4 border-zinc-800 bg-obsidian-950/80">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-silver-300" />
            <h3 className="font-mono font-bold text-sm text-white">{email.lead.domain}</h3>
          </div>
          <Badge variant="drafted">AI DRAFTED</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Extracted Website Flaws:</span>
          </div>
          <div className="space-y-1.5">
            {flaws.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No flaws listed.</p>
            ) : (
              flaws.map((flaw: string, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 font-sans"
                >
                  • {flaw}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deliverability Guarantee Notice */}
        <div className="p-3 rounded-lg bg-obsidian-850 border border-zinc-800 text-[11px] text-zinc-400 space-y-1 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="font-bold uppercase">Deliverability Rules</span>
          </div>
          <p className="text-zinc-400">
            Outgoing email will be sent strictly as <strong>Plain Text</strong> (no HTML/images) to maximize inbox deliverability.
          </p>
        </div>
      </GlassPanel>

      {/* Right: Plain-Text Email Editor */}
      <GlassPanel className="lg:col-span-7 space-y-4 border-zinc-800 bg-obsidian-850">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-silver-300" />
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Email Content Review
            </span>
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-zinc-400 uppercase">Subject Line:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Body Plain-Text Field */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-zinc-400 uppercase">
            Body (Strictly Plain Text):
          </label>
          <textarea
            rows={10}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full p-3 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-xs font-sans text-silver-100 focus:outline-none focus:border-zinc-500 leading-relaxed resize-none"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button
            onClick={() => handleAction("REJECT")}
            disabled={saving}
            variant="danger"
            size="sm"
            className="gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Draft</span>
          </Button>

          <Button
            onClick={() => handleAction("APPROVE")}
            disabled={saving}
            variant="primary"
            size="sm"
            className="gap-1.5 bg-emerald-500 text-obsidian-950 hover:bg-emerald-400"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{saving ? "Processing..." : "Approve & Queue Dispatch"}</span>
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
};
