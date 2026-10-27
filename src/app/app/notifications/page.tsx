import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return <NotificationsClient initialNotifications={notifications} />;
}

