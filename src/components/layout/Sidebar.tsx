"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  FileCheck,
  Settings,
  ChevronDown,
} from "lucide-react";

const navigationItems = [
  { name: "Command center", href: "/", icon: LayoutDashboard, badge: null },
  { name: "Lead pipeline", href: "/pipeline", icon: Kanban, badge: "84" },
  { name: "Draft approvals", href: "/approval", icon: FileCheck, badge: "12", badgeDanger: true },
  { name: "Settings & orders", href: "/settings", icon: Settings, badge: "03" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 font-sans">
      <div>
        {/* AXIOM Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-mono font-bold text-base shadow-sm">
            ▲
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-sm text-slate-900 uppercase font-mono">
              AXIOM
            </h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">
              BUSINESS ENGINE
            </p>
          </div>
        </div>

        {/* Workspace Dropdown */}
        <div className="p-4 border-b border-slate-100">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-all text-xs">
            <span className="font-medium text-slate-800">Northstar Studio</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Operations Navigation */}
        <div className="p-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            Operations
          </p>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                      item.badgeDanger
                        ? "bg-rose-100 text-rose-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Status & Profile */}
      <div className="p-4 space-y-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-slate-900 uppercase tracking-wider">ENGINE ONLINE</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Front-of-house on autopilot. You focus on fulfillment.
          </p>
          <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>CONSTITUTION</span>
            <span>v1.2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs font-mono">
            JS
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate">Jamie Stone</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">Workspace operator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
