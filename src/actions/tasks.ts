"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function createTaskAction(data: {
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "INBOX" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  categoryId?: string;
  goalId?: string;
  estimatedDuration?: number;
  tags?: string[];
  subtasks?: string[];
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!data.title || data.title.trim() === "") {
    return { success: false, message: "Judul tugas wajib diisi." };
  }

  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      dueDate: dueDate,
      dueTime: data.dueTime || null,
      priority: data.priority || "MEDIUM",
      status: data.status || "INBOX",
      categoryId: data.categoryId || null,
      goalId: data.goalId || null,
      estimatedDuration: data.estimatedDuration ? Number(data.estimatedDuration) : null,
      tags: data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
      subtasks: {
        create: (data.subtasks || []).map((st, index) => ({
          title: st.trim(),
          order: index + 1,
        })),
      },
    },
  });

  // Jika tugas memiliki tanggal dan waktu, buat juga CalendarEvent terkait untuk sinkronisasi kalender!
  if (dueDate && data.dueTime) {
    const [hours, minutes] = data.dueTime.split(":").map(Number);
    const startTime = new Date(dueDate);
    startTime.setHours(hours, minutes, 0, 0);

    const duration = data.estimatedDuration || 60;
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: `Tugas: ${task.title}`,
        description: task.description,
        startTime,
        endTime,
        taskId: task.id,
        goalId: task.goalId,
        category: "WORK",
      },
    });
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/planner");
  revalidatePath("/app/calendar");
  if (data.goalId) revalidatePath("/app/goals");

  return { success: true, message: "Tugas berhasil dibuat.", data: task };
}

export async function toggleTaskCompleteAction(taskId: string): Promise<ActionResult> {
  const user = await requireUser();

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
    include: { subtasks: true },
  });

  if (!task) {
    return { success: false, message: "Tugas tidak ditemukan." };
  }

  const isNowCompleted = task.status !== "COMPLETED";
  const newStatus = isNowCompleted ? "COMPLETED" : "IN_PROGRESS";
  const completedAt = isNowCompleted ? new Date() : null;

  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: newStatus,
      completedAt,
    },
  });

  // Jika terhubung dengan Target (Goal) berbasis tugas, perbarui progres target secara otomatis!
  if (task.goalId) {
    const goal = await prisma.goal.findUnique({
      where: { id: task.goalId },
      include: { tasks: true },
    });

    if (goal && goal.autoSource === "TASKS") {
      const allTasks = goal.tasks;
      const completedCount = allTasks.filter((t) =>
        t.id === task.id ? isNowCompleted : t.status === "COMPLETED"
      ).length;

      const newProgress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;
      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          currentValue: newProgress,
          status: newProgress >= 100 ? "COMPLETED" : "ACTIVE",
        },
      });
    }
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/planner");
  revalidatePath("/app/calendar");
  revalidatePath("/app/reports");
  revalidatePath("/app/goals");

  return {
    success: true,
    message: isNowCompleted ? "Tugas berhasil diselesaikan! 🎉" : "Tugas diaktifkan kembali.",
  };
}

export async function updateTaskAction(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    dueDate?: string | null;
    dueTime?: string | null;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status?: "INBOX" | "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    categoryId?: string | null;
    goalId?: string | null;
    estimatedDuration?: number | null;
    actualDuration?: number | null;
  }
): Promise<ActionResult> {
  const user = await requireUser();

  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!existing) {
    return { success: false, message: "Tugas tidak ditemukan." };
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.dueTime !== undefined) updateData.dueTime = data.dueTime || null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "COMPLETED" && existing.status !== "COMPLETED") {
      updateData.completedAt = new Date();
    } else if (data.status !== "COMPLETED") {
      updateData.completedAt = null;
    }
  }
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.goalId !== undefined) updateData.goalId = data.goalId;
  if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;
  if (data.actualDuration !== undefined) updateData.actualDuration = data.actualDuration;

  await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/planner");
  revalidatePath("/app/calendar");
  revalidatePath("/app/reports");

  return { success: true, message: "Perubahan tugas berhasil disimpan." };
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const user = await requireUser();

  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!existing) {
    return { success: false, message: "Tugas tidak ditemukan." };
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/planner");
  revalidatePath("/app/calendar");

  return { success: true, message: "Tugas berhasil dihapus." };
}

export async function toggleSubtaskAction(subtaskId: string): Promise<ActionResult> {
  const user = await requireUser();

  const subtask = await prisma.taskSubtask.findUnique({
    where: { id: subtaskId },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== user.id) {
    return { success: false, message: "Subtugas tidak ditemukan." };
  }

  const updated = await prisma.taskSubtask.update({
    where: { id: subtaskId },
    data: { isCompleted: !subtask.isCompleted },
  });

  revalidatePath("/app/planner");
  revalidatePath("/app/dashboard");

  return { success: true, data: updated };
}

export async function createSubtaskAction(taskId: string, title: string): Promise<ActionResult> {
  const user = await requireUser();

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!task) {
    return { success: false, message: "Tugas utama tidak ditemukan." };
  }

  const subtask = await prisma.taskSubtask.create({
    data: {
      taskId: task.id,
      title: title.trim(),
    },
  });

  revalidatePath("/app/planner");
  return { success: true, message: "Subtugas ditambahkan.", data: subtask };
}

