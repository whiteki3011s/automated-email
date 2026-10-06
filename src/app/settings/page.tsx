"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Clock,
  CheckCircle2,
  Mail,
  Plus,
  ExternalLink,
  Shield,
  Zap,
  UserCheck,
  Building2,
  SlidersHorizontal,
  Check,
  X,
  RefreshCw
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "connections" | "constitution">("orders");
  const [humanApproval, setHumanApproval] = useState(true);
  const [inboxLoadBalancing, setInboxLoadBalancing] = useState(true);
  const [automaticHandoff, setAutomaticHandoff] = useState(true);
  const [immediateSuppression, setImmediateSuppression] = useState(true);

  const [sourcingTarget, setSourcingTarget] = useState("160 leads");
  const [sendingWindow, setSendingWindow] = useState("09:00–17:00");
  const [isSaved, setIsSaved] = useState(false);

  // Real DB state
  const [inboxes, setInboxes] = useState<any[]>([]);
  const [orderTickets, setOrderTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New inbox modal & form
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [senderName, setSenderName] = useState("Jamie Stone");
  const [fromEmail, setFromEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [dailyLimit, setDailyLimit] = useState("40");
  const [savingInbox, setSavingInbox] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [inboxRes, repliesRes] = await Promise.all([
        fetch("/api/settings/inbox"),
        fetch("/api/replies"),
      ]);

      const inboxData = await inboxRes.json();
      const repliesData = await repliesRes.json();

      if (inboxData.success && inboxData.inboxes) {
        setInboxes(inboxData.inboxes);
      }
      if (repliesData.success && repliesData.orderTickets) {
        setOrderTickets(repliesData.orderTickets);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = () => {
    setIsSaved(true);
    setStatusMessage("Configuration changes saved successfully.");
    setTimeout(() => {
      setIsSaved(false);
      setStatusMessage("");
    }, 3000);
  };

  const handleAddInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromEmail || !smtpHost) return;

    try {
      setSavingInbox(true);
      setStatusMessage("Testing and connecting SMTP inbox credentials...");
      const res = await fetch("/api/settings/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          fromEmail,
          smtpHost,
          smtpPort,
          smtpUser: smtpUser || fromEmail,
          smtpPass,
          dailyLimit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`SMTP inbox ${fromEmail} connected successfully!`);
        setFromEmail("");
        setSmtpHost("");
        setSmtpPass("");
        setIsConnectModalOpen(false);
        fetchSettings();
      } else {
        setStatusMessage(data.error || "Failed to add inbox");
      }
    } catch (err: any) {
      setStatusMessage(err.message || "Error connecting inbox");
    } finally {
      setSavingInbox(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
            WORKSPACE / CONFIGURATION & FULFILLMENT
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Settings & orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            The engine creates the opportunity. You own the delivery. Configure the guardrails and fulfill incoming orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-2 transition-all">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Audit log</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? "Saved!" : "Save configuration"}</span>
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

      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Orders & configuration
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "connections"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Connections
          </button>
          <button
            onClick={() => setActiveTab("constitution")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "constitution"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Constitution
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400">LAST SAVED 14:20 UTC</div>
      </div>

      {/* Main Grid: Orders & SMTP Accounts (Left), Constitution & Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Client Order Tickets */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Client order tickets</h2>
              <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200/60 text-rose-600 rounded-full text-xs font-mono font-bold">
                0{orderTickets.length || 3} PENDING FULFILLMENT
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Created automatically from INTERESTED_ORDER replies. No delivery is started without an operator.</span>
            </p>

            {/* Real DB tickets or demo fallback */}
            {orderTickets.length > 0 ? (
              orderTickets.map((ticket: any) => (
                <div key={ticket.id} className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{ticket.lead?.domain || "Client Domain"}</h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ORD-{ticket.id.slice(-4).toUpperCase()} · CREATED RECENTLY
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Contact: <span className="font-mono text-slate-700">{ticket.lead?.contactEmail || `hello@${ticket.lead?.domain}`}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[10px] font-mono font-bold tracking-wide">
                      {ticket.status || "PENDING_FULFILLMENT"}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200/80 rounded-lg space-y-1 text-xs">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">EXTRACTED CLIENT NEEDS</div>
                    <h4 className="font-bold text-slate-900">{ticket.summary}</h4>
                    <p className="text-slate-600 leading-relaxed">{ticket.clientNeeds}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400">Unassigned · Budget not specified</span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                        Assign to me
                      </button>
                      <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5">
                        <span>Start fulfillment</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Ticket 1: Cedar & Clay */}
                <div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Cedar & Clay</h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ORD-1042 · CREATED 14:18 UTC
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Maya Chen · <span className="font-mono text-slate-700">maya@cedarandclay.co</span> · Owner · Austin, TX
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[10px] font-mono font-bold tracking-wide">
                      PENDING_FULFILLMENT
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200/80 rounded-lg space-y-1 text-xs">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">EXTRACTED CLIENT NEEDS</div>
                    <h4 className="font-bold text-slate-900">Mobile booking flow redesign</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Fix workshop booking on mobile; keep the current brand and booking provider. Requested timeline: before the November workshop launch.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-100/80 border border-slate-200/60 rounded-lg space-y-1 text-xs">
                    <div className="text-[10px] font-mono text-slate-500">
                      INTERESTED_ORDER · RE: WORKSHOP BOOKING ON MOBILE
                    </div>
                    <p className="text-slate-800 italic font-mono text-[11px] leading-relaxed">
                      &quot;Yes, we&apos;d like help with the mobile booking flow. Can you keep our existing booking tool and get it ready before our November workshops?&quot;
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400">Unassigned · Budget not specified</span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                        Assign to me
                      </button>
                      <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5">
                        <span>Start fulfillment</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ticket 2: Harbor Dental */}
                <div className="p-4 bg-slate-50/50 border border-slate-200/70 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Harbor Dental</h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ORD-1041 · 13:46 UTC · Dr. Elena Park · elena@harbordental.co
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[10px] font-mono font-bold">
                      PENDING_FULFILLMENT
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">SSL repair + appointment request flow</p>
                  <p className="text-xs text-slate-500 italic font-mono text-[11px]">
                    &quot;Please send a scope for the SSL fix and a simpler appointment form. We&apos;d like to move forward.&quot;
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/50">
                    <span>Unassigned · Timeline / budget not specified</span>
                    <button className="text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-1">
                      <span>Open ticket</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ticket 3: Forma Pilates */}
                <div className="p-4 bg-slate-50/50 border border-slate-200/70 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Forma Pilates</h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ORD-1040 · 12:52 UTC · Nina Brooks · nina@formapilates.co
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[10px] font-mono font-bold">
                      PENDING_FULFILLMENT
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Local SEO tags + trial-class CTA</p>
                  <p className="text-xs text-slate-500 italic font-mono text-[11px]">
                    &quot;Let&apos;s do the local SEO updates and make the trial-class button easier to find. What do you need from us?&quot;
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/50">
                    <span>Unassigned · Timeline / budget not specified</span>
                    <button className="text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-1">
                      <span>Open ticket</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Connected SMTP accounts */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Connected SMTP accounts</h2>
              <span className="text-xs font-mono font-semibold text-slate-400">LOAD BALANCING ON</span>
            </div>

            {/* SMTP List */}
            <div className="space-y-3">
              {inboxes.length > 0 && inboxes.map((inbox: any) => (
                <div key={inbox.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-mono font-bold text-slate-900">{inbox.fromEmail}</div>
                      <div className="text-slate-400 text-[11px]">Sender: {inbox.senderName} · TLS · SPF/DKIM</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right font-mono">
                    <div>
                      <span className="font-bold text-slate-900">{inbox.sentTodayCount || 0} / {inbox.dailyLimit || 40}</span>
                      <span className="text-slate-400 text-[10px] block">today</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="font-mono font-bold text-slate-900">hello@northstar.studio</div>
                    <div className="text-slate-400 text-[11px]">Connected · TLS · SPF / DKIM verified</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right font-mono">
                  <div>
                    <span className="font-bold text-rose-600">40 / 40</span>
                    <span className="text-slate-400 text-[10px] block">today</span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[10px] font-bold">
                    AT CAP
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="font-mono font-bold text-slate-900">jamie@northstar.studio</div>
                    <div className="text-slate-400 text-[11px]">Connected · TLS · SPF / DKIM verified</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right font-mono">
                  <div>
                    <span className="font-bold text-slate-900">32 / 40</span>
                    <span className="text-slate-400 text-[10px] block">today</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold">
                    AVAILABLE
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="font-mono font-bold text-slate-900">team@northstar.studio</div>
                    <div className="text-slate-400 text-[11px]">Connected · TLS · SPF / DKIM verified</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right font-mono">
                  <div>
                    <span className="font-bold text-slate-900">24 / 40</span>
                    <span className="text-slate-400 text-[10px] block">today</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold">
                    AVAILABLE
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-400">Hard limit: 40 emails / inbox / day. Reset 00:00 UTC.</span>
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect inbox</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Constitution Summary Card */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Constitution</h2>
              <span className="text-xs font-mono font-semibold text-slate-400">v1.2.0 · ACTIVE</span>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Target SMBs & growth businesses</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Exclude multinational corporations</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Exclude Fortune 500 companies</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Exclude enterprise conglomerates</span>
              </li>
            </ul>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Qualification minimum</span>
              <span className="font-mono font-bold text-slate-900">40 / 100</span>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Outreach must reference observed website or profile flaws, never speculative business losses.
            </p>
          </div>

          {/* Automation Controls Card */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Automation controls</h2>
              <span className="text-xs font-mono font-semibold text-slate-400">ENABLED</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Daily Sourcing Target */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Daily sourcing target</div>
                  <div className="text-slate-400 text-[11px]">Allowed range: 100–200 per day</div>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-xs">
                  {sourcingTarget}
                </div>
              </div>

              {/* Sending Window */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Sending window</div>
                  <div className="text-slate-400 text-[11px]">UTC · Weekdays only</div>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-xs">
                  {sendingWindow}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-semibold text-slate-900">Human draft approval</div>
                  <div className="text-slate-400 text-[11px]">Require review before any outbound send.</div>
                </div>
                <button
                  onClick={() => setHumanApproval(!humanApproval)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${
                    humanApproval ? "bg-slate-900 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Inbox load balancing</div>
                  <div className="text-slate-400 text-[11px]">Skip inboxes at the 40/day hard cap.</div>
                </div>
                <button
                  onClick={() => setInboxLoadBalancing(!inboxLoadBalancing)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${
                    inboxLoadBalancing ? "bg-slate-900 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Automatic order handoff</div>
                  <div className="text-slate-400 text-[11px]">Interested replies → client order tickets.</div>
                </div>
                <button
                  onClick={() => setAutomaticHandoff(!automaticHandoff)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${
                    automaticHandoff ? "bg-slate-900 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Immediate suppression</div>
                  <div className="text-slate-400 text-[11px]">Unsubscribe intent blocks all future outreach.</div>
                </div>
                <button
                  onClick={() => setImmediateSuppression(!immediateSuppression)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${
                    immediateSuppression ? "bg-slate-900 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>
          </div>

          {/* Sourcing Connections Card */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Sourcing connections</h2>
              <span className="text-xs font-mono font-semibold text-slate-400">5 CONNECTED</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Google Maps / SerpAPI</span>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Business directories</span>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Instagram</span>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">LinkedIn</span>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">X / Twitter</span>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect SMTP Inbox Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Connect new SMTP inbox</h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddInbox} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">From Email</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="outreach@domain.com"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.mailtrap.io"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">SMTP Username</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="smtp_user"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">SMTP Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInbox}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  {savingInbox ? "Saving..." : "Connect inbox"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
