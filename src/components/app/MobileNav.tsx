"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Wallet,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: "/app/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/app/planner", label: "Planner", icon: CheckSquare },
    { href: "/app/habits", label: "Habit", icon: Repeat },
    { href: "/app/finance", label: "Keuangan", icon: Wallet },
    { href: "/app/goals", label: "Target", icon: Target },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-stone-200 z-40 flex items-center justify-around px-2 shadow-lg">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors",
              isActive ? "text-emerald-800 font-semibold" : "text-stone-500 hover:text-stone-800"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

