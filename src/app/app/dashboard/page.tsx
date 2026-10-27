import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getFocusTasksToday } from "@/lib/priority";
import { calculateHabitStats } from "@/lib/habit";
import { calculateFinancialSummary, calculateBudgetUsage } from "@/lib/finance";
import { getAIRecommendations } from "@/lib/ai";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default async function DashboardPage() {
  const user = await requireUser();
  const userId = user.id;

  const now = new Date();
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const startMonth = new Date(currentYear, currentMonth - 1, 1);
  const endMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  // 1. Query Tasks
  const allActiveTasks = await prisma.task.findMany({
    where: {
      userId,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
    include: { goal: true, subtasks: true },
    orderBy: { dueDate: "asc" },
  });

  const tasksCompletedTodayCount = await prisma.task.count({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: { gte: startToday, lte: endToday },
    },
  });

  // Urutkan dengan algoritma prioritas transparan
  const prioritizedFocus = getFocusTasksToday(
    allActiveTasks.map((t) => ({
      ...t,
      manualPriority: t.priority as any,
      hasActiveGoal: !!t.goalId,
    })),
    now,
    5
  );

  // 2. Query Habits & CheckIns 30 hari terakhir
  const thirtyDaysAgo = subDays(now, 30);
  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    include: {
      checkIns: {
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      },
    },
  });

  let totalHabitConsistencySum = 0;
  const habitsWithStats = habits.map((h) => {
    const stats = calculateHabitStats(h, h.checkIns, now);
    totalHabitConsistencySum += stats.completionRate;
    return {
      id: h.id,
      name: h.name,
      targetType: h.targetType,
      targetValue: h.targetValue,
      unit: h.unit,
      color: h.color,
      icon: h.icon,
      stats,
    };
  });

  const averageHabitCompletion =
    habits.length > 0 ? Math.round(totalHabitConsistencySum / habits.length) : 0;

  // 3. Query Financials & Budgets
  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startMonth, lte: endMonth },
    },
    include: { category: true },
  });

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month: currentMonth,
      year: currentYear,
    },
    include: { category: true },
  });

  const financialSummary = calculateFinancialSummary(monthTransactions);
  const budgetUsages = calculateBudgetUsage(budgets as any, monthTransactions as any);
  const budgetAlerts = budgetUsages.filter((b) => b.isWarning || b.isExceeded);

  // 4. Query Goals
  const activeGoals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { targetDate: "asc" },
  });

  // 5. Query Calendar Events Hari Ini
  const todayAgenda = await prisma.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: startToday, lte: endToday },
    },
    orderBy: { startTime: "asc" },
  });

  // 6. Produktivitas 7 Hari Terakhir
  const weeklyProductivity = [];
  for (let i = 6; i >= 0; i--) {
    const targetDay = subDays(now, i);
    const dayStart = startOfDay(targetDay);
    const dayEnd = endOfDay(targetDay);

    const completedOnDay = await prisma.task.count({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: { gte: dayStart, lte: dayEnd },
      },
    });

    const createdOnDay = await prisma.task.count({
      where: {
        userId,
        createdAt: { gte: dayStart, lte: dayEnd },
      },
    });

    weeklyProductivity.push({
      day: format(targetDay, "EEE", { locale: localeId }),
      completed: completedOnDay,
      created: createdOnDay,
    });
  }

  // 7. Tren Arus Kas (Bulan Lalu vs Bulan Ini)
  const prevMonthStart = new Date(currentYear, currentMonth - 2, 1);
  const prevMonthEnd = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59);

  const prevMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: prevMonthStart, lte: prevMonthEnd },
    },
  });

  const prevSummary = calculateFinancialSummary(prevMonthTransactions);

  const cashflowTrends = [
    {
      month: format(prevMonthStart, "MMM yyyy", { locale: localeId }),
      pemasukan: prevSummary.totalIncome,
      pengeluaran: prevSummary.totalExpense,
    },
    {
      month: format(now, "MMM yyyy", { locale: localeId }),
      pemasukan: financialSummary.totalIncome,
      pengeluaran: financialSummary.totalExpense,
    },
  ];

  // 8. Generate AI / Rule-based Recommendations
  const aiContext = {
    tasks: {
      total: allActiveTasks.length,
      completed: tasksCompletedTodayCount,
      overdue: prioritizedFocus.filter((t) => t.priorityInfo.isOverdue).length,
      urgent: prioritizedFocus.filter((t) => t.priorityInfo.level === "URGENT").length,
      highPriorityTitles: prioritizedFocus.map((t) => t.title),
    },
    habits: {
      total: habits.length,
      completedToday: habitsWithStats.filter((h) => h.stats.completedToday).length,
      averageConsistency: averageHabitCompletion,
      strugglingHabitNames: habitsWithStats
        .filter((h) => h.stats.completionRate < 50)
        .map((h) => h.name),
    },
    finance: {
      totalIncome: financialSummary.totalIncome,
      totalExpense: financialSummary.totalExpense,
      netCashFlow: financialSummary.netCashFlow,
      budgetWarningCategories: budgetAlerts.map((b) => b.categoryName),
    },
    goals: {
      activeCount: activeGoals.length,
      completedCount: await prisma.goal.count({ where: { userId, status: "COMPLETED" } }),
      nearDeadlineTitles: activeGoals.map((g) => g.title),
    },
  };

  const aiResult = await getAIRecommendations(aiContext);

  // 9. Ambil Pengumuman Sistem
  const announcement = await prisma.announcement.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const budgetUsagePercent =
    budgets.length > 0
      ? Math.round(
          (budgetUsages.reduce((acc, b) => acc + b.spentAmount, 0) /
            budgets.reduce((acc, b) => acc + b.amount, 0)) *
            100
        )
      : 0;

  return (
    <DashboardClient
      userName={user.name}
      metrics={{
        tasksCompletedToday: tasksCompletedTodayCount,
        tasksRemainingToday: allActiveTasks.length,
        habitCompletionRate: averageHabitCompletion,
        totalIncomeMonth: financialSummary.totalIncome,
        totalExpenseMonth: financialSummary.totalExpense,
        budgetUsagePercent,
        activeGoalsCount: activeGoals.length,
      }}
      focusTasks={prioritizedFocus as any}
      habits={habitsWithStats}
      todayAgenda={todayAgenda}
      activeGoals={activeGoals}
      budgetAlerts={budgetAlerts}
      weeklyProductivity={weeklyProductivity}
      cashflowTrends={cashflowTrends}
      recommendations={aiResult.recommendations}
      announcement={announcement}
    />
  );
}
