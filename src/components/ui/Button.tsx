import React from "react";
import { cn } from "./GlassPanel";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variantStyles = {
    primary: "bg-silver-liquid text-obsidian-950 hover:bg-white shadow-md font-semibold",
    secondary: "bg-obsidian-850 text-silver-200 border border-zinc-700/60 hover:bg-obsidian-800 hover:border-zinc-500",
    danger: "bg-red-950/80 text-accent-red border border-red-800/80 hover:bg-accent-red hover:text-white shadow-red-glow",
    ghost: "bg-transparent text-silver-300 hover:text-white hover:bg-obsidian-800/50",
  };

  return (
    <button
      className={cn(base, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
