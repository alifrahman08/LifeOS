import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { HabitsClient } from "@/components/habits/HabitsClient";
import { calculateHabitStats } from "@/lib/habit";
import { subDays } from "date-fns";

export default async function HabitsPage() {
  const user = await requireUser();

  const thirtyDaysAgo = subDays(new Date(), 30);

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: {
      checkIns: {
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  const habitsWithStats = habits.map((h) => ({
    ...h,
    stats: calculateHabitStats(h, h.checkIns, now),
  }));

  return <HabitsClient initialHabits={habitsWithStats as any} />;
}
