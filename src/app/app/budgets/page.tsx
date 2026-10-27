import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BudgetsClient } from "@/components/budgets/BudgetsClient";
import { calculateBudgetUsage } from "@/lib/finance";

export default async function BudgetsPage() {
  const user = await requireUser();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const startMonth = new Date(year, month - 1, 1);
  const endMonth = new Date(year, month, 0, 23, 59, 59);

  // Ambil data anggaran bulan ini
  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month,
      year,
    },
    include: { category: true },
  });

  // Ambil transaksi pengeluaran bulan ini
  const expenses = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: { gte: startMonth, lte: endMonth },
    },
    include: { category: true },
  });

  // Ambil daftar kategori pengeluaran
  const expenseCategories = await prisma.transactionCategory.findMany({
    where: {
      type: "EXPENSE",
      OR: [{ userId: user.id }, { isDefault: true }],
    },
  });

  // Hitung penggunaan anggaran
  const budgetUsages = calculateBudgetUsage(budgets as any, expenses as any);

  const budgetsWithId = budgetUsages.map((bu) => {
    const raw = budgets.find((b) => b.categoryId === bu.categoryId);
    return {
      ...bu,
      id: raw?.id || bu.categoryId,
      warningThreshold: raw?.warningThreshold || 80,
    };
  });

  return (
    <BudgetsClient
      initialBudgets={budgetsWithId}
      categories={expenseCategories}
      month={month}
      year={year}
    />
  );
}
