import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { InsightsClient } from "@/components/insights/InsightsClient";
import { getAIRecommendations } from "@/lib/ai";
import { calculateHabitStats } from "@/lib/habit";
import { calculateFinancialSummary } from "@/lib/finance";
import { subDays } from "date-fns";

export default async function InsightsPage() {
  const user = await requireUser();

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  // Ambil data untuk context
  const tasks = await prisma.task.findMany({ where: { userId: user.id } });
  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: { checkIns: { where: { createdAt: { gte: thirtyDaysAgo } } } },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    },
  });

  const goals = await prisma.goal.findMany({ where: { userId: user.id } });

  const finSummary = calculateFinancialSummary(transactions as any);

  let habitSum = 0;
  habits.forEach((h) => {
    habitSum += calculateHabitStats(h, h.checkIns, now).completionRate;
  });
  const avgHabit = habits.length > 0 ? Math.round(habitSum / habits.length) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < today
  );

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const contextData = {
    tasks: {
      total: tasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      urgent: tasks.filter((t) => t.priority === "URGENT" && t.status !== "COMPLETED").length,
      highPriorityTitles: tasks.filter((t) => t.priority === "URGENT").map((t) => t.title),
    },
    habits: {
      total: habits.length,
      completedToday: habits.filter((h) =>
        h.checkIns.some((c) => c.date === now.toISOString().split("T")[0])
      ).length,
      averageConsistency: avgHabit,
      strugglingHabitNames: habits
        .filter((h) => calculateHabitStats(h, h.checkIns, now).completionRate < 50)
        .map((h) => h.name),
    },
    finance: {
      totalIncome: finSummary.totalIncome,
      totalExpense: finSummary.totalExpense,
      netCashFlow: finSummary.netCashFlow,
      budgetWarningCategories: [],
    },
    goals: {
      activeCount: goals.filter((g) => g.status === "ACTIVE").length,
      completedCount: goals.filter((g) => g.status === "COMPLETED").length,
      nearDeadlineTitles: goals.map((g) => g.title),
    },
  };

  const aiResult = await getAIRecommendations(contextData);

  return (
    <InsightsClient
      initialInsights={aiResult.recommendations}
      source={aiResult.source}
      explanation={aiResult.explanation}
      summaryData={{
        tasksCompleted: completedTasks.length,
        tasksOverdue: overdueTasks.length,
        habitConsistency: avgHabit,
        totalExpense: finSummary.totalExpense,
        totalIncome: finSummary.totalIncome,
        activeGoals: goals.filter((g) => g.status === "ACTIVE").length,
      }}
    />
  );
}

