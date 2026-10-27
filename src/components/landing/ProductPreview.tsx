"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Repeat,
  Wallet,
  Target,
  Clock,
  AlertCircle,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

type PreviewTab = "planner" | "habits" | "finance" | "goals";

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("planner");

  // State lokal untuk simulasi interaktif
  const [demoTasks, setDemoTasks] = useState([
    {
      id: "t1",
      title: "Review Kontrak Kerja Sama Vendor Cloud",
      priority: "URGENT",
      dueDate: "Hari ini, 14:00",
      completed: false,
      reason: "Jatuh tempo hari ini • Ditandai mendesak",
    },
    {
      id: "t2",
      title: "Kirim Laporan Retrospektif Sprint Q4",
      priority: "HIGH",
      dueDate: "Kemarin (Terlambat)",
      completed: false,
      isOverdue: true,
      reason: "Terlambat 1 hari • Bobot tinggi",
    },
    {
      id: "t3",
      title: "Daily Standup & Sync Blocker Arsitektur",
      priority: "MEDIUM",
      dueDate: "Hari ini, 09:30",
      completed: true,
      reason: "Tugas telah diselesaikan",
    },
  ]);

  const [demoHabits, setDemoHabits] = useState([
    {
      id: "h1",
      name: "Minum Air 2.500 ml",
      streak: 14,
      target: "2.500 ml",
      current: "2.500 ml",
      completedToday: true,
      color: "bg-sky-500",
    },
    {
      id: "h2",
      name: "Membaca Buku 20 Menit",
      streak: 12,
      target: "20 menit",
      current: "25 menit",
      completedToday: true,
      color: "bg-purple-500",
    },
    {
      id: "h3",
      name: "Olahraga Fisik 30 Menit",
      streak: 5,
      target: "30 menit",
      current: "0 menit",
      completedToday: false,
      color: "bg-emerald-500",
    },
  ]);

  const toggleTask = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const toggleHabit = (id: string) => {
    setDemoHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: !h.completedToday ? h.streak + 1 : h.streak - 1,
            }
          : h
      )
    );
  };

  return (
    <section className="py-12 bg-stone-100/60 border-y border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Header Preview */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Antarmuka yang Dirancang untuk Ketenangan Pikiran
          </h2>
          <p className="mt-2 text-sm text-stone-600 max-w-xl mx-auto">
            Klik dan coba langsung modul-modul LifeOS di bawah ini. Semua data saling terintegrasi secara otomatis.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1.5 bg-stone-200/70 rounded-xl gap-1 text-xs sm:text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "planner"
                  ? "bg-white text-stone-950 shadow-sm font-semibold"
                  : "hover:text-stone-900"
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              Smart Planner
            </button>
            <button
              onClick={() => setActiveTab("habits")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "habits"
                  ? "bg-white text-stone-950 shadow-sm font-semibold"
                  : "hover:text-stone-900"
              }`}
            >
              <Repeat className="w-4 h-4 text-sky-700" />
              Habit Tracker
            </button>
            <button
              onClick={() => setActiveTab("finance")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "finance"
                  ? "bg-white text-stone-950 shadow-sm font-semibold"
                  : "hover:text-stone-900"
              }`}
            >
              <Wallet className="w-4 h-4 text-amber-700" />
              Keuangan & Anggaran
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "goals"
                  ? "bg-white text-stone-950 shadow-sm font-semibold"
                  : "hover:text-stone-900"
              }`}
            >
              <Target className="w-4 h-4 text-purple-700" />
              Target & Milestone
            </button>
          </div>
        </div>

        {/* Browser Mockup Window */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden">
          {/* Mockup Titlebar */}
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-[11px] ml-2 text-stone-400">
                app.lifeos.id/{activeTab}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Data Tersinkronisasi
            </div>
          </div>

          {/* Interactive Content View */}
          <div className="p-6 sm:p-8 min-h-[380px] bg-stone-50/40">
            {/* 1. PLANNER PREVIEW */}
            {activeTab === "planner" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      Smart Focus: Tugas Prioritas Terhitung
                    </h3>
                    <p className="text-xs text-stone-500">
                      Algoritma transparan menyusun urutan berdasarkan kedekatan deadline dan beban usaha.
                    </p>
                  </div>
                  <Badge variant="info">3 Tugas Hari Ini</Badge>
                </div>

                <div className="space-y-2.5">
                  {demoTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        task.completed
                          ? "bg-stone-50/80 border-stone-200 opacity-60"
                          : task.isOverdue
                          ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                          : "bg-white border-stone-200/90 hover:border-emerald-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            task.completed
                              ? "bg-emerald-700 border-emerald-700 text-white"
                              : "border-stone-300 bg-white"
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              task.completed
                                ? "line-through text-stone-400"
                                : "text-stone-900"
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                            <span>•</span>
                            <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                              {task.reason}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          task.priority === "URGENT"
                            ? "danger"
                            : task.priority === "HIGH"
                            ? "warning"
                            : "default"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-stone-400 text-center italic pt-2">
                  Tip: Klik kartu tugas di atas untuk mensimulasikan penyelesaian langsung.
                </p>
              </div>
            )}

            {/* 2. HABITS PREVIEW */}
            {activeTab === "habits" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      Habit Tracker & Streak Aktif
                    </h3>
                    <p className="text-xs text-stone-500">
                      Bangun kebiasaan harian dengan konsistensi tanpa celah.
                    </p>
                  </div>
                  <Badge variant="success">Konsistensi 91%</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {demoHabits.map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        habit.completedToday
                          ? "bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/10"
                          : "bg-stone-50 border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {habit.streak} Hari
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              habit.completedToday
                                ? "bg-emerald-700 text-white"
                                : "border border-stone-300 text-transparent"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                        <h4 className="text-sm font-semibold text-stone-900">{habit.name}</h4>
                        <p className="text-xs text-stone-500 mt-1">Target: {habit.target}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500">Status Hari Ini:</span>
                        <span
                          className={`font-semibold ${
                            habit.completedToday ? "text-emerald-700" : "text-stone-400"
                          }`}
                        >
                          {habit.completedToday ? "Selesai ✓" : "Belum Check-in"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-3 text-xs text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Insight Otomatis:</strong> Momentum membaca Anda berjalan luar biasa.
                    Pola 12 hari berturut-turut telah terverifikasi dalam zona waktu Anda.
                  </span>
                </div>
              </div>
            )}

            {/* 3. FINANCE PREVIEW */}
            {activeTab === "finance" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      Kesadaran Finansial Tanpa Menghakimi
                    </h3>
                    <p className="text-xs text-stone-500">
                      Pencatatan presisi berbasis Rupiah dengan batas anggaran transparan.
                    </p>
                  </div>
                  <Badge variant="success">Cash Flow Surplus</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <span className="text-xs text-stone-500 font-medium">Pemasukan Bulan Ini</span>
                    <p className="text-xl font-bold text-emerald-700 mt-1">
                      {formatCurrency(26500000)}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-medium">↑ +25% vs bulan lalu</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <span className="text-xs text-stone-500 font-medium">Pengeluaran Aktual</span>
                    <p className="text-xl font-bold text-stone-900 mt-1">
                      {formatCurrency(8650000)}
                    </p>
                    <span className="text-[11px] text-stone-500">33% dari total pemasukan</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <span className="text-xs text-stone-500 font-medium">Arus Kas Bersih (Surplus)</span>
                    <p className="text-xl font-bold text-emerald-800 mt-1">
                      {formatCurrency(17850000)}
                    </p>
                    <span className="text-[11px] text-emerald-700 font-medium">Rasio tabungan: 67%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-stone-800">
                    <span>Penggunaan Anggaran: Makanan & Minuman</span>
                    <span className="text-amber-700 font-bold">73% (Rp 2.550.000 / Rp 3.500.000)</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border">
                    <div className="h-full bg-amber-500 rounded-full transition-all w-[73%]" />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Sisa anggaran Rp 950.000 aman untuk 4 hari ke depan sebelum reset bulan baru.
                  </p>
                </div>
              </div>
            )}

            {/* 4. GOALS PREVIEW */}
            {activeTab === "goals" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      Target Bermakna & Milestone Bertahap
                    </h3>
                    <p className="text-xs text-stone-500">
                      Terhubung langsung dengan alokasi tabungan dan penyelesaian tugas harian.
                    </p>
                  </div>
                  <Badge variant="info">2 Target Aktif</Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        Keuangan Jangka Panjang
                      </span>
                      <span className="text-xs font-bold text-stone-800">62% Terkumpul</span>
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900">
                      Dana Darurat 6 Bulan (Rp 30.000.000)
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Terkumpul {formatCurrency(18500000)} dari target {formatCurrency(30000000)}.
                    </p>
                    <div className="mt-3 w-full h-2 bg-stone-100 rounded-full overflow-hidden border">
                      <div className="h-full bg-purple-600 rounded-full transition-all w-[62%]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Pengembangan Karir
                      </span>
                      <span className="text-xs font-bold text-stone-800">1 dari 3 Milestone Selesai</span>
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900">
                      Sertifikasi Professional Architect
                    </h4>
                    <div className="mt-3 w-full h-2 bg-stone-100 rounded-full overflow-hidden border">
                      <div className="h-full bg-emerald-600 rounded-full transition-all w-[33%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

