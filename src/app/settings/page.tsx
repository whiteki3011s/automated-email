"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Settings, Mail, Plus, Save, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [inboxes, setInboxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingInbox, setSavingInbox] = useState(false);
  const [savingContext, setSavingContext] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form fields for new inbox
  const [senderName, setSenderName] = useState("Abhay Sharma");
  const [fromEmail, setFromEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [dailyLimit, setDailyLimit] = useState("40");
  const [serviceContext, setServiceContext] = useState(
    "High-end UI/UX redesign and Next.js performance optimization services."
  );

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/inbox");
      const data = await res.json();
      if (data.success) {
        setInboxes(data.inboxes || []);
        if (data.campaigns && data.campaigns.length > 0) {
          setServiceContext(data.campaigns[0].serviceContext || serviceContext);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveContext = async () => {
    try {
      setSavingContext(true);
      setSavedSuccess(false);
      const res = await fetch("/api/settings/inbox", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceContext }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingContext(false);
    }
  };

  const handleAddInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromEmail || !smtpHost) return;

    try {
      setSavingInbox(true);
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
        setFromEmail("");
        setSmtpHost("");
        setSmtpPass("");
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingInbox(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-obsidian-900">
      <Header
        title="Campaign & Inbox Settings"
        description="Configure SMTP sending credentials, daily inbox rate limits, and core service positioning context."
      />

      <div className="p-8 space-y-8 max-w-6xl">
        {/* Service Context Configuration */}
        <GlassPanel className="p-6 border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Settings className="w-4 h-4 text-silver-300" />
            <h3 className="font-mono font-bold text-sm text-white uppercase">
              Core Service Positioning Context
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            This positioning context is ingested by Google Gemini when drafting hyper-personalized cold outreach pitches.
          </p>
          <textarea
            rows={3}
            value={serviceContext}
            onChange={(e) => setServiceContext(e.target.value)}
            className="w-full p-3 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-xs font-sans text-white focus:outline-none focus:border-zinc-500 leading-relaxed resize-none"
          />
          <div className="flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Service context updated and saved to database!</span>
              </span>
            ) : <span />}
            <Button
              onClick={handleSaveContext}
              disabled={savingContext}
              variant="primary"
              size="sm"
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingContext ? "Saving..." : "Save Service Context"}</span>
            </Button>
          </div>
        </GlassPanel>

        {/* Connected Inboxes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider">
              Connected Sender Inboxes ({inboxes.length})
            </h3>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : inboxes.length === 0 ? (
            <GlassPanel className="p-6 text-center border-zinc-800 text-xs text-zinc-400">
              No custom SMTP inboxes connected yet. Default fallback simulation inbox active.
            </GlassPanel>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inboxes.map((inbox) => (
                <GlassPanel key={inbox.id} className="p-4 space-y-3 border-zinc-800 bg-obsidian-850">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="font-mono font-bold text-xs text-white">{inbox.fromEmail}</span>
                    </div>
                    <Badge variant="approved">{inbox.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                    <div>
                      <span>Sender: </span>
                      <span className="text-zinc-200">{inbox.senderName}</span>
                    </div>
                    <div>
                      <span>Rate Limit: </span>
                      <span className="text-emerald-400 font-bold">{inbox.dailyLimit} / day</span>
                    </div>
                    <div>
                      <span>Sent Today: </span>
                      <span className="text-zinc-200">{inbox.sentTodayCount}</span>
                    </div>
                    <div>
                      <span>SMTP Host: </span>
                      <span className="text-zinc-200">{inbox.smtpHost}</span>
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          )}
        </div>

        {/* Add New SMTP Inbox Form */}
        <GlassPanel className="p-6 border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono font-bold text-sm text-white uppercase">
              Connect New Sender Inbox (SMTP)
            </h3>
          </div>

          <form onSubmit={handleAddInbox} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-zinc-400">Sender Name:</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Abhay Sharma"
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400">From Email Address:</label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="abhay@outreach.io"
                required
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400">SMTP Host:</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                required
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400">SMTP Port:</label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400">SMTP Username:</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="user@domain.com"
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400">SMTP Password / App Token:</label>
              <input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-zinc-400">Daily Sending Rate Limit (Max 40 per constitution):</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                max={40}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-zinc-700/80 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <Button type="submit" disabled={savingInbox} variant="primary" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>{savingInbox ? "Saving Inbox..." : "Connect Inbox"}</span>
              </Button>
            </div>
          </form>
        </GlassPanel>
      </div>
    </main>
  );
}
