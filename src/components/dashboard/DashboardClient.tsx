"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Flame,
  ArrowRight,
  Plus,
  Sparkles,
  Calendar,
  Wallet,
  Target,
  CheckSquare,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatDateID } from "@/lib/utils";
import { toggleTaskCompleteAction } from "@/actions/tasks";
import { toggleHabitCheckInAction } from "@/actions/habits";

interface DashboardClientProps {
  userName: string;
  metrics: {
    tasksCompletedToday: number;
    tasksRemainingToday: number;
    habitCompletionRate: number;
    totalIncomeMonth: number;
    totalExpenseMonth: number;
    budgetUsagePercent: number;
    activeGoalsCount: number;
  };
  focusTasks: Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    dueTime: string | null;
    priority: string;
    status: string;
    estimatedDuration: number | null;
    priorityInfo: {
      score: number;
      level: string;
      reason: string;
      isOverdue: boolean;
      daysUntilDue: number | null;
    };
  }>;
  habits: Array<{
    id: string;
    name: string;
    targetType: string;
    targetValue: number | null;
    unit: string | null;
    color: string;
    icon: string;
    stats: {
      currentStreak: number;
      bestStreak: number;
      completedToday: boolean;
      todayValue?: number;
    };
  }>;
  todayAgenda: Array<{
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    category: string;
    location: string | null;
  }>;
  activeGoals: Array<{
    id: string;
    title: string;
    category: string;
    targetType: string;
    targetValue: number;
    currentValue: number;
    unit: string | null;
    targetDate: Date | null;
  }>;
  budgetAlerts: Array<{
    categoryName: string;
    budgetAmount: number;
    spentAmount: number;
    usagePercentage: number;
    isExceeded: boolean;
  }>;
  weeklyProductivity: Array<{
    day: string;
    completed: number;
    created: number;
  }>;
  cashflowTrends: Array<{
    month: string;
    pemasukan: number;
    pengeluaran: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    recommendation: string;
    actionText?: string;
    actionUrl?: string;
  }>;
  announcement?: {
    title: string;
    content: string;
    type: string;
  } | null;
}

