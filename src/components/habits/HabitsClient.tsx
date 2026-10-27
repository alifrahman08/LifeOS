"use client";

import React, { useState } from "react";
import {
  Repeat,
  Plus,
  Flame,
  CheckCircle2,
  Archive,
  Trash2,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  createHabitAction,
  toggleHabitCheckInAction,
  archiveHabitAction,
  deleteHabitAction,
} from "@/actions/habits";

interface HabitItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  frequency: string;
  targetType: string;
  targetValue: number | null;
  unit: string | null;
  color: string;
  isArchived: boolean;
  stats: {
    currentStreak: number;
    bestStreak: number;
    completionRate: number;
    completedToday: boolean;
    todayValue?: number;
  };
  checkIns: Array<{
    date: string; // YYYY-MM-DD
    value: number;
  }>;
}

interface HabitsClientProps {
  initialHabits: HabitItem[];
}

export function HabitsClient({ initialHabits }: HabitsClientProps) {
  const [habits, setHabits] = useState<HabitItem[]>(initialHabits);
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("HEALTH");
  const [formFrequency, setFormFrequency] = useState<"DAILY" | "WEEKDAYS" | "WEEKENDS">("DAILY");
  const [formTargetType, setFormTargetType] = useState<"BOOLEAN" | "NUMERIC">("BOOLEAN");
  const [formTargetValue, setFormTargetValue] = useState("1");
  const [formUnit, setFormUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 14 hari terakhir untuk visualisasi riwayat check-in
  const today = new Date();
  const last14Days = eachDayOfInterval({
    start: subDays(today, 13),
    end: today,
  });

  const handleToggleCheckIn = async (habitId: string, dateStr: string) => {
    const res = await toggleHabitCheckInAction(habitId, dateStr);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleArchive = async (habitId: string) => {
    const res = await archiveHabitAction(habitId);
    if (res.success) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, isArchived: !h.isArchived } : h))
      );
    }
  };

  const handleDelete = async (habitId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kebiasaan ini secara permanen?")) {
      const res = await deleteHabitAction(habitId);
      if (res.success) {
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createHabitAction({
        name: formName,
        description: formDesc,
        category: formCategory,
        frequency: formFrequency,
        targetType: formTargetType,
        targetValue: formTargetType === "NUMERIC" ? Number(formTargetValue) : 1,
        unit: formTargetType === "NUMERIC" ? formUnit : undefined,
      });

      if (res.success) {
        setIsCreateOpen(false);
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeHabits = habits.filter((h) => (showArchived ? true : !h.isArchived));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-emerald-800" />
            Habit Tracker
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Bangun rutinitas yang berkelanjutan dengan perhitungan streak presisi dan riwayat konsistensi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs"
          >
            {showArchived ? "Sembunyikan Arsip" : "Tampilkan Arsip"}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" />
            Kebiasaan Baru
          </Button>
        </div>
      </div>

      {/* Habit Cards */}
      <div className="grid grid-cols-1 gap-4">
        {activeHabits.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-stone-200">
            <Repeat className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-stone-800">Belum ada kebiasaan aktif</h3>
            <p className="text-xs text-stone-500 mt-1">
              Mulai dengan kebiasaan kecil seperti minum air 2 liter atau membaca buku 15 menit.
            </p>
          </div>
        ) : (
          activeHabits.map((habit) => {
            const checkInSet = new Set(habit.checkIns.map((c) => c.date));
            const todayStr = format(today, "yyyy-MM-dd");
            const isCompletedToday = checkInSet.has(todayStr);

            return (
              <Card
                key={habit.id}
                className={`transition-all ${
                  habit.isArchived ? "opacity-60 bg-stone-50" : "hover:border-emerald-300"
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Info Habit */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {habit.category}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        Frekuensi: {habit.frequency}
                      </span>
                      {habit.isArchived && <Badge variant="warning">Diarsipkan</Badge>}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-stone-900">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-xs text-stone-500 mt-0.5">{habit.description}</p>
                      )}
                    </div>

                    {/* Streaks & Completion Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        Streak Saat Ini: {habit.stats.currentStreak} Hari
                      </span>
                      <span className="inline-flex items-center gap-1 text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <Award className="w-3.5 h-3.5 text-stone-500" />
                        Terbaik: {habit.stats.bestStreak} Hari
                      </span>
                      <span className="text-stone-500">
                        Konsistensi 30 Hari: <strong>{habit.stats.completionRate}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* 14-Day Activity Heatmap Grid */}
                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Riwayat 14 Hari Terakhir
                    </span>
                    <div className="flex items-center gap-1.5">
                      {last14Days.map((d, idx) => {
                        const dStr = format(d, "yyyy-MM-dd");
                        const isDone = checkInSet.has(dStr);
                        const isDayToday = format(d, "yyyy-MM-dd") === todayStr;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleToggleCheckIn(habit.id, dStr)}
                            title={`${format(d, "d MMM yyyy", { locale: localeId })}: ${
                              isDone ? "Selesai" : "Belum check-in"
                            }`}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                              isDone
                                ? "bg-emerald-700 text-white"
                                : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                            } ${isDayToday ? "ring-2 ring-emerald-900" : ""}`}
                          >
                            {isDone ? "✓" : format(d, "d")}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100 w-full justify-end">
                      <Button
                        size="sm"
                        variant={isCompletedToday ? "outline" : "primary"}
                        onClick={() => handleToggleCheckIn(habit.id, todayStr)}
                        className="text-xs"
                      >
                        {isCompletedToday ? "Batalkan Check-in Hari Ini" : "✓ Check-in Hari Ini"}
                      </Button>
                      <button
                        onClick={() => handleArchive(habit.id)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                        title={habit.isArchived ? "Aktifkan kembali" : "Arsipkan"}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus permanen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Tambah Habit */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Kebiasaan Baru"
        description="Bangun kebiasaan harian dengan target terukur."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nama Kebiasaan *"
            required
            placeholder="Contoh: Membaca Buku 20 Menit"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Textarea
            label="Deskripsi & Motivasi (Opsional)"
            placeholder="Mengapa kebiasaan ini penting bagi Anda?"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Kategori</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="HEALTH">Kesehatan</option>
                <option value="PRODUCTIVITY">Produktivitas</option>
                <option value="LEARNING">Pembelajaran</option>
                <option value="MINDFULNESS">Ketenangan Pikiran</option>
                <option value="FINANCE">Keuangan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Jadwal</label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="DAILY">Setiap Hari</option>
                <option value="WEEKDAYS">Hari Kerja (Senin - Jumat)</option>
                <option value="WEEKENDS">Akhir Pekan (Sabtu - Minggu)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Tipe Target</label>
              <select
                value={formTargetType}
                onChange={(e) => setFormTargetType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="BOOLEAN">Selesai / Belum Selesai</option>
                <option value="NUMERIC">Target Terukur (Kuantitas)</option>
              </select>
            </div>

            {formTargetType === "NUMERIC" && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Target"
                  type="number"
                  placeholder="20"
                  value={formTargetValue}
                  onChange={(e) => setFormTargetValue(e.target.value)}
                />
                <Input
                  label="Satuan"
                  placeholder="menit/ml"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Simpan Kebiasaan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

