import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-stone-100 text-stone-800 border-stone-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    warning: "bg-amber-50 text-amber-800 border-amber-200/60",
    danger: "bg-rose-50 text-rose-800 border-rose-200/60",
    info: "bg-sky-50 text-sky-800 border-sky-200/60",
    outline: "bg-transparent text-stone-700 border-stone-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

