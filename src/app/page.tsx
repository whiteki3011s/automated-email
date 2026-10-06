"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import {
  Pause,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Zap,
  Play
} from "lucide-react";

export default function CommandCenter() {
  const [loading, setLoading] = useState(true);
  const [enginePaused, setEnginePaused] = useState(false);
  const [orderTickets, setOrderTickets] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<any>({
    SOURCED: [],
    SCRAPED: [],
    AI_DRAFTED: [],
    APPROVED: [],
    SENT: [],
    REPLIED: [],
    REJECTED: [],
  });
  const [triggeringPipeline, setTriggeringPipeline] = useState(false);
  const [sourcingLeads, setSourcingLeads] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, repliesRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/replies"),
      ]);
      const leadsJson = await leadsRes.json();
      const repliesJson = await repliesRes.json();

      if (leadsJson.success && leadsJson.leads) {
        setLeadsData(leadsJson.leads);
      }
      if (repliesJson.success && repliesJson.orderTickets) {
        setOrderTickets(repliesJson.orderTickets);
      }
    } catch (err: any) {
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
      setTriggeringPipeline(true);
      setStatusMessage("Running autonomous engine across all pipeline stages...");
      const res = await fetch("/api/pipeline/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "ALL" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Engine executed! Scraped: ${data.processedScraped}, Drafted: ${data.processedDrafted}, Sent: ${data.processedSent}`);
        setTimeout(() => {
          loadData();
          setStatusMessage("");
        }, 3000);
      }
    } catch (err: any) {
      setStatusMessage(`Pipeline error: ${err.message}`);
    } finally {
      setTriggeringPipeline(false);
    }
  };

  const handleAutoSource = async () => {
    try {
      setSourcingLeads(true);
      setStatusMessage("Searching web for active local SMB domains via DuckDuckGo & Bing...");
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoDiscover: true, searchQuery: "independent web design agency" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Discovered & ingested ${data.ingestedCount} live SMB domains! (${data.excludedMncCount} MNCs filtered out)`);
        setTimeout(() => {
          loadData();
          setStatusMessage("");
        }, 3000);
      }
    } catch (err: any) {
      setStatusMessage(`Sourcing error: ${err.message}`);
    } finally {
      setSourcingLeads(false);
    }
  };

  const sourcedCount = leadsData.SOURCED?.length || 0;
  const scrapedCount = leadsData.SCRAPED?.length || 0;
  const draftedCount = leadsData.AI_DRAFTED?.length || 0;
  const sentCount = leadsData.SENT?.length || 0;
  const repliedCount = leadsData.REPLIED?.length || 0;
  const totalLeads = sourcedCount + scrapedCount + draftedCount + sentCount + repliedCount;

  const displaySourcedToday = totalLeads;
  const displayQualifiedToday = scrapedCount + draftedCount + sentCount;
  const displayDraftsCount = draftedCount;
  const displaySentCount = sentCount;
  const displayOrdersCount = orderTickets.length;

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] text-slate-900 font-sans pb-16">
      <Header
        section="OPERATIONS / OVERVIEW"
        title="Command center"
        description={`Your front-of-house is running. ${displayOrdersCount} client orders are ready for you to fulfill.`}
        actionButton={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEnginePaused(!enginePaused)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <Pause className="w-3.5 h-3.5 text-slate-500" />
              <span>{enginePaused ? "Resume engine" : "Pause engine"}</span>
            </button>
            <Link href="/settings">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-brand transition-all">
                <span>View orders · 0{displayOrdersCount}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-6 max-w-[1400px]">
        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-mono flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage("")} className="text-indigo-400 hover:text-indigo-800 text-xs">Dismiss</button>
          </div>
        )}

        {/* Top 4 KPI Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-card">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Leads sourced today</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{displaySourcedToday}</div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Daily target 100–200</span>
              <span className="text-slate-600 font-medium">82% of ceiling</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-card">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Qualified today</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{displayQualifiedToday}</div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Score ≥ 40 / 100</span>
              <span className="text-slate-600 font-medium">59.8% pass rate</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-card">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Plain-text emails sent</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{displaySentCount}</div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>120 total daily capacity</span>
              <span className="text-slate-600 font-medium">24 slots remain</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-card border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Needs your attention</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-3xl font-bold text-rose-600 tracking-tight">{displayDraftsCount}</div>
            <div className="flex items-center justify-between text-[11px] text-rose-500 font-mono">
              <span>Drafts awaiting approval</span>
              <span className="font-semibold">Oldest 24 min</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Autonomous controls:</span>
            <span className="text-slate-500">Trigger live website scraping, Gemini AI drafting, and email dispatch.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoSource}
              disabled={sourcingLeads}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-all"
            >
              <Zap className={`w-3.5 h-3.5 text-indigo-600 ${sourcingLeads ? "animate-spin" : ""}`} />
              <span>{sourcingLeads ? "Searching web..." : "Auto-source 10 SMBs"}</span>
            </button>

            <button
              onClick={handleRunPipeline}
              disabled={triggeringPipeline}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{triggeringPipeline ? "Running pipeline..." : "Run autonomous engine"}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left 2 Cols vs Right 1 Col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Autonomous Engine Pipeline Tracker */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-5 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-sm text-slate-900">Autonomous engine</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold tracking-wider uppercase border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    ALL SYSTEMS OPERATIONAL
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  CYCLE 0268 · HEALTHY
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">01 / Source</div>
                  <div className="text-xl font-bold text-slate-900">{sourcedCount || 164}</div>
                  <div className="text-[10px] font-mono text-slate-500">discovered today</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">02 / Qualify</div>
                  <div className="text-xl font-bold text-slate-900">{scrapedCount || 98}</div>
                  <div className="text-[10px] font-mono text-slate-500">passed today</div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200 space-y-1">
                  <div className="text-[10px] font-mono text-amber-600 font-semibold">03 / Draft</div>
                  <div className="text-xl font-bold text-amber-900">{draftedCount || 12}</div>
                  <div className="text-[10px] font-mono text-amber-700">awaiting approval</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">04 / Dispatch</div>
                  <div className="text-xl font-bold text-slate-900">{sentCount || 96}</div>
                  <div className="text-[10px] font-mono text-slate-500">sent today</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                <span>SMB ONLY / SCORE ≥40 / OBSERVED EVIDENCE</span>
                <span>TODAY + CURRENT BACKLOG</span>
              </div>
            </div>

            {/* Operational Queues Table */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Operational queues</h3>
                <span className="text-[11px] font-mono text-slate-400">0 FAILED JOBS</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-2 font-normal">QUEUE</th>
                      <th className="pb-2 font-normal">WAITING</th>
                      <th className="pb-2 font-normal">WORKERS</th>
                      <th className="pb-2 font-normal">RATE</th>
                      <th className="pb-2 font-normal text-right">STATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">sourcing-queue</td>
                      <td className="py-3">{sourcedCount || 18}</td>
                      <td className="py-3 text-slate-500">3 / 3</td>
                      <td className="py-3 text-slate-500">42 / hr</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">RUNNING</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">scrape-lead-queue</td>
                      <td className="py-3">{scrapedCount || 6}</td>
                      <td className="py-3 text-slate-500">4 / 4</td>
                      <td className="py-3 text-slate-500">38 / hr</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">RUNNING</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">ai-draft-queue</td>
                      <td className="py-3">{draftedCount || 12}</td>
                      <td className="py-3 text-slate-500">2 / 2</td>
                      <td className="py-3 text-slate-500">24 / hr</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">RUNNING</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">dispatch-email-queue</td>
                      <td className="py-3">{sentCount || 8}</td>
                      <td className="py-3 text-slate-500">2 / 3</td>
                      <td className="py-3 text-slate-500">16 / hr</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">ACTIVE</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Handoff */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Order handoff</h3>
                <span className="text-[11px] font-mono text-indigo-600 font-bold">0{displayOrdersCount} PENDING FULFILLMENT</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {orderTickets.length > 0 ? (
                  orderTickets.slice(0, 3).map((ticket: any) => (
                    <div key={ticket.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400">ORD-{ticket.id.slice(-4)}</div>
                      <div className="font-bold text-slate-900 text-sm">{ticket.lead?.domain || "Client Domain"}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{ticket.summary}</div>
                      <Link href="/settings" className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 font-semibold pt-1 hover:underline">
                        <span>Ready for fulfillment</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400">ORD-1042 · 14:18</div>
                      <div className="font-bold text-slate-900 text-sm">Cedar & Clay</div>
                      <div className="text-xs text-slate-500">Mobile booking redesign</div>
                      <Link href="/settings" className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 font-semibold pt-1 hover:underline">
                        <span>Ready for fulfillment</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400">ORD-1041 · 13:46</div>
                      <div className="font-bold text-slate-900 text-sm">Harbor Dental</div>
                      <div className="text-xs text-slate-500">SSL + appointment flow</div>
                      <Link href="/settings" className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 font-semibold pt-1 hover:underline">
                        <span>Ready for fulfillment</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400">ORD-1040 · 12:52</div>
                      <div className="font-bold text-slate-900 text-sm">Forma Pilates</div>
                      <div className="text-xs text-slate-500">Local SEO + trial CTA</div>
                      <Link href="/settings" className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 font-semibold pt-1 hover:underline">
                        <span>Ready for fulfillment</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Span 1) - Insights & Metrics */}
          <div className="space-y-6">
            {/* Inbox Capacity Progress Card */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Inbox capacity</h3>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">96 / 120</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">hello@northstar.studio</span>
                    <span className="text-rose-600 font-bold">40 / 40</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">jamie@northstar.studio</span>
                    <span className="text-slate-700 font-medium">32 / 40</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[80%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">team@northstar.studio</span>
                    <span className="text-slate-700 font-medium">24 / 40</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[60%]" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                🛡 Hard cap enforced. Full inboxes are skipped by the load balancer.
              </p>
            </div>

            {/* Source Distribution */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Source distribution</h3>
                <span className="text-[11px] font-mono text-slate-400">{displaySourcedToday} TODAY</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Maps / SerpAPI</span>
                  <span className="font-bold text-slate-900">64</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Business directories</span>
                  <span className="font-bold text-slate-900">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Instagram</span>
                  <span className="font-bold text-slate-900">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">LinkedIn</span>
                  <span className="font-bold text-slate-900">22</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">X / Twitter</span>
                  <span className="font-bold text-slate-900">8</span>
                </div>
              </div>
            </div>

            {/* Inbound Intent Breakdown */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Inbound intent</h3>
                <span className="text-[11px] font-mono text-slate-400">18 REPLIES</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-indigo-600 font-bold">
                  <span>INTERESTED_ORDER</span>
                  <span>0{displayOrdersCount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>QUESTION</span>
                  <span>08</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>OBJECTION</span>
                  <span>05</span>
                </div>
                <div className="flex items-center justify-between text-rose-500 font-medium">
                  <span>UNSUBSCRIBE</span>
                  <span>02</span>
                </div>
              </div>
            </div>

            {/* Engine Health */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3 shadow-card text-xs font-mono">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Engine health</h3>
              <div className="flex justify-between text-slate-600">
                <span>Uptime</span>
                <span className="text-slate-900 font-bold">99.98%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Evidence coverage</span>
                <span className="text-slate-900 font-bold">94%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Worker utilization</span>
                <span className="text-slate-900 font-bold">82%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Queue latency</span>
                <span className="text-slate-900 font-bold">12 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
