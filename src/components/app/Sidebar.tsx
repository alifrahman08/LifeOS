"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Repeat,
  Target,
  Wallet,
  PieChart,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

interface SidebarProps {
  userRole: "USER" | "ADMIN" | "DEMO";
  userName: string;
  userEmail: string;
  unreadCount?: number;
  overdueCount?: number;
}

export function Sidebar({
  userRole,
  userName,
  userEmail,
  unreadCount = 0,
  overdueCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { href: "/app/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    {
      href: "/app/planner",
      label: "Smart Planner",
      icon: CheckSquare,
      badge: overdueCount > 0 ? `${overdueCount}` : undefined,
      badgeVariant: "danger",
    },
    { href: "/app/calendar", label: "Kalender", icon: Calendar },
    { href: "/app/habits", label: "Habit Tracker", icon: Repeat },
    { href: "/app/goals", label: "Target Saya", icon: Target },
    { href: "/app/finance", label: "Keuangan", icon: Wallet },
    { href: "/app/budgets", label: "Anggaran", icon: PieChart },
    { href: "/app/insights", label: "AI Insights", icon: Sparkles },
    { href: "/app/reports", label: "Laporan", icon: BarChart3 },
    {
      href: "/app/notifications",
      label: "Notifikasi",
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      badgeVariant: "warning",
    },
    { href: "/app/settings", label: "Pengaturan", icon: Settings },
  ];

  if (userRole === "ADMIN") {
    navItems.push({
      href: "/admin",
      label: "Admin Platform",
      icon: Shield,
    });
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-stone-200/90 bg-white transition-all duration-300 z-30 shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-stone-100 flex items-center justify-between">
        <Link href="/app/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
            L
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-stone-900 tracking-tight flex items-center gap-1.5">
                LifeOS
                {userRole === "DEMO" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    DEMO
                  </span>
                )}
                {userRole === "ADMIN" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                    ADMIN
                  </span>
                )}
              </span>
              <span className="text-[10px] text-stone-400">Personal Management</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors group relative",
                isActive
                  ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60 shadow-xs"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-emerald-800" : "text-stone-500 group-hover:text-stone-800"
                )}
              />
              {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                    item.badgeVariant === "danger"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-stone-100 bg-stone-50/50">
        <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
          <Link
            href="/app/profile"
            className="w-8 h-8 rounded-full bg-emerald-800/10 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 hover:ring-2 hover:ring-emerald-700/30 transition-all"
            title="Buka Profil"
          >
            {userName.charAt(0).toUpperCase()}
          </Link>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <Link href="/app/profile" className="block text-xs font-semibold text-stone-900 truncate hover:underline">
                {userName}
              </Link>
              <p className="text-[11px] text-stone-400 truncate">{userEmail}</p>
            </div>
          )}
          {!isCollapsed && (
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}

