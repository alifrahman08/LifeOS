import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdminClient } from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const session = await getSession();

  // Proteksi server-side: hanya ADMIN yang berhak mengakses
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/app/dashboard");
  }

  // Ambil metrik agregat
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { isActive: true } });
  const totalTasks = await prisma.task.count();
  const totalHabits = await prisma.habit.count();
  const totalTransactions = await prisma.transaction.count();

  // Ambil daftar pengguna beserta hitungan aktivitas agregat
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          tasks: true,
          habits: true,
          transactions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Ambil pengumuman
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Ambil audit log keamanan
  const auditLogs = await prisma.auditLog.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminClient
        stats={{
          totalUsers,
          activeUsers,
          totalTasks,
          totalHabits,
          totalTransactions,
        }}
        users={users as any}
        announcements={announcements}
        auditLogs={auditLogs as any}
      />
    </div>
  );
}
