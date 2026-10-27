import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  className?: string;
  color?: "primary" | "warning" | "danger" | "info";
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  color = "primary",
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colors = {
    primary: "bg-emerald-600",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-stone-500">
          <span>Progres</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={cn("w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50", className)}>
        <div
          className={cn("h-full transition-all duration-300 rounded-full", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionText, onAction, icon }: EmptyStateProps) {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
      {icon && <div className="p-3 bg-white rounded-full border border-stone-200 text-stone-400 mb-3">{icon}</div>}
      <h4 className="text-sm font-semibold text-stone-800">{title}</h4>
      <p className="text-xs text-stone-500 max-w-sm mt-1">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

