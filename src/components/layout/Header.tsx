"use client";

import React from "react";
import { Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  title: string;
  description?: string;
  onTriggerPipeline?: () => void;
  isProcessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  onTriggerPipeline,
  isProcessing = false,
}) => {
  return (
    <header className="h-16 px-8 bg-obsidian-950/60 border-b border-zinc-800/40 flex items-center justify-between backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Terminal className="w-5 h-5 text-zinc-500" />
        <div>
          <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-zinc-400 font-sans">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onTriggerPipeline && (
          <Button
            onClick={onTriggerPipeline}
            disabled={isProcessing}
            variant="secondary"
            size="sm"
            className="gap-2 border-accent-red/40 hover:border-accent-red text-silver-100"
          >
            <Sparkles className="w-4 h-4 text-accent-red animate-pulse" />
            <span>{isProcessing ? "Processing Pipeline..." : "Run Engine Automation"}</span>
          </Button>
        )}
      </div>
    </header>
  );
};
