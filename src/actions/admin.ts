"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function toggleUserStatusAction(targetUserId: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (targetUserId === admin.id) {
    return { success: false, message: "Anda tidak dapat menonaktifkan akun admin Anda sendiri." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!target) {
    return { success: false, message: "Pengguna tidak ditemukan." };
  }

  const newStatus = !target.isActive;

  await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: newStatus },
  });

  // Catat audit log admin
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "ADMIN_STATUS_CHANGE",
      entity: "User",
      entityId: target.id,
      details: JSON.stringify({
        targetEmail: target.email,
        newStatus: newStatus ? "ACTIVE" : "INACTIVE",
      }),
    },
  });

  revalidatePath("/admin");

  return {
    success: true,
    message: newStatus ? `Akun ${target.name} diaktifkan kembali.` : `Akun ${target.name} berhasil dinonaktifkan.`,
  };
}

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  type?: "INFO" | "UPDATE" | "ALERT";
}): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!data.title || !data.content) {
    return { success: false, message: "Judul dan isi pengumuman wajib diisi." };
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: data.title.trim(),
      content: data.content.trim(),
      type: data.type || "INFO",
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "ADMIN_ANNOUNCEMENT_CREATE",
      entity: "Announcement",
      entityId: announcement.id,
      details: JSON.stringify({ title: announcement.title }),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/app/dashboard");

  return { success: true, message: "Pengumuman sistem berhasil diterbitkan.", data: announcement };
}

export async function deleteAnnouncementAction(announcementId: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  await prisma.announcement.delete({
    where: { id: announcementId },
  });

  revalidatePath("/admin");
  return { success: true, message: "Pengumuman dihapus." };
}
