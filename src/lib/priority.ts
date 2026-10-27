import { differenceInCalendarDays, startOfDay } from "date-fns";
import { PriorityScore, TaskPriority } from "@/types";

export interface TaskPriorityInput {
  id: string;
  title: string;
  dueDate?: Date | string | null;
  manualPriority: TaskPriority;
  status: string;
  estimatedDuration?: number | null; // dalam menit
  hasActiveGoal?: boolean;
  isRecurring?: boolean;
}

/**
 * Algoritma Penentuan Prioritas Cerdas (Rule-Based & Transparan)
 * Memberikan skor 0 - 100 dengan penjelasan alasan yang jelas.
 */
export function calculateTaskPriority(
  task: TaskPriorityInput,
  currentDate: Date = new Date()
): PriorityScore {
  // Jika sudah selesai atau dibatalkan, prioritaskan 0
  if (task.status === "COMPLETED" || task.status === "CANCELLED") {
    return {
      score: 0,
      level: "LOW",
      reason: task.status === "COMPLETED" ? "Tugas telah diselesaikan" : "Tugas dibatalkan",
      isOverdue: false,
      daysUntilDue: null,
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const today = startOfDay(currentDate);

  let isOverdue = false;
  let daysUntilDue: number | null = null;

  // 1. Kedekatan Deadline (Bobot maks 45 poin)
  if (task.dueDate) {
    const due = startOfDay(new Date(task.dueDate));
    daysUntilDue = differenceInCalendarDays(due, today);

    if (daysUntilDue < 0) {
      isOverdue = true;
      const overdueDays = Math.abs(daysUntilDue);
      score += 45;
      reasons.push(`Terlambat ${overdueDays} hari`);
    } else if (daysUntilDue === 0) {
      score += 40;
      reasons.push("Jatuh tempo hari ini");
    } else if (daysUntilDue === 1) {
      score += 30;
      reasons.push("Jatuh tempo besok");
    } else if (daysUntilDue <= 3) {
      score += 20;
      reasons.push(`Jatuh tempo dalam ${daysUntilDue} hari`);
    } else if (daysUntilDue <= 7) {
      score += 10;
      reasons.push("Jatuh tempo minggu ini");
    } else {
      score += 5;
    }
  } else {
    reasons.push("Tidak ada tenggat waktu");
  }

  // 2. Tingkat Kepentingan Manual dari Pengguna (Bobot maks 30 poin)
  switch (task.manualPriority) {
    case "URGENT":
      score += 30;
      reasons.push("Ditandai mendesak oleh pengguna");
      break;
    case "HIGH":
      score += 20;
      reasons.push("Prioritas tinggi");
      break;
    case "MEDIUM":
      score += 10;
      break;
    case "LOW":
      score += 2;
      break;
  }

  // 3. Hubungan dengan Target Aktif (Bobot 15 poin)
  if (task.hasActiveGoal) {
    score += 15;
    reasons.push("Terkait dengan target penting");
  }

  // 4. Estimasi Usaha (Bobot 10 poin)
  // Tugas ringkas (<30 menit) yang mendekati deadline mendapat dorongan "quick win"
  if (task.estimatedDuration && task.estimatedDuration <= 30 && daysUntilDue !== null && daysUntilDue <= 2) {
    score += 10;
    reasons.push("Quick win (≤ 30 menit)");
  } else if (task.estimatedDuration && task.estimatedDuration > 120 && daysUntilDue !== null && daysUntilDue <= 2) {
    score += 8;
    reasons.push("Tugas besar (butuh alokasi waktu lebih awal)");
  }

  // Normalisasi skor (0 - 100)
  score = Math.min(100, Math.max(0, score));

  // Tentukan Level Prioritas yang Direkomendasikan
  let level: TaskPriority = "LOW";
  if (score >= 70 || isOverdue) {
    level = "URGENT";
  } else if (score >= 45) {
    level = "HIGH";
  } else if (score >= 25) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  const reason = reasons.length > 0 ? reasons.join(" • ") : "Prioritas standar";

  return {
    score,
    level,
    reason,
    isOverdue,
    daysUntilDue,
  };
}

/**
 * Filter tugas fokus hari ini (Score tinggi atau jatuh tempo hari ini/terlambat)
 */
export function getFocusTasksToday<T extends TaskPriorityInput>(
  tasks: T[],
  currentDate: Date = new Date(),
  limit: number = 5
): Array<T & { priorityInfo: PriorityScore }> {
  return tasks
    .filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .map((task) => ({
      ...task,
      priorityInfo: calculateTaskPriority(task, currentDate),
    }))
    .sort((a, b) => b.priorityInfo.score - a.priorityInfo.score)
    .slice(0, limit);
}

