"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  CheckSquare,
  Repeat,
  Wallet,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";

interface ReportsClientProps {
  productivityStats: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
  };
  habitStats: {
    totalHabits: number;
    averageConsistency: number;
    totalCheckIns: number;
  };
  financeStats: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    savingsRate: number;
  };
  goalStats: {
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
  };
  weeklyTasksChart: Array<{ day: string; selesai: number }>;
  categoryExpenseChart: Array<{ name: string; value: number; color: string }>;
}

export function ReportsClient({
  productivityStats,
  habitStats,
  financeStats,
  goalStats,
  weeklyTasksChart,
  categoryExpenseChart,
}: ReportsClientProps) {
  const [period, setPeriod] = useState<"30D" | "90D" | "ALL">("30D");

  const handleExportReportCSV = () => {
    let csv = "Modul,Metrik,Nilai\n";
    csv += `Tugas,Total Tugas,${productivityStats.totalTasks}\n`;
    csv += `Tugas,Tugas Selesai,${productivityStats.completedTasks}\n`;
    csv += `Tugas,Tingkat Penyelesaian,${productivityStats.completionRate}%\n`;
    csv += `Tugas,Tugas Terlambat,${productivityStats.overdueTasks}\n`;
    csv += `Habit,Total Kebiasaan,${habitStats.totalHabits}\n`;
    csv += `Habit,Rata-rata Konsistensi,${habitStats.averageConsistency}%\n`;
    csv += `Habit,Total Check-in,${habitStats.totalCheckIns}\n`;
    csv += `Keuangan,Total Pemasukan,${financeStats.totalIncome}\n`;
    csv += `Keuangan,Total Pengeluaran,${financeStats.totalExpense}\n`;
    csv += `Keuangan,Arus Kas Bersih,${financeStats.netCashFlow}\n`;
    csv += `Target,Total Target,${goalStats.totalGoals}\n`;
    csv += `Target,Target Selesai,${goalStats.completedGoals}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LifeOS_Laporan_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-800" />
            Laporan & Analitik Menyeluruh
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Evaluasi berkala seluruh pilar kehidupan berdasarkan data database faktual Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReportCSV} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Ekspor Laporan CSV
          </Button>
        </div>
      </div>

      {/* Top 4 Metrik Pilar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Tingkat Selesai Tugas"
          value={`${productivityStats.completionRate}%`}
          subtitle={`${productivityStats.completedTasks} dari ${productivityStats.totalTasks} tugas`}
          icon={<CheckSquare className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Konsistensi Habit"
          value={`${habitStats.averageConsistency}%`}
          subtitle={`${habitStats.totalCheckIns} total check-in`}
          icon={<Repeat className="w-4 h-4 text-sky-700" />}
        />
        <StatCard
          title="Arus Kas Bersih"
          value={formatCurrency(financeStats.netCashFlow)}
          subtitle={`Rasio tabungan ${financeStats.savingsRate}%`}
          icon={<Wallet className="w-4 h-4 text-emerald-800" />}
        />
        <StatCard
          title="Target Selesai"
          value={`${goalStats.completedGoals}`}
          subtitle={`${goalStats.activeGoals} masih aktif`}
          icon={<Target className="w-4 h-4 text-purple-700" />}
        />
      </div>

      {/* Visualisasi Grafik: Produktivitas & Distribusi Pengeluaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Penyelesaian Tugas Harian */}
        <Card>
          <CardHeader className="py-3.5">
            <CardTitle className="text-xs font-bold text-stone-900">
              Tren Produktivitas Tugas (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTasksChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#999" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                    formatter={(val: number) => [`${val} Tugas`, "Selesai"]}
                  />
                  <Bar dataKey="selesai" fill="#15803d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribusi Pengeluaran Berdasarkan Kategori */}
        <Card>
          <CardHeader className="py-3.5">
            <CardTitle className="text-xs font-bold text-stone-900">
              Distribusi Pengeluaran Per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {categoryExpenseChart.length === 0 ? (
              <p className="text-xs text-stone-400 py-20 text-center">Belum ada data pengeluaran.</p>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenseChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryExpenseChart.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                      formatter={(val: number) => [formatCurrency(val), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
