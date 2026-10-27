"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Shield,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/notifications";

interface TopbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN" | "DEMO";
  };
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
    link?: string | null;
  }>;
}

export function Topbar({ user, notifications = [] }: TopbarProps) {
  const pathname = usePathname();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Generate dynamic page title based on pathname
  const getPageInfo = () => {
    if (pathname.includes("/planner")) return { title: "Smart Planner", subtitle: "Manajemen Tugas & Prioritas" };
    if (pathname.includes("/calendar")) return { title: "Kalender", subtitle: "Jadwal & Agenda Aktivitas" };
    if (pathname.includes("/habits")) return { title: "Habit Tracker", subtitle: "Pelacakan Kebiasaan & Streak" };
    if (pathname.includes("/goals")) return { title: "Target Saya", subtitle: "Milestone & Capaian Jangka Panjang" };
    if (pathname.includes("/finance")) return { title: "Keuangan Pribadi", subtitle: "Arus Kas & Rekap Transaksi" };
    if (pathname.includes("/budgets")) return { title: "Anggaran & Tabungan", subtitle: "Batas Pengeluaran Bulanan" };
    if (pathname.includes("/insights")) return { title: "AI Insights", subtitle: "Rekomendasi Terarah & Analisis Pola" };
    if (pathname.includes("/reports")) return { title: "Laporan & Analitik", subtitle: "Evaluasi Produktivitas & Tren" };
    if (pathname.includes("/notifications")) return { title: "Notifikasi", subtitle: "Pemberitahuan & Pengingat" };
    if (pathname.includes("/profile")) return { title: "Profil Pengguna", subtitle: "Informasi Akun Pribadi" };
    if (pathname.includes("/settings")) return { title: "Pengaturan", subtitle: "Preferensi & Privasi Data" };
    if (pathname.includes("/admin")) return { title: "Admin Platform", subtitle: "Operasional & Monitoring Sistem" };
    return { title: "Ringkasan Aktivitas", subtitle: "Selamat Datang di LifeOS" };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-stone-200/90 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Breadcrumb */}
      <div>
        <h1 className="text-base font-bold text-stone-900 tracking-tight">{title}</h1>
        <p className="text-[11px] text-stone-500 hidden sm:block">{subtitle}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-500 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline">Cari tugas, habit, anggaran...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border rounded text-stone-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 relative transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notif Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">
                  Notifikasi ({unreadNotifs.length})
                </span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={async () => {
                      await markAllNotificationsReadAction();
                      setShowNotifMenu(false);
                    }}
                    className="text-[11px] text-emerald-800 hover:underline font-medium"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto px-2 py-2 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6">Tidak ada notifikasi baru.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        if (!n.isRead) await markNotificationReadAction(n.id);
                        if (n.link) window.location.href = n.link;
                      }}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        !n.isRead
                          ? "bg-emerald-50/70 border border-emerald-200/50 hover:bg-emerald-50"
                          : "hover:bg-stone-50 text-stone-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-stone-100 text-center">
                <Link
                  href="/app/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-medium text-emerald-800 hover:underline"
                >
                  Lihat Semua Notifikasi →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                <div className="mt-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    Role: {user.role}
                  </span>
                </div>
              </div>

              <div className="py-1 text-xs text-stone-700">
                <Link
                  href="/app/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  Profil Akun
                </Link>
                <Link
                  href="/app/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50"
                >
                  <Settings className="w-4 h-4 text-stone-400" />
                  Pengaturan & Privasi
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 text-purple-800"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    Admin Platform
                  </Link>
                )}
              </div>

              <div className="border-t border-stone-100 pt-1">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar dari LifeOS
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-3 border-b border-stone-100 flex items-center gap-2.5">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik untuk mencari tugas, target, atau keuangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none text-stone-900 placeholder:text-stone-400"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-2 py-1 text-xs text-stone-400 hover:text-stone-700 bg-stone-100 rounded"
              >
                Tutup (Esc)
              </button>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto text-xs text-stone-600 space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Navigasi Cepat
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/app/planner"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-lg bg-stone-50 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200/60 block"
                >
                  <span className="font-semibold block text-stone-800">Smart Planner</span>
                  <span className="text-[11px] text-stone-500">Kelola daftar tugas</span>
                </Link>
                <Link
                  href="/app/habits"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-lg bg-stone-50 hover:bg-sky-50 hover:text-sky-900 border border-stone-200/60 block"
                >
                  <span className="font-semibold block text-stone-800">Habit Tracker</span>
                  <span className="text-[11px] text-stone-500">Check-in kebiasaan harian</span>
                </Link>
                <Link
                  href="/app/finance"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-lg bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-200/60 block"
                >
                  <span className="font-semibold block text-stone-800">Keuangan</span>
                  <span className="text-[11px] text-stone-500">Catat pemasukan & pengeluaran</span>
                </Link>
                <Link
                  href="/app/goals"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-lg bg-stone-50 hover:bg-purple-50 hover:text-purple-900 border border-stone-200/60 block"
                >
                  <span className="font-semibold block text-stone-800">Target Saya</span>
                  <span className="text-[11px] text-stone-500">Evaluasi pencapaian</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
