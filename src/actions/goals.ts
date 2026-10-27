"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function createGoalAction(data: {
  title: string;
  description?: string;
  category?: string;
  targetType?: "NUMERIC" | "MILESTONE" | "COMPLETION";
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate?: string;
  isAutoCalculated?: boolean;
  autoSource?: "TASKS" | "SAVINGS" | "MILESTONES";
  milestones?: string[];
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!data.title || data.title.trim() === "") {
    return { success: false, message: "Judul target wajib diisi." };
  }

  const targetDate = data.targetDate ? new Date(data.targetDate) : null;

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      category: data.category || "PERSONAL",
      targetType: data.targetType || "NUMERIC",
      targetValue: data.targetValue ? Number(data.targetValue) : 100,
      currentValue: data.currentValue ? Number(data.currentValue) : 0,
      unit: data.unit?.trim() || "%",
      targetDate,
      isAutoCalculated: !!data.isAutoCalculated,
      autoSource: data.autoSource || null,
      milestones: {
        create: (data.milestones || []).map((title, idx) => ({
          title: title.trim(),
          order: idx + 1,
        })),
      },
    },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/goals");
  revalidatePath("/app/reports");

  return { success: true, message: "Target baru berhasil dibuat.", data: goal };
}

export async function toggleMilestoneAction(milestoneId: string): Promise<ActionResult> {
  const user = await requireUser();

  const milestone = await prisma.goalMilestone.findUnique({
    where: { id: milestoneId },
    include: { goal: { include: { milestones: true } } },
  });

  if (!milestone || milestone.goal.userId !== user.id) {
    return { success: false, message: "Milestone tidak ditemukan." };
  }

  const isNowCompleted = !milestone.isCompleted;

  await prisma.goalMilestone.update({
    where: { id: milestoneId },
    data: {
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? new Date() : null,
    },
  });

  // Jika goal bertipe MILESTONE, hitung otomatis progres goal
  const allMilestones = milestone.goal.milestones;
  const completedCount = allMilestones.filter((m) =>
    m.id === milestoneId ? isNowCompleted : m.isCompleted
  ).length;

  const newCurrentValue = completedCount;
  const isGoalCompleted = completedCount === allMilestones.length && allMilestones.length > 0;

  await prisma.goal.update({
    where: { id: milestone.goal.id },
    data: {
      currentValue: newCurrentValue,
      status: isGoalCompleted ? "COMPLETED" : "ACTIVE",
    },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/goals");
  revalidatePath("/app/reports");

  return {
    success: true,
    message: isNowCompleted ? "Milestone selesai! Progres target diperbarui." : "Milestone diaktifkan kembali.",
  };
}

export async function updateGoalManualProgressAction(
  goalId: string,
  newValue: number
): Promise<ActionResult> {
  const user = await requireUser();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });

  if (!goal) {
    return { success: false, message: "Target tidak ditemukan." };
  }

  const isCompleted = newValue >= goal.targetValue;

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      currentValue: Number(newValue),
      status: isCompleted ? "COMPLETED" : "ACTIVE",
    },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/goals");
  revalidatePath("/app/reports");

  return { success: true, message: "Progres target berhasil diperbarui." };
}

export async function deleteGoalAction(goalId: string): Promise<ActionResult> {
  const user = await requireUser();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });

  if (!goal) {
    return { success: false, message: "Target tidak ditemukan." };
  }

  await prisma.goal.delete({
    where: { id: goalId },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/goals");
  revalidatePath("/app/reports");

  return { success: true, message: "Target berhasil dihapus." };
}

