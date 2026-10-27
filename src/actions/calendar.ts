"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function createCalendarEventAction(data: {
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAllDay?: boolean;
  location?: string;
  category?: string;
  taskId?: string;
  goalId?: string;
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!data.title || data.title.trim() === "") {
    return { success: false, message: "Judul agenda wajib diisi." };
  }

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, message: "Format waktu agenda tidak valid." };
  }

  if (end <= start) {
    return { success: false, message: "Waktu selesai harus lebih lambat dari waktu mulai." };
  }

  // Deteksi konflik jadwal / overlap
  const conflict = await prisma.calendarEvent.findFirst({
    where: {
      userId: user.id,
      OR: [
        {
          startTime: { lte: start },
          endTime: { gt: start },
        },
        {
          startTime: { lt: end },
          endTime: { gte: end },
        },
        {
          startTime: { gte: start },
          endTime: { lte: end },
        },
      ],
    },
  });

  const event = await prisma.calendarEvent.create({
    data: {
      userId: user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      startTime: start,
      endTime: end,
      isAllDay: !!data.isAllDay,
      location: data.location?.trim() || null,
      category: data.category || "GENERAL",
      taskId: data.taskId || null,
      goalId: data.goalId || null,
    },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/calendar");

  const warningMessage = conflict
    ? `Agenda dibuat, tetapi bertabrakan dengan '${conflict.title}'.`
    : "Agenda kalender berhasil ditambahkan.";

  return { success: true, message: warningMessage, data: event };
}

export async function deleteCalendarEventAction(eventId: string): Promise<ActionResult> {
  const user = await requireUser();

  const event = await prisma.calendarEvent.findFirst({
    where: { id: eventId, userId: user.id },
  });

  if (!event) {
    return { success: false, message: "Agenda tidak ditemukan." };
  }

  await prisma.calendarEvent.delete({
    where: { id: eventId },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/calendar");

  return { success: true, message: "Agenda berhasil dihapus." };
}
