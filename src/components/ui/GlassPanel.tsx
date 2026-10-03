import React from "react";
import { cn } from "@/lib/utils";

export { cn };

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "glass-panel rounded-xl p-5 shadow-glass text-silver-liquid transition-all duration-200",
        hoverEffect && "glass-panel-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
