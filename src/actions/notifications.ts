"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  const user = await requireUser();

  const notif = await prisma.notification.findFirst({
    where: { id: notificationId, userId: user.id },
  });

  if (!notif) {
    return { success: false, message: "Notifikasi tidak ditemukan." };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  revalidatePath("/app/notifications");
  revalidatePath("/app/dashboard");

  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/app/notifications");
  revalidatePath("/app/dashboard");

  return { success: true, message: "Semua notifikasi ditandai sebagai dibaca." };
}

export async function deleteNotificationAction(notificationId: string): Promise<ActionResult> {
  const user = await requireUser();

  await prisma.notification.deleteMany({
    where: { id: notificationId, userId: user.id },
  });

  revalidatePath("/app/notifications");
  revalidatePath("/app/dashboard");

  return { success: true, message: "Notifikasi dihapus." };
}
