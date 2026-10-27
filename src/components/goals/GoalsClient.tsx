"use client";

import React, { useState } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
  ArrowRight,
  Milestone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency, formatShortDateID } from "@/lib/utils";
import {
  createGoalAction,
  toggleMilestoneAction,
  updateGoalManualProgressAction,
  deleteGoalAction,
} from "@/actions/goals";

interface GoalItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  targetType: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  targetDate: Date | null;
  status: string;
  isAutoCalculated: boolean;
  autoSource: string | null;
  milestones: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    order: number;
  }>;
}

interface GoalsClientProps {
  initialGoals: GoalItem[];
}

export function GoalsClient({ initialGoals }: GoalsClientProps) {
  const [goals, setGoals] = useState<GoalItem[]>(initialGoals);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("PERSONAL");
  const [formTargetType, setFormTargetType] = useState<"NUMERIC" | "MILESTONE" | "COMPLETION">("NUMERIC");
  const [formTargetValue, setFormTargetValue] = useState("100");
  const [formUnit, setFormUnit] = useState("%");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formMilestones, setFormMilestones] = useState(["", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleMilestone = async (milestoneId: string) => {
    const res = await toggleMilestoneAction(milestoneId);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm("Hapus target ini beserta seluruh milestonenya?")) {
      const res = await deleteGoalAction(goalId);
      if (res.success) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validMilestones = formMilestones.filter((m) => m.trim().length > 0);
      const res = await createGoalAction({
        title: formTitle,
        description: formDesc,
        category: formCategory,
        targetType: formTargetType,
        targetValue: formTargetType === "MILESTONE" ? validMilestones.length : Number(formTargetValue),
        unit: formTargetType === "NUMERIC" ? formUnit : "Milestone",
        targetDate: formTargetDate || undefined,
        milestones: validMilestones,
      });

      if (res.success) {
        setIsCreateOpen(false);
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-700" />
            Target & Milestone Pribadi
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Kelola tujuan jangka panjang dengan pemecahan milestone terstruktur dan kalkulasi progres otomatis.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Target Baru
        </Button>
      </div>

      {/* Grid Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center bg-white rounded-xl border border-stone-200">
            <Target className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-stone-800">Belum ada target dibuat</h3>
            <p className="text-xs text-stone-500 mt-1">
              Buat target baru seperti tabungan dana darurat, sertifikasi, atau target membaca buku.
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const percentage =
              goal.targetValue > 0
                ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                : 0;

            const isDone = goal.status === "COMPLETED" || percentage >= 100;

            return (
              <Card
                key={goal.id}
                className={`flex flex-col justify-between transition-all ${
                  isDone ? "border-emerald-300 bg-emerald-50/20" : "hover:border-purple-300"
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {goal.category}
                        </span>
                        {goal.isAutoCalculated && (
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                            Auto: {goal.autoSource}
                          </span>
                        )}
                        <Badge variant={isDone ? "success" : "default"}>
                          {isDone ? "Tercapai ✓" : goal.status}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-stone-900">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-stone-500 leading-relaxed">{goal.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Hapus target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-600">Progres Capaian</span>
                      <span className={percentage >= 100 ? "text-emerald-700" : "text-stone-900"}>
                        {percentage}%
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      color={percentage >= 100 ? "primary" : "info"}
                    />
                    <div className="flex justify-between text-[11px] text-stone-400">
                      <span>
                        {goal.unit === "Rp"
                          ? formatCurrency(goal.currentValue)
                          : `${goal.currentValue} ${goal.unit || ""}`}
                      </span>
                      <span>
                        Target:{" "}
                        {goal.unit === "Rp"
                          ? formatCurrency(goal.targetValue)
                          : `${goal.targetValue} ${goal.unit || ""}`}
                      </span>
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  {goal.milestones.length > 0 && (
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Milestone Langkah Kerja
                      </span>
                      <div className="space-y-1.5">
                        {goal.milestones.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleToggleMilestone(m.id)}
                            className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer p-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={m.isCompleted}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-purple-700 focus:ring-0"
                            />
                            <span className={m.isCompleted ? "line-through text-stone-400" : "font-medium"}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                {goal.targetDate && (
                  <div className="px-5 py-3 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Target Selesai: {formatShortDateID(goal.targetDate)}
                    </span>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Buat Target */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Target Baru"
        description="Tetapkan tujuan hidup terarah dengan milestone langkah nyata."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Judul Target *"
            required
            placeholder="Contoh: Kumpulkan Dana Darurat Rp 30.000.000"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <Textarea
            label="Deskripsi & Sasaran"
            placeholder="Jelaskan alasan mengapa target ini penting..."
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
                <option value="FINANCE">Keuangan</option>
                <option value="CAREER">Karir & Profesional</option>
                <option value="HEALTH">Kesehatan</option>
                <option value="LEARNING">Pendidikan & Buku</option>
                <option value="PERSONAL">Pengembangan Pribadi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Tipe Target</label>
              <select
                value={formTargetType}
                onChange={(e) => setFormTargetType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="NUMERIC">Nilai Numerik (Rupiah/Jumlah)</option>
                <option value="MILESTONE">Berbasis Milestone (Tahapan)</option>
              </select>
            </div>
          </div>

          {formTargetType === "NUMERIC" && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Target Nilai"
                type="number"
                required
                value={formTargetValue}
                onChange={(e) => setFormTargetValue(e.target.value)}
              />
              <Input
                label="Satuan"
                placeholder="Rp / Buku / Jam"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
              />
            </div>
          )}

          <Input
            label="Tenggat Waktu Target (Opsional)"
            type="date"
            value={formTargetDate}
            onChange={(e) => setFormTargetDate(e.target.value)}
          />

          {/* Input Milestones Awal */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="block text-xs font-medium text-stone-700">
              Milestone Tahapan Kerja (Opsional)
            </label>
            {formMilestones.map((m, idx) => (
              <Input
                key={idx}
                placeholder={`Milestone ${idx + 1}...`}
                value={m}
                onChange={(e) => {
                  const updated = [...formMilestones];
                  updated[idx] = e.target.value;
                  setFormMilestones(updated);
                }}
              />
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Simpan Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
