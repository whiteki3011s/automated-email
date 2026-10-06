"use client";

import React from "react";
import { Search, Bell } from "lucide-react";

interface HeaderProps {
  section: string;
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  section,
  title,
  description,
  actionButton,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 font-sans">
      {/* Top Utility Ribbon */}
      <div className="px-8 py-2.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>WORKSPACE</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">NORTHSTAR</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">DEMO DATA</span>
        </div>

        <div className="flex items-center gap-5">
          <span>06 OCT 2026 - 14:32 UTC</span>
          <div className="flex items-center gap-3">
            <button className="p-1 hover:text-slate-700 transition-colors">
              <Search className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 transition-colors relative">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                12
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Title Ribbon */}
      <div className="px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            {section}
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-slate-500 mt-1 font-normal max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actionButton && <div className="flex items-center gap-3">{actionButton}</div>}
      </div>
    </header>
  );
};
