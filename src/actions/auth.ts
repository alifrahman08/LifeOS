"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  requireUser,
} from "@/lib/auth";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email dan kata sandi wajib diisi." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, message: "Email atau kata sandi tidak valid." };
  }

  if (!user.isActive) {
    return {
      success: false,
      message: "Akun Anda telah dinonaktifkan oleh Administrator. Hubungi bantuan untuk memulihkan.",
    };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, message: "Email atau kata sandi tidak valid." };
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any,
    avatarUrl: user.avatarUrl,
  });

  setSessionCookie(token);

  // Catat audit log login
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
      details: JSON.stringify({ email: user.email, role: user.role }),
    },
  });

  return { success: true, message: "Berhasil masuk ke LifeOS." };
}

export async function demoLoginAction(): Promise<ActionResult> {
  let demoUser = await prisma.user.findUnique({
    where: { email: "demo@lifeos.id" },
  });

  if (!demoUser) {
    // Buat demo user jika belum ada
    const demoPasswordHash = await hashPassword("Demo1234!");
    demoUser = await prisma.user.create({
      data: {
        email: "demo@lifeos.id",
        name: "Pengguna Demo LifeOS",
        passwordHash: demoPasswordHash,
        role: "DEMO",
        profile: {
          create: {
            bio: "Akun demonstrasi interaktif LifeOS.",
            onboardingCompleted: true,
          },
        },
        preferences: {
          create: {
            theme: "light",
            timezone: "Asia/Jakarta",
          },
        },
      },
    });
  }

  const token = await createSessionToken({
    id: demoUser.id,
    email: demoUser.email,
    name: demoUser.name,
    role: "DEMO",
    avatarUrl: demoUser.avatarUrl,
  });

  setSessionCookie(token);

  return { success: true, message: "Berhasil masuk dalam Mode Demo." };
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || name.length < 2) {
    return { success: false, message: "Nama lengkap minimal 2 karakter." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, message: "Format alamat email tidak valid." };
  }

  if (!password || password.length < 8) {
    return { success: false, message: "Kata sandi minimal 8 karakter demi keamanan." };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Konfirmasi kata sandi tidak cocok." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { success: false, message: "Email ini sudah terdaftar. Silakan masuk." };
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "USER",
      profile: {
        create: {
          onboardingCompleted: false,
        },
      },
      preferences: {
        create: {
          currency: "IDR",
          timezone: "Asia/Jakarta",
          firstDayOfWeek: 1,
          theme: "light",
        },
      },
    },
  });

  // Buat kategori tugas & transaksi default untuk pengguna baru
  await prisma.taskCategory.createMany({
    data: [
      { userId: newUser.id, name: "Pekerjaan", color: "#2563eb" },
      { userId: newUser.id, name: "Pribadi", color: "#0d9488" },
      { userId: newUser.id, name: "Kesehatan", color: "#16a34a" },
    ],
  });

  await prisma.transactionCategory.createMany({
    data: [
      { userId: newUser.id, name: "Gaji & Kompensasi", type: "INCOME", color: "#16a34a", icon: "wallet", isDefault: true },
      { userId: newUser.id, name: "Makanan & Minuman", type: "EXPENSE", color: "#f97316", icon: "coffee", isDefault: true },
      { userId: newUser.id, name: "Transportasi", type: "EXPENSE", color: "#3b82f6", icon: "car", isDefault: true },
      { userId: newUser.id, name: "Tempat Tinggal", type: "EXPENSE", color: "#8b5cf6", icon: "home", isDefault: true },
    ],
  });

  // Buat notifikasi sambutan
  await prisma.notification.create({
    data: {
      userId: newUser.id,
      title: "Selamat Datang di LifeOS!",
      message: "Akun Anda telah aktif. Mulai dengan membuat rencana hari ini di Smart Planner.",
      type: "SYSTEM",
      link: "/app/planner",
    },
  });

  const token = await createSessionToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: "USER",
  });

  setSessionCookie(token);

  return { success: true, message: "Pendaftaran berhasil!" };
}

export async function logoutAction(): Promise<void> {
  clearSessionCookie();
  redirect("/login");
}

