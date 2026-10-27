import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm flex flex-col justify-between transition-all hover:border-stone-300",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-stone-50 text-emerald-800">{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-stone-900 tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-semibold",
                  trend.isPositive ? "text-emerald-700" : "text-rose-600"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-stone-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

