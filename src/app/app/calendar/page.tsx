import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CalendarClient } from "@/components/calendar/CalendarClient";

export default async function CalendarPage() {
  const user = await requireUser();

  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id },
    orderBy: { startTime: "asc" },
  });

  const tasksWithDates = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: { not: null },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      dueTime: true,
      status: true,
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <CalendarClient
      initialEvents={events}
      tasksWithDates={tasksWithDates as any}
    />
  );
}

