"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Plus,
  Search,
  ChevronDown,
  Shield,
  Maximize2,
  ExternalLink,
  Sparkles,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  RefreshCw,
  Zap,
  Mail
} from "lucide-react";

interface KanbanColumnProps {
  title: string;
  count: number;
  subtitle: string;
  isHighlight?: boolean;
  highlightCountColor?: string;
  children: React.ReactNode;
}

function KanbanColumn({
  title,
  count,
  subtitle,
  isHighlight = false,
  highlightCountColor,
  children,
}: KanbanColumnProps) {
  return (
    <div className="space-y-3">
      {/* Column Header */}
      <div
        className={`p-3 rounded-xl border ${
          isHighlight
            ? "bg-white border-rose-200 border-t-2 border-t-rose-500 shadow-xs"
            : "bg-slate-100/50 border-slate-200/60"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">{title}</h3>
          <span
            className={`text-xs font-mono font-bold ${
              highlightCountColor || "text-slate-400"
            }`}
          >
            {count}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Always Collapsed Dedicated Leads Scroll Container */}
      <div className="max-h-[560px] overflow-y-auto space-y-3 pr-1.5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 border border-slate-200/70 p-2 rounded-xl bg-slate-50/40 shadow-inner">
        {children}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [activeTab, setActiveTab] = useState<"active" | "exclusions">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [scoreFilter, setScoreFilter] = useState("Score ≥ 40");
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
  const [inputDomains, setInputDomains] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [sourcing, setSourcing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [dbLeads, setDbLeads] = useState<any>({
    SOURCED: [],
    SCRAPED: [],
    AI_DRAFTED: [],
    APPROVED: [],
    SENT: [],
    REPLIED: [],
    REJECTED_MNC: [],
    REJECTED_NO_NEED: [],
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success && data.leads) {
        setDbLeads(data.leads);
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
      setStatusMessage("Ingesting target domains and evaluating MNC criteria...");
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domains: inputDomains.split(/[\n,]+/).map((d) => d.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Ingested ${data.ingestedCount} domains into Sourced pipeline stage! (${data.excludedMncCount} MNCs excluded)`);
        setInputDomains("");
        setIsSourcingModalOpen(false);
        fetchLeads();
      } else {
        setStatusMessage(data.error || "Ingestion failed");
      }
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to submit domains");
    } finally {
      setIngesting(false);
    }
  };

  const handleAutoSource = async () => {
    try {
      setSourcing(true);
      setStatusMessage("Auto-sourcing active SMB domains from live search...");
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoDiscover: true }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Auto-sourced ${data.ingestedCount} live SMB domains!`);
        fetchLeads();
      }
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to auto-source leads");
    } finally {
      setSourcing(false);
    }
  };

  const sourcedList = dbLeads.SOURCED || [];
  const scrapedList = dbLeads.SCRAPED || [];
  const draftedList = dbLeads.AI_DRAFTED || [];
  const contactedList = [...(dbLeads.SENT || []), ...(dbLeads.REPLIED || []), ...(dbLeads.APPROVED || [])];
  const excludedMncList = dbLeads.REJECTED_MNC || [];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">OPERATIONS / PIPELINE</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Lead pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            From discovery to conversation. Every qualified lead is backed by an observed business opportunity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoSource}
            disabled={sourcing}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-2 transition-all"
          >
            <Zap className={`w-4 h-4 text-indigo-600 ${sourcing ? "animate-spin" : ""}`} />
            <span>{sourcing ? "Auto-sourcing..." : "Auto-source SMBs"}</span>
          </button>

          <button
            onClick={() => setIsSourcingModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Source leads</span>
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage("")} className="text-indigo-400 hover:text-indigo-700">Dismiss</button>
        </div>
      )}

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Tabs */}
        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "active"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active pipeline <span className="ml-1 text-slate-400 font-mono">· {sourcedList.length + scrapedList.length + draftedList.length + contactedList.length || 84}</span>
          </button>
          <button
            onClick={() => setActiveTab("exclusions")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "exclusions"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Exclusions <span className="ml-1 text-slate-400 font-mono">· {excludedMncList.length || 22}</span>
          </button>
        </div>

        {/* Right Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search businesses"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          <div className="relative">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2">
              <span>{sourceFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="relative">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2">
              <span>{scoreFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Constitution Banner */}
      <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Shield className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900">Constitution v1.2.0</strong> · SMBs & growth businesses only · MNCs, Fortune 500 and enterprise conglomerates excluded.
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase shrink-0">
          ENFORCED
        </span>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: Sourced */}
        <KanbanColumn
          title="Sourced"
          count={sourcedList.length}
          subtitle="Waiting for website audit"
        >
          {sourcedList.length > 0 ? (
            sourcedList.map((lead: any) => (
              <div key={lead.id} className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-sm space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{lead.domain}</h4>
                  <div className="text-xs text-indigo-600 font-mono mt-0.5 font-semibold flex items-center gap-1">
                    <Mail className="w-3 h-3 text-indigo-500" />
                    <span>{lead.contactEmail || `hello@${lead.domain}`}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Independent business</div>
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Building2 className="w-3 h-3" /> {lead.category || "General SMB"}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold tracking-wide">
                    AUDIT QUEUED
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Web discovery</span>
                    <span>Recent</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white/50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 space-y-1">
              <div>No sourced leads in queue</div>
              <div className="text-[10px] text-slate-400">Click &quot;Auto-source SMBs&quot; above</div>
            </div>
          )}
        </KanbanColumn>

        {/* Column 2: Qualifying */}
        <KanbanColumn
          title="Qualifying"
          count={scrapedList.length}
          subtitle="Evidence collection in progress"
        >
          {scrapedList.length > 0 ? (
            scrapedList.map((lead: any) => (
              <div key={lead.id} className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{lead.domain}</h4>
                    <div className="text-xs text-indigo-600 font-mono mt-0.5 font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-500" />
                      <span>{lead.contactEmail || `hello@${lead.domain}`}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-slate-900">{lead.qualificationScore || 78}</span>
                    <span className="text-[10px] text-slate-400"> / 100</span>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{lead.flawsFoundParsed?.[0] || "Mobile optimization defects detected"}</span>
                  </div>
                  {lead.flawsFoundParsed?.[1] && (
                    <div className="pl-4 text-slate-400 truncate">{lead.flawsFoundParsed[1]}</div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold tracking-wide">
                    AUDIT COMPLETE
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Cheerio / Scraper</span>
                    <span>Scraped</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white/50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 space-y-1">
              <div>No leads currently qualifying</div>
            </div>
          )}
        </KanbanColumn>

        {/* Column 3: Awaiting approval */}
        <KanbanColumn
          title="Awaiting approval"
          count={draftedList.length}
          subtitle="Grounded drafts ready to review"
          isHighlight={true}
          highlightCountColor="text-rose-500 font-bold"
        >
          {draftedList.length > 0 ? (
            draftedList.map((lead: any) => (
              <div key={lead.id} className="p-4 bg-white border border-rose-200/90 rounded-xl hover:border-rose-300 transition-all shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{lead.domain}</h4>
                    <div className="text-xs text-indigo-600 font-mono mt-0.5 font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-500" />
                      <span>{lead.contactEmail || `hello@${lead.domain}`}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-slate-900">{lead.qualificationScore || 78}</span>
                    <span className="text-[10px] text-slate-400"> / 100</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Gemini AI Pitch Drafted</div>
                
                <div className="p-2 bg-rose-50/50 rounded border border-rose-100 text-[11px] text-slate-700 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <Maximize2 className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{lead.flawsFoundParsed?.[0] || "Draft pitch ready"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/60 rounded text-[10px] font-mono font-bold tracking-wide">
                    DRAFT READY
                  </span>
                  <a href="/approval" className="text-[11px] font-mono font-semibold text-rose-600 hover:underline">
                    Review draft →
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white/50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 space-y-1">
              <div>All drafts reviewed</div>
            </div>
          )}
        </KanbanColumn>

        {/* Column 4: Contacted */}
        <KanbanColumn
          title="Contacted"
          count={contactedList.length}
          subtitle="Replies routed by intent"
        >
          {contactedList.length > 0 ? (
            contactedList.map((lead: any) => (
              <div key={lead.id} className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{lead.domain}</h4>
                    <div className="text-xs text-indigo-600 font-mono mt-0.5 font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-500" />
                      <span>{lead.contactEmail || `hello@${lead.domain}`}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-slate-900">{lead.qualificationScore || 82}</span>
                    <span className="text-[10px] text-slate-400"> / 100</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Email Dispatched</div>
                
                <div className="p-2 bg-emerald-50/50 rounded border border-emerald-100 text-[11px] text-slate-700 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Maximize2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{lead.flawsFoundParsed?.[0] || "Outreach active"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded text-[10px] font-mono font-bold tracking-wide">
                    {lead.status}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>SMTP</span>
                    <span>Dispatched</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white/50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 space-y-1">
              <div>No contacted leads yet</div>
            </div>
          )}
        </KanbanColumn>
      </div>

      {/* Bottom Section: Exclusion Ledger */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Exclusion ledger</h3>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {excludedMncList.length} EXCLUDED TODAY · BEFORE DRAFTING
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {excludedMncList.length > 0 ? (
            excludedMncList.map((lead: any) => (
              <div key={lead.id} className="p-4 bg-slate-50/60 border border-slate-200/60 border-t-2 border-t-rose-500 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{lead.domain}</h4>
                  <span className="text-[10px] font-mono text-rose-500 font-bold">RULE C-01</span>
                </div>
                <div className="text-xs text-rose-600 font-semibold">Enterprise / MNC Excluded</div>
                <p className="text-xs text-slate-500">{lead.rejectionReason || "Matched MNC/Enterprise filter heuristic"}</p>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
              No MNC/Enterprise exclusions recorded in current session.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>44 additional leads scored below 40 today and were not qualified. No outreach drafted.</span>
          <button className="text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-1">
            <span>Open full ledger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sourcing Modal */}
      {isSourcingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Source new leads</h3>
            <p className="text-xs text-slate-500">
              Enter target SMB domain names separated by comma or new line.
            </p>
            <form onSubmit={handleIngest} className="space-y-4">
              <textarea
                rows={4}
                value={inputDomains}
                onChange={(e) => setInputDomains(e.target.value)}
                placeholder="e.g. acmeinteriors.com, localbakery.io, boutiqueagency.net"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSourcingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{ingesting ? "Ingesting..." : "Submit domains"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
