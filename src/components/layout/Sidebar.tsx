"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  FileCheck,
  Settings,
  Flame,
} from "lucide-react";
import { cn } from "@/components/ui/GlassPanel";

const navigationItems = [
  { name: "Command Center", href: "/", icon: LayoutDashboard },
  { name: "Lead Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Draft Approval", href: "/approval", icon: FileCheck },
  { name: "Settings & Inboxes", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-obsidian-950/90 border-r border-zinc-800/60 flex flex-col justify-between h-screen sticky top-0 z-30 backdrop-blur-md">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800/40">
          <div className="p-2 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red shadow-red-glow">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-sm font-mono text-white uppercase">
              Outreach Engine
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
              Autonomous OS v1.0
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all duration-150",
                  isActive
                    ? "bg-silver-liquid text-obsidian-950 font-semibold shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-obsidian-850"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-obsidian-950" : "text-zinc-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-4 rounded-xl glass-panel border-zinc-800/60 text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
          <span className="font-mono text-[11px] text-zinc-300 font-medium">Pipeline Active</span>
        </div>
        <p className="text-[10px] text-zinc-500 font-mono">
          Max 40/day per inbox rate limit enforced
        </p>
      </div>
    </aside>
  );
};
