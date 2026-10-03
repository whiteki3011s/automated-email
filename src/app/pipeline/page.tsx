"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Upload, Plus, RefreshCw, AlertCircle } from "lucide-react";

export default function PipelinePage() {
  const [leads, setLeads] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [inputDomains, setInputDomains] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err: any) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDomains.trim()) return;

    try {
      setIngesting(true);
      setErrorMsg("");
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domains: inputDomains.split(/[\n,]+/).map((d) => d.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInputDomains("");
        fetchLeads();
      } else {
        setErrorMsg(data.error || "Ingestion failed");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit domains");
    } finally {
      setIngesting(false);
    }
  };

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
        setTimeout(fetchLeads, 2000);
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
        title="Lead Pipeline Kanban"
        description="Monitor lead state progression from Sourced ingestion to Scraping, AI Drafting, and Delivery."
        onTriggerPipeline={handleRunPipeline}
        isProcessing={processing}
      />

      <div className="p-8 space-y-6">
        {/* Ingestion Bar */}
        <GlassPanel className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-zinc-800">
          <form onSubmit={handleIngest} className="flex-1 flex items-center gap-3 w-full">
            <textarea
              rows={1}
              value={inputDomains}
              onChange={(e) => setInputDomains(e.target.value)}
              placeholder="Enter domain names (e.g. acme.com, stripe.com) separated by comma or new line..."
              className="flex-1 px-3.5 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono resize-none"
            />
            <Button type="submit" disabled={ingesting} variant="primary" size="sm" className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span>{ingesting ? "Ingesting..." : "Ingest Domains"}</span>
            </Button>
          </form>

          <Button onClick={fetchLeads} variant="ghost" size="sm" className="gap-1.5 shrink-0 text-zinc-400">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Board</span>
          </Button>
        </GlassPanel>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-accent-red text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Kanban Board */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <KanbanBoard leads={leads} />
        )}
      </div>
    </main>
  );
}
