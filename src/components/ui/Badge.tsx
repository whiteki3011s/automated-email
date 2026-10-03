import React from "react";
import { cn } from "./GlassPanel";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "sourced" | "scraped" | "drafted" | "approved" | "sent" | "replied" | "rejected" | "default";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
}) => {
  const variantStyles = {
    sourced: "bg-obsidian-800 text-silver-300 border-zinc-700",
    scraped: "bg-blue-950/60 text-blue-400 border-blue-800/50",
    drafted: "bg-amber-950/60 text-amber-400 border-amber-800/50",
    approved: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
    sent: "bg-purple-950/60 text-purple-400 border-purple-800/50",
    replied: "bg-teal-950/60 text-teal-300 border-teal-800/50",
    rejected: "bg-red-950/60 text-accent-red border-red-800/50",
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
