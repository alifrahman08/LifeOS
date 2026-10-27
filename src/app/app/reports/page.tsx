import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReportsClient } from "@/components/reports/ReportsClient";
import { calculateFinancialSummary } from "@/lib/finance";
import { calculateHabitStats } from "@/lib/habit";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default async function ReportsPage() {
  const user = await requireUser();
  const userId = user.id;

  const now = new Date();

  // 1. Task Stats
  const totalTasks = await prisma.task.count({ where: { userId } });
  const completedTasks = await prisma.task.count({ where: { userId, status: "COMPLETED" } });
  const overdueTasks = await prisma.task.count({
    where: {
      userId,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      dueDate: { lt: startOfDay(now) },
    },
  });
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Habit Stats
  const thirtyDaysAgo = subDays(now, 30);
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { checkIns: { where: { createdAt: { gte: thirtyDaysAgo } } } },
  });

  let habitSum = 0;
  let totalCheckInsCount = 0;
  habits.forEach((h) => {
    habitSum += calculateHabitStats(h, h.checkIns, now).completionRate;
    totalCheckInsCount += h.checkIns.length;
  });
  const avgHabit = habits.length > 0 ? Math.round(habitSum / habits.length) : 0;

  // 3. Finance Stats
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    },
    include: { category: true },
  });
  const finSummary = calculateFinancialSummary(transactions as any);

  // 4. Goal Stats
  const totalGoals = await prisma.goal.count({ where: { userId } });
  const completedGoals = await prisma.goal.count({ where: { userId, status: "COMPLETED" } });
  const activeGoals = await prisma.goal.count({ where: { userId, status: "ACTIVE" } });

  // 5. Weekly tasks chart
  const weeklyTasksChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i);
    const completed = await prisma.task.count({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: { gte: startOfDay(d), lte: endOfDay(d) },
      },
    });
    weeklyTasksChart.push({
      day: format(d, "EEE", { locale: localeId }),
      selesai: completed,
    });
  }

  // 6. Category expense chart
  const categorySpendingMap = new Map<string, { name: string; value: number; color: string }>();
  transactions
    .filter((t) => t.type === "EXPENSE" && t.category)
    .forEach((t) => {
      const cat = t.category!;
      const existing = categorySpendingMap.get(cat.id);
      if (existing) existing.value += t.amount;
      else categorySpendingMap.set(cat.id, { name: cat.name, value: t.amount, color: cat.color || "#0d9488" });
    });
  const categoryExpenseChart = Array.from(categorySpendingMap.values());

  return (
    <ReportsClient
      productivityStats={{
        totalTasks,
        completedTasks,
        completionRate,
        overdueTasks,
      }}
      habitStats={{
        totalHabits: habits.length,
        averageConsistency: avgHabit,
        totalCheckIns: totalCheckInsCount,
      }}
      financeStats={finSummary}
      goalStats={{
        totalGoals,
        completedGoals,
        activeGoals,
      }}
      weeklyTasksChart={weeklyTasksChart}
      categoryExpenseChart={categoryExpenseChart}
    />
  );
}
