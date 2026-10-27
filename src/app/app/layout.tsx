import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { MobileNav } from "@/components/app/MobileNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Ambil notifikasi pengguna
  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Hitung tugas terlambat (overdue)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueCount = await prisma.task.count({
    where: {
      userId: session.id,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      dueDate: { lt: today },
    },
  });

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        userRole={session.role}
        userName={session.name}
        userEmail={session.email}
        unreadCount={unreadCount}
        overdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar user={session} notifications={notifications} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}

