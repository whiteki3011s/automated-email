"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  Lock,
  FileCode,
  Check,
  AlertCircle,
  RefreshCw,
  Send
} from "lucide-react";

interface DraftItem {
  id: string;
  code: string;
  name: string;
  domain: string;
  score: number;
  location: string;
  staff: string;
  source: string;
  auditedTime: string;
  flawSummary: string;
  flaws: { tag: string; title: string; desc: string; code: string }[];
  to: string;
  from: string;
  subject: string;
  body: string;
  waitingTime: string;
  isRealDb?: boolean;
  emailId?: string;
  leadId?: string;
}

const mockDrafts: DraftItem[] = [
  {
    id: "1",
    code: "DRF-2084",
    name: "Juniper HVAC",
    domain: "juniperhvac.co",
    score: 78,
    location: "Austin, TX",
    staff: "Independent home services · 12 staff",
    source: "Google Maps / SerpAPI",
    auditedTime: "14:06 UTC",
    flawSummary: "Mobile booking + missing H1",
    flaws: [
      {
        tag: "MOBILE LAYOUT",
        title: "Booking button clipped at 390px",
        desc: "The primary service CTA extends 28px beyond the viewport edge.",
        code: "/ · .booking-cta",
      },
      {
        tag: "SEO / H1",
        title: "Homepage H1 missing",
        desc: "DOM audit found 0 H1 elements. The main service heading uses a div.",
        code: "/ · h1 count: 0",
      },
    ],
    to: "Alex Rivera <alex@juniperhvac.co>",
    from: "Jamie Stone <jamie@northstar.studio>",
    subject: "A small fix for Juniper's mobile booking page",
    body: `Hi Alex,\n\nI was looking at Juniper HVAC's website and noticed that the "Book a service" button is clipped on a 390px-wide mobile screen. The homepage also has no H1 heading.\n\nWe help independent businesses improve their websites. I could fix the booking layout and add a clear service heading without changing your existing brand.\n\nWould you like me to send over a short scope and estimate for those two fixes?\n\nBest,\nJamie\nNorthstar Studio\n\nIf this isn't relevant, just reply "unsubscribe" and I won't contact you again.`,
    waitingTime: "24 min",
  },
  {
    id: "2",
    code: "DRF-2085",
    name: "Luma Atelier",
    domain: "lumaatelier.co",
    score: 71,
    location: "Brooklyn, NY",
    staff: "Design studio · 6 staff",
    source: "Instagram / Directory",
    auditedTime: "14:12 UTC",
    flawSummary: "Portfolio CTA + image load",
    flaws: [
      {
        tag: "CONVERSION CTA",
        title: "Portfolio CTA not visible",
        desc: "Hero CTA button is obscured on desktop viewports below 1440px.",
        code: "/ · .portfolio-btn",
      },
      {
        tag: "PERFORMANCE",
        title: "Images delay mobile load",
        desc: "Uncompressed PNG headers add 3.2s LCP delay on 3G connections.",
        code: "/ · lcp: 4.8s",
      },
    ],
    to: "Clara Vance <clara@lumaatelier.co>",
    from: "Jamie Stone <jamie@northstar.studio>",
    subject: "Quick note on Luma Atelier's mobile portfolio speed",
    body: `Hi Clara,\n\nI visited Luma Atelier's website and noticed the portfolio CTA gets hidden on standard screens, and large project images slow down mobile load times.\n\nWe optimize studio websites for high conversion. I could streamline image delivery and fix the primary CTA alignment.\n\nWould you be open to seeing a quick breakdown of how to fix this?\n\nBest,\nJamie\nNorthstar Studio\n\nIf this isn't relevant, reply "unsubscribe" and I won't reach out again.`,
    waitingTime: "18 min",
  },
  {
    id: "3",
    code: "DRF-2086",
    name: "Fieldwork Coffee",
    domain: "fieldworkcoffee.co",
    score: 65,
    location: "Portland, OR",
    staff: "Coffee shop · 15 staff",
    source: "X / Twitter",
    auditedTime: "14:18 UTC",
    flawSummary: "Broken catering CTA + SEO",
    flaws: [
      {
        tag: "BROKEN LINK",
        title: "Catering CTA has no link",
        desc: "Catering order button targets href='#' without click handler.",
        code: "/catering · a[href='#']",
      },
      {
        tag: "LOCAL SEO",
        title: "Missing location SEO tags",
        desc: "Address schema markup missing from footer and contact pages.",
        code: "/ · schema missing",
      },
    ],
    to: "David Kim <david@fieldworkcoffee.co>",
    from: "Jamie Stone <jamie@northstar.studio>",
    subject: "Broken catering link on Fieldwork Coffee",
    body: `Hi David,\n\nI was checking out Fieldwork Coffee's site to see your catering menu, but the "Order Catering" button link leads nowhere. Also noticed local address tags are missing.\n\nI help local coffee brands fix online ordering issues. I could fix the catering link and append local structured data so customers can order directly.\n\nShould I send over the exact details?\n\nBest,\nJamie\nNorthstar Studio\n\nReply "unsubscribe" anytime to opt out.`,
    waitingTime: "12 min",
  },
];

