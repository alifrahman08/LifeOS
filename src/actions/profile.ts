"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser, verifyPassword, clearSessionCookie } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function updateProfileAction(data: {
  name: string;
  bio?: string;
  phone?: string;
  occupation?: string;
  location?: string;
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!data.name || data.name.trim() === "") {
    return { success: false, message: "Nama lengkap tidak boleh kosong." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name.trim(),
      profile: {
        upsert: {
          create: {
            bio: data.bio?.trim() || null,
            phone: data.phone?.trim() || null,
            occupation: data.occupation?.trim() || null,
            location: data.location?.trim() || null,
          },
          update: {
            bio: data.bio?.trim() || null,
            phone: data.phone?.trim() || null,
            occupation: data.occupation?.trim() || null,
            location: data.location?.trim() || null,
          },
        },
      },
    },
  });

  revalidatePath("/app/profile");
  revalidatePath("/app/dashboard");

  return { success: true, message: "Informasi profil berhasil diperbarui." };
}

export async function updatePreferencesAction(data: {
  currency?: string;
  timezone?: string;
  theme?: string;
  notifyEmail?: boolean;
  notifyBrowser?: boolean;
  notifyHabits?: boolean;
  notifyBudget?: boolean;
  notifyDeadlines?: boolean;
  aiInsightsEnabled?: boolean;
}): Promise<ActionResult> {
  const user = await requireUser();

  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      currency: data.currency || "IDR",
      timezone: data.timezone || "Asia/Jakarta",
      theme: data.theme || "light",
      notifyEmail: !!data.notifyEmail,
      notifyBrowser: !!data.notifyBrowser,
      notifyHabits: !!data.notifyHabits,
      notifyBudget: !!data.notifyBudget,
      notifyDeadlines: !!data.notifyDeadlines,
      aiInsightsEnabled: !!data.aiInsightsEnabled,
    },
    update: {
      currency: data.currency,
      timezone: data.timezone,
      theme: data.theme,
      notifyEmail: data.notifyEmail,
      notifyBrowser: data.notifyBrowser,
      notifyHabits: data.notifyHabits,
      notifyBudget: data.notifyBudget,
      notifyDeadlines: data.notifyDeadlines,
      aiInsightsEnabled: data.aiInsightsEnabled,
    },
  });

  revalidatePath("/app/settings");
  revalidatePath("/app/dashboard");

  return { success: true, message: "Preferensi berhasil disimpan." };
}

export async function exportUserDataAction(): Promise<ActionResult<{ exportJson: string }>> {
  const user = await requireUser();

  const fullData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      preferences: true,
      tasks: { include: { subtasks: true } },
      habits: { include: { checkIns: true } },
      goals: { include: { milestones: true } },
      financialAccounts: true,
      transactions: { include: { category: true } },
      budgets: { include: { category: true } },
      savingsGoals: { include: { contributions: true } },
    },
  });

  if (!fullData) {
    return { success: false, message: "Pengguna tidak ditemukan." };
  }

  // Hilangkan passwordHash demi privasi
  const { passwordHash, ...cleanData } = fullData;

  return {
    success: true,
    data: {
      exportJson: JSON.stringify(cleanData, null, 2),
    },
  };
}

export async function deleteAccountAction(password: string): Promise<ActionResult> {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return { success: false, message: "Pengguna tidak ditemukan." };
  }

  const isValid = await verifyPassword(password, dbUser.passwordHash);
  if (!isValid) {
    return { success: false, message: "Kata sandi salah. Penghapusan akun dibatalkan." };
  }

  await prisma.user.delete({
    where: { id: user.id },
  });

  clearSessionCookie();

  return { success: true, message: "Akun Anda dan seluruh data terkait telah dihapus secara permanen." };
}

