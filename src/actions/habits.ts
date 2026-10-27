"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function createHabitAction(data: {
  name: string;
  description?: string;
  category?: string;
  frequency?: "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";
  customDays?: number[];
  targetType?: "BOOLEAN" | "NUMERIC";
  targetValue?: number;
  unit?: string;
  color?: string;
  icon?: string;
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!data.name || data.name.trim() === "") {
    return { success: false, message: "Nama kebiasaan wajib diisi." };
  }

  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      category: data.category || "HEALTH",
      frequency: data.frequency || "DAILY",
      customDays: data.customDays ? JSON.stringify(data.customDays) : null,
      targetType: data.targetType || "BOOLEAN",
      targetValue: data.targetValue ? Number(data.targetValue) : 1,
      unit: data.unit?.trim() || null,
      color: data.color || "#0d9488",
      icon: data.icon || "check-circle",
    },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/habits");
  revalidatePath("/app/reports");

  return { success: true, message: "Kebiasaan baru berhasil dibuat.", data: habit };
}

export async function toggleHabitCheckInAction(
  habitId: string,
  dateStr: string, // YYYY-MM-DD
  numericValue?: number
): Promise<ActionResult> {
  const user = await requireUser();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });

  if (!habit) {
    return { success: false, message: "Kebiasaan tidak ditemukan." };
  }

  // Cek apakah sudah ada check-in pada tanggal tersebut
  const existingCheckIn = await prisma.habitCheckIn.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: dateStr,
      },
    },
  });

  if (existingCheckIn) {
    // Jika sudah ada dan boolean habit, toggle off (hapus check-in)
    // Jika numeric habit dan nilai baru diberikan, perbarui nilainya
    if (numericValue !== undefined && numericValue > 0) {
      await prisma.habitCheckIn.update({
        where: { id: existingCheckIn.id },
        data: { value: numericValue },
      });
      revalidatePath("/app/dashboard");
      revalidatePath("/app/habits");
      revalidatePath("/app/reports");
      return { success: true, message: `Nilai diperbarui menjadi ${numericValue} ${habit.unit || ""}.` };
    } else {
      await prisma.habitCheckIn.delete({
        where: { id: existingCheckIn.id },
      });
      revalidatePath("/app/dashboard");
      revalidatePath("/app/habits");
      revalidatePath("/app/reports");
      return { success: true, message: "Check-in kebiasaan dibatalkan." };
    }
  } else {
    // Buat check-in baru
    const val = numericValue !== undefined && numericValue > 0 ? numericValue : (habit.targetValue || 1);
    await prisma.habitCheckIn.create({
      data: {
        habitId,
        userId: user.id,
        date: dateStr,
        value: val,
      },
    });

    revalidatePath("/app/dashboard");
    revalidatePath("/app/habits");
    revalidatePath("/app/reports");

    return { success: true, message: "Check-in berhasil dicatat! Konsistensi terjaga. ✨" };
  }
}

export async function archiveHabitAction(habitId: string): Promise<ActionResult> {
  const user = await requireUser();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });

  if (!habit) {
    return { success: false, message: "Kebiasaan tidak ditemukan." };
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: { isArchived: !habit.isArchived },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/habits");
  return {
    success: true,
    message: habit.isArchived ? "Kebiasaan diaktifkan kembali." : "Kebiasaan berhasil diarsipkan tanpa menghapus riwayat.",
  };
}

export async function deleteHabitAction(habitId: string): Promise<ActionResult> {
  const user = await requireUser();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });

  if (!habit) {
    return { success: false, message: "Kebiasaan tidak ditemukan." };
  }

  await prisma.habit.delete({
    where: { id: habitId },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/habits");
  revalidatePath("/app/reports");

  return { success: true, message: "Kebiasaan berhasil dihapus." };
}

