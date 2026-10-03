import React from "react";
import { GlassPanel } from "./GlassPanel";
import { cn } from "./GlassPanel";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  return (
    <GlassPanel className={cn("flex flex-col justify-between relative overflow-hidden", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-medium">
          {title}
        </span>
        {icon && <div className="p-2 rounded-lg bg-obsidian-800 text-silver-300">{icon}</div>}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold font-mono tracking-tight text-white">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
            {trend && <span className="text-accent-emerald font-medium">{trend}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </GlassPanel>
  );
};