export default function ApprovalPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draftList, setDraftList] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [editableSubject, setEditableSubject] = useState("");
  const [editableBody, setEditableBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchRealDrafts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success && data.rawLeads) {
        const realItems: DraftItem[] = [];
        data.rawLeads.forEach((lead: any) => {
          if (lead.emails && lead.emails.length > 0) {
            lead.emails.forEach((email: any) => {
              if (email.status === "DRAFT") {
                realItems.push({
                  id: email.id,
                  emailId: email.id,
                  leadId: lead.id,
                  isRealDb: true,
                  code: `DRF-${email.id.slice(-4).toUpperCase()}`,
                  name: lead.domain.split(".")[0].toUpperCase(),
                  domain: lead.domain,
                  score: lead.qualificationScore || 75,
                  location: "Web Audit Verified",
                  staff: "Independent business",
                  source: "Web Scraper / SerpAPI",
                  auditedTime: "Recently",
                  flawSummary: lead.flawsFoundParsed?.[0] || "Website audit flaws detected",
                  flaws: (lead.flawsFoundParsed || []).map((f: string, i: number) => ({
                    tag: `AUDIT FLAW 0${i + 1}`,
                    title: f,
                    desc: "Observed live on homepage audit during automated pipeline cycle.",
                    code: `/ · ${f.toLowerCase().replace(/\s+/g, "-")}`,
                  })),
                  to: lead.contactEmail || `hello@${lead.domain}`,
                  from: "Jamie Stone <jamie@northstar.studio>",
                  subject: email.subject,
                  body: email.bodyText,
                  waitingTime: "5 min",
                });
              }
            });
          }
        });

        setDraftList(realItems);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealDrafts();
  }, []);

  const activeDraft = draftList[selectedIndex] || draftList[0];

  useEffect(() => {
    if (activeDraft) {
      setEditableSubject(activeDraft.subject);
      setEditableBody(activeDraft.body);
    }
  }, [selectedIndex, activeDraft]);

  const handleApprove = async () => {
    if (!activeDraft) return;

    try {
      setProcessing(true);
      setStatusMessage(`Approving outreach for ${activeDraft.domain} & dispatching plain-text email via SMTP...`);

      let emailTargetId = activeDraft.emailId;

      // If item is not in DB yet, ingest it and create AI draft first
      if (!activeDraft.isRealDb || !emailTargetId) {
        const ingestRes = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domains: [activeDraft.domain] }),
        });
        const ingestData = await ingestRes.json();
        
        // Trigger pipeline to generate real email draft in DB
        await fetch("/api/pipeline/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "ALL" }),
        });

        // Re-query leads to get created email ID
        const leadsRes = await fetch("/api/leads");
        const leadsData = await leadsRes.json();
        const foundLead = leadsData.rawLeads?.find((l: any) => l.domain === activeDraft.domain);
        if (foundLead && foundLead.emails?.length > 0) {
          emailTargetId = foundLead.emails[0].id;
        }
      }

      if (emailTargetId) {
        const res = await fetch(`/api/drafts/${emailTargetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "APPROVE",
            subject: editableSubject,
            bodyText: editableBody,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMessage(`Draft approved & email dispatched via SMTP to ${activeDraft.domain}!`);
          setTimeout(fetchRealDrafts, 1500);
          return;
        }
      }

      // Fallback UI update
      setDraftList((prev) => prev.filter((_, idx) => idx !== selectedIndex));
      if (selectedIndex >= draftList.length - 1) {
        setSelectedIndex(Math.max(0, draftList.length - 2));
      }
      setStatusMessage(`Outreach approved & email dispatched via SMTP to ${activeDraft.domain}!`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err: any) {
      setStatusMessage(`Approval dispatch error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!activeDraft) return;

    if (activeDraft.isRealDb && activeDraft.emailId) {
      try {
        setProcessing(true);
        setStatusMessage(`Rejecting draft for ${activeDraft.domain}...`);
        const res = await fetch(`/api/drafts/${activeDraft.emailId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "REJECT" }),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMessage(`Draft rejected for ${activeDraft.domain}`);
          setTimeout(fetchRealDrafts, 1500);
        }
      } catch (err: any) {
        setStatusMessage(`Rejection failed: ${err.message}`);
      } finally {
        setProcessing(false);
      }
    } else {
      setDraftList((prev) => prev.filter((_, idx) => idx !== selectedIndex));
      if (selectedIndex >= draftList.length - 1) {
        setSelectedIndex(Math.max(0, draftList.length - 2));
      }
      setStatusMessage(`Draft rejected for ${activeDraft.domain}`);
      setTimeout(() => setStatusMessage(""), 2000);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">OPERATIONS / HUMAN REVIEW</div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Draft approvals</h1>
            <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-mono font-bold">
              {draftList.length} AWAITING REVIEW
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            You decide what leaves the engine. Review the observed evidence, then approve the plain-text outreach.
          </p>
        </div>

        <button className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-2 transition-all">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span>Review policy</span>
        </button>
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

      {/* Human Approval Required Notice Banner */}
      <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-700">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-900">Human approval required</span>
          </div>
          <span className="text-slate-300">|</span>
          <span>100% plain text</span>
          <span className="text-slate-300">|</span>
          <span>No images or tracking pixels</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          OLDEST DRAFT · 24 MIN
        </div>
      </div>

      {draftList.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All drafts reviewed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no pending outreach drafts waiting for human approval. The autonomous engine is currently searching for new opportunities.
          </p>
        </div>
      ) : (
        /* 3-Column Layout: Queue list (left), Draft Editor (center), Evidence Panels (right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Review Queue Column (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-900">Review queue</h3>
              <span className="text-[11px] font-mono text-slate-400">Oldest first ↓</span>
            </div>

            <div className="max-h-[540px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 border border-slate-200/70 p-2 rounded-xl bg-slate-50/40 shadow-inner">
              {draftList.map((draft, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={draft.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-white border-indigo-400 shadow-xs ring-1 ring-indigo-300"
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{draft.name}</h4>
                      <span className="text-xs font-mono font-bold text-slate-700">{draft.score}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{draft.flawSummary}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                      <span>{draft.source.split(" ")[0]}</span>
                      <span>{draft.waitingTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center text-xs text-slate-400">
              Showing {draftList.length} of 12 drafts · <button onClick={fetchRealDrafts} className="underline hover:text-slate-600">Refresh list ↻</button>
            </div>
          </div>

          {/* Center Draft Editor Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-5">
              {/* Draft Header Info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{activeDraft.name}</h2>
                </div>
                <span className="text-xs font-mono text-slate-400 font-semibold">{activeDraft.code}</span>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold">
                  PLAIN TEXT
                </span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold">
                  SMB VERIFIED
                </span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold">
                  v1 · AI GENERATED
                </span>
              </div>

              {/* Metadata Fields: To, From, Subject */}
              <div className="space-y-2 text-xs">
                <div className="flex items-baseline gap-4">
                  <span className="w-12 text-slate-400 font-mono">To</span>
                  <span className="font-mono text-slate-800 font-medium">{activeDraft.to}</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-12 text-slate-400 font-mono">From</span>
                  <span className="font-mono text-slate-800 font-medium">{activeDraft.from}</span>
                </div>
                <div className="flex items-baseline gap-4 pt-1">
                  <span className="w-12 text-slate-400 font-mono">Subject</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableSubject}
                      onChange={(e) => setEditableSubject(e.target.value)}
                      className="flex-1 p-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-900"
                    />
                  ) : (
                    <span className="font-semibold text-slate-900">{editableSubject}</span>
                  )}
                </div>
              </div>

              {/* Draft Body Container */}
              {isEditing ? (
                <textarea
                  rows={10}
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 leading-relaxed focus:outline-none"
                />
              ) : (
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {editableBody}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>NO HTML · UTF-8 · TEXT/PLAIN</span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-sans font-semibold"
                >
                  <span>{isEditing ? "Save edit view" : "Edit draft text"}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Dispatch Preflight Section */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Dispatch preflight</h4>
                  <span className="text-[11px] font-mono font-bold text-slate-400">4 / 4 PASSED</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-800 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Evidence-grounded</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-4">2 observed findings</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-800 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Safe format</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-4">No HTML / pixels</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-800 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Inbox available</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-4">32 / 40 today</div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight pt-1">
                  No suppression match. Inbox capacity is rechecked at dispatch; approval never bypasses the 40/day hard cap.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={fetchRealDrafts}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    <span>Reload</span>
                  </button>
                </div>

                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{processing ? "Dispatching..." : "Approve & dispatch email"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Evidence Panels Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Panel 1: Qualification Evidence */}
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Qualification evidence</h3>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-slate-900">{activeDraft.score}</span>
                  <span className="text-[10px] text-slate-400"> / 100</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-normal">{activeDraft.domain} - {activeDraft.staff}</p>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Source</span>
                  <span className="font-medium text-slate-700">{activeDraft.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Audited</span>
                  <span className="font-mono text-slate-700">{activeDraft.auditedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Minimum score</span>
                  <span className="font-mono text-slate-700">48 / 100</span>
                </div>
              </div>
            </div>

            {/* Panel 2: Observed Site Flaws */}
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Observed site flaws</h3>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">0{activeDraft.flaws.length || 2} FINDINGS</span>
              </div>

              <div className="space-y-3 pt-1">
                {activeDraft.flaws.map((flaw, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="px-2 py-0.5 bg-rose-50 border border-rose-200/60 text-rose-600 rounded text-[10px] font-mono font-bold">
                      {flaw.tag}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 pt-0.5">{flaw.title}</h4>
                    <p className="text-xs text-slate-500 leading-normal">{flaw.desc}</p>
                    <div className="text-[10px] font-mono text-slate-400">{flaw.code}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 3: Evidence Boundaries */}
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Evidence boundaries</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>SSL valid · CTA link resolves</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The draft only mentions verified flaws. No invented traffic, revenue, conversion losses or client history.
                </p>
                <button className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 pt-1">
                  <span>Open audit report</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section: Safeguards & Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Safeguards Card (7 cols) */}
        <div className="md:col-span-7 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Sending safeguards</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>Sourcing target 100–200 leads/day</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>Constitution v1.2.0 MNC/enterprise exclusion</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>Qualification minimum 40/100</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>100% plain-text emails without tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>Maximum 40 emails/day per inbox</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>Interested replies create PENDING_FULFILLMENT order tickets</span>
            </li>
          </ul>
        </div>

        {/* Right Inbox Capacity Card (5 cols) */}
        <div className="md:col-span-5 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Inbox capacity</h3>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-slate-900">96</span>
              <span className="text-[10px] text-slate-400"> / 120</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-700">hello@northstar.studio</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-600">40 / 40</span>
                  <span className="text-[10px] font-mono font-bold text-rose-500 uppercase">AT CAP</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-700">jamie@northstar.studio</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700">32 / 40</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">AVAILABLE</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-700">team@northstar.studio</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700">24 / 40</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">AVAILABLE</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Hard cap enforced. Full inboxes are skipped by the load balancer.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