export function DashboardClient({
  userName,
  metrics,
  focusTasks: initialFocusTasks,
  habits: initialHabits,
  todayAgenda,
  activeGoals,
  budgetAlerts,
  weeklyProductivity,
  cashflowTrends,
  recommendations,
  announcement,
}: DashboardClientProps) {
  const [tasks, setTasks] = useState(initialFocusTasks);
  const [habitList, setHabitList] = useState(initialHabits);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string) => {
    setActionLoading(`task-${taskId}`);
    try {
      const res = await toggleTaskCompleteAction(taskId);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: t.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED" }
              : t
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Habit Check-in
  const handleToggleHabit = async (habitId: string) => {
    setActionLoading(`habit-${habitId}`);
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const res = await toggleHabitCheckInAction(habitId, todayStr);
      if (res.success) {
        setHabitList((prev) =>
          prev.map((h) => {
            if (h.id === habitId) {
              const isNowDone = !h.stats.completedToday;
              return {
                ...h,
                stats: {
                  ...h.stats,
                  completedToday: isNowDone,
                  currentStreak: isNowDone ? h.stats.currentStreak + 1 : Math.max(0, h.stats.currentStreak - 1),
                },
              };
            }
            return h;
          })
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const todayFormatted = formatDateID(new Date());

  return (
    <div className="space-y-6">
      {/* A. Sapaan Personal & Tanggal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Selamat Datang, {userName}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{todayFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/planner">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Tugas Baru
            </Button>
          </Link>
          <Link href="/app/finance">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              Catat Transaksi
            </Button>
          </Link>
        </div>
      </div>

      {/* Pengumuman Platform jika ada */}
      {announcement && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-emerald-900">{announcement.title}</h4>
            <p className="text-emerald-800/90 mt-0.5 leading-relaxed">{announcement.content}</p>
          </div>
        </div>
      )}

      {/* Peringatan Anggaran Kritis jika ada */}
      {budgetAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <h4 className="font-bold text-amber-900">Perhatian: Pengeluaran Mendekati Batas Anggaran</h4>
            <div className="mt-1 space-y-1">
              {budgetAlerts.map((b, i) => (
                <p key={i} className="text-amber-800">
                  Kategori <strong>{b.categoryName}</strong> telah mencapai{" "}
                  <strong>{b.usagePercentage}%</strong> ({formatCurrency(b.spentAmount)} /{" "}
                  {formatCurrency(b.budgetAmount)}).
                </p>
              ))}
            </div>
          </div>
          <Link href="/app/budgets" className="text-xs font-semibold text-amber-900 hover:underline shrink-0">
            Kelola Anggaran →
          </Link>
        </div>
      )}

      {/* B. Ringkasan Metrik Aktual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Tugas Hari Ini"
          value={`${metrics.tasksCompletedToday} Selesai`}
          subtitle={`${metrics.tasksRemainingToday} tersisa`}
          icon={<CheckSquare className="w-4 h-4" />}
        />
        <StatCard
          title="Konsistensi Habit"
          value={`${metrics.habitCompletionRate}%`}
          subtitle="Penyelesaian 30 hari"
          icon={<Flame className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={formatCurrency(metrics.totalExpenseMonth)}
          subtitle={`Pemasukan: ${formatCurrency(metrics.totalIncomeMonth)}`}
          icon={<Wallet className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Target Aktif"
          value={`${metrics.activeGoalsCount} Target`}
          subtitle="Milestone & tabungan"
          icon={<Target className="w-4 h-4 text-purple-700" />}
        />
      </div>

      {/* Grid Utama Dashboard: 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Fokus Tugas Hari Ini & Habit Check-in (2 Kolom Lebar) */}
        <div className="lg:col-span-2 space-y-6">
          {/* D. Daftar Tugas Prioritas */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-800" />
                  Prioritas Utama Hari Ini
                </CardTitle>
                <p className="text-xs text-stone-500 mt-0.5">
                  Diurutkan berdasarkan algoritma Smart Planner yang transparan.
                </p>
              </div>
              <Link href="/app/planner" className="text-xs font-semibold text-emerald-800 hover:underline">
                Buka Planner →
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  Tidak ada tugas prioritas yang mendesak hari ini. Kerja bagus! ✨
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      task.status === "COMPLETED"
                        ? "bg-stone-50/80 border-stone-200 opacity-60"
                        : task.priorityInfo.isOverdue
                        ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                        : "bg-white border-stone-200/90 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        disabled={actionLoading === `task-${task.id}`}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-700 border-emerald-700 text-white"
                            : "border-stone-300 bg-white hover:border-emerald-600"
                        }`}
                      >
                        {task.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            task.status === "COMPLETED" ? "line-through text-stone-400" : "text-stone-900"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-500">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {task.dueTime ? `${task.dueTime} • ` : ""}
                              {formatDateID(task.dueDate)}
                            </span>
                          )}
                          <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            {task.priorityInfo.reason}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.priorityInfo.level === "URGENT"
                          ? "danger"
                          : task.priorityInfo.level === "HIGH"
                          ? "warning"
                          : "default"
                      }
                    >
                      {task.priorityInfo.level}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* E. Widget Check-in Habit */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Check-in Kebiasaan Hari Ini
                </CardTitle>
                <p className="text-xs text-stone-500 mt-0.5">
                  Klik untuk menandai kebiasaan yang telah Anda jalankan hari ini.
                </p>
              </div>
              <Link href="/app/habits" className="text-xs font-semibold text-emerald-800 hover:underline">
                Semua Habit →
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {habitList.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      habit.stats.completedToday
                        ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          habit.stats.completedToday
                            ? "bg-emerald-700 text-white"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {habit.stats.completedToday ? <CheckCircle2 className="w-4 h-4" /> : "○"}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{habit.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                          <span className="flex items-center gap-0.5 text-amber-700 font-semibold">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {habit.stats.currentStreak} hari
                          </span>
                          <span>•</span>
                          <span>
                            {habit.stats.completedToday ? "Selesai" : `Target: ${habit.targetValue || 1} ${habit.unit || ""}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* F & G. Grafik Visual: Produktivitas & Arus Kas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Produktivitas Mingguan */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-bold">Produktivitas 7 Hari Terakhir</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProductivity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#999" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                        formatter={(val: number) => [`${val} Tugas`, "Selesai"]}
                      />
                      <Bar dataKey="completed" fill="#15803d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Arus Kas Bulanan */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-bold">Pemasukan vs Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashflowTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                      <YAxis
                        tick={{ fontSize: 9 }}
                        stroke="#999"
                        tickFormatter={(val) => `${val / 1000000}M`}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                        formatter={(val: number) => [formatCurrency(val), ""]}
                      />
                      <Bar dataKey="pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Kolom Kanan: Agenda Hari Ini, Progres Target, & AI Insights (1 Kolom) */}
        <div className="space-y-6">
          {/* C. Agenda Hari Ini */}
          <Card>
            <CardHeader className="py-3.5">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                Agenda & Acara Hari Ini
              </CardTitle>
              <Link href="/app/calendar" className="text-xs font-semibold text-emerald-800 hover:underline">
                Kalender →
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {todayAgenda.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">
                  Tidak ada agenda terjadwal untuk hari ini.
                </p>
              ) : (
                todayAgenda.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-stone-900">
                      <span>{event.title}</span>
                      <span className="text-[10px] text-emerald-800 font-mono">
                        {new Date(event.startTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-[11px] text-stone-500">📍 {event.location}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* I. Kartu Progres Target */}
          <Card>
            <CardHeader className="py-3.5">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-purple-700" />
                Perkembangan Target Utama
              </CardTitle>
              <Link href="/app/goals" className="text-xs font-semibold text-emerald-800 hover:underline">
                Kelola →
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {activeGoals.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">Belum ada target aktif.</p>
              ) : (
                activeGoals.slice(0, 3).map((goal) => {
                  const percent =
                    goal.targetValue > 0
                      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                      : 0;
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-900 truncate max-w-[180px]">
                          {goal.title}
                        </span>
                        <span className="font-bold text-stone-700">{percent}%</span>
                      </div>
                      <ProgressBar value={percent} color={percent >= 80 ? "primary" : "info"} />
                      <p className="text-[11px] text-stone-400">
                        {goal.unit === "Rp"
                          ? `${formatCurrency(goal.currentValue)} / ${formatCurrency(goal.targetValue)}`
                          : `${goal.currentValue} / ${goal.targetValue} ${goal.unit || ""}`}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* J. Rekomendasi Langkah Berikutnya (AI / Rule-based) */}
          <Card className="border-emerald-200/90 bg-gradient-to-b from-white to-emerald-50/20">
            <CardHeader className="py-3.5 border-b border-emerald-100">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-emerald-950">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Rekomendasi Terarah
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg bg-white border border-stone-200/80 shadow-xs space-y-1.5 text-xs">
                  <h5 className="font-bold text-stone-900">{rec.title}</h5>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{rec.recommendation}</p>
                  {rec.actionUrl && (
                    <Link
                      href={rec.actionUrl}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline pt-1"
                    >
                      {rec.actionText || "Lihat detail"} →
                    </Link>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
