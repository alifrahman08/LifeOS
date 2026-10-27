import { FinancialSummary, BudgetUsage } from "@/types";

export interface TransactionItem {
  id: string;
  amount: number;
  type: string; // INCOME, EXPENSE, TRANSFER
  date: Date | string;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color?: string | null;
  };
  amount: number;
  warningThreshold: number; // e.g. 80 (%)
}

/**
 * Menghitung ringkasan keuangan (Pemasukan, Pengeluaran, Arus Kas Bersih, Rasio Tabungan)
 */
export function calculateFinancialSummary(
  transactions: TransactionItem[],
  previousMonthTransactions?: TransactionItem[]
): FinancialSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === "INCOME") {
      totalIncome += Number(tx.amount);
    } else if (tx.type === "EXPENSE") {
      totalExpense += Number(tx.amount);
    }
  }

  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netCashFlow / totalIncome) * 100)) : 0;

  let previousMonthComparison;
  if (previousMonthTransactions) {
    let prevIncome = 0;
    let prevExpense = 0;
    for (const tx of previousMonthTransactions) {
      if (tx.type === "INCOME") prevIncome += Number(tx.amount);
      else if (tx.type === "EXPENSE") prevExpense += Number(tx.amount);
    }

    const incomeDiffPercentage =
      prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0;
    const expenseDiffPercentage =
      prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : 0;

    previousMonthComparison = {
      incomeDiffPercentage,
      expenseDiffPercentage,
    };
  }

  return {
    totalIncome,
    totalExpense,
    netCashFlow,
    savingsRate,
    previousMonthComparison,
  };
}

/**
 * Menghitung penggunaan anggaran per kategori dan mendeteksi ambang batas peringatan
 */
export function calculateBudgetUsage(
  budgets: BudgetItem[],
  expenseTransactions: TransactionItem[]
): BudgetUsage[] {
  // Hitung total pengeluaran per kategori
  const spendingByCategory = new Map<string, number>();

  for (const tx of expenseTransactions) {
    if (tx.type === "EXPENSE" && tx.categoryId) {
      const current = spendingByCategory.get(tx.categoryId) || 0;
      spendingByCategory.set(tx.categoryId, current + Number(tx.amount));
    }
  }

  return budgets.map((b) => {
    const spentAmount = spendingByCategory.get(b.categoryId) || 0;
    const budgetAmount = Number(b.amount);
    const remainingAmount = Math.max(0, budgetAmount - spentAmount);
    const usagePercentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
    const isExceeded = spentAmount > budgetAmount;
    const isWarning = usagePercentage >= b.warningThreshold && !isExceeded;

    return {
      categoryId: b.categoryId,
      categoryName: b.category?.name || "Kategori",
      categoryColor: b.category?.color || "#0d9488",
      budgetAmount,
      spentAmount,
      remainingAmount,
      usagePercentage,
      isWarning,
      isExceeded,
    };
  });
}
