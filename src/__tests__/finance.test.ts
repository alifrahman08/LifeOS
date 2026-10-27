import { describe, it, expect } from "vitest";
import { calculateFinancialSummary, calculateBudgetUsage } from "../lib/finance";

describe("Pengelolaan Keuangan & Anggaran", () => {
  it("Menghitung total pemasukan, pengeluaran, arus kas bersih, dan rasio tabungan", () => {
    const transactions = [
      { id: "1", amount: 15000000, type: "INCOME", date: new Date() },
      { id: "2", amount: 5000000, type: "EXPENSE", date: new Date() },
      { id: "3", amount: 2000000, type: "EXPENSE", date: new Date() },
    ];

    const prevTransactions = [
      { id: "p1", amount: 12000000, type: "INCOME", date: new Date() },
      { id: "p2", amount: 6000000, type: "EXPENSE", date: new Date() },
    ];

    const summary = calculateFinancialSummary(transactions, prevTransactions);

    expect(summary.totalIncome).toBe(15000000);
    expect(summary.totalExpense).toBe(7000000);
    expect(summary.netCashFlow).toBe(8000000);
    expect(summary.savingsRate).toBe(53); // 8M / 15M = 53.33% => 53%
    expect(summary.previousMonthComparison?.incomeDiffPercentage).toBe(25); // +25%
    expect(summary.previousMonthComparison?.expenseDiffPercentage).toBe(17); // +16.6% => 17%
  });

  it("Menghitung persentase penggunaan anggaran dan peringatan ambang batas", () => {
    const budgets = [
      {
        id: "b1",
        categoryId: "cat-makan",
        category: { id: "cat-makan", name: "Makanan" },
        amount: 2000000,
        warningThreshold: 80, // 80% = 1.600.000
      },
      {
        id: "b2",
        categoryId: "cat-transport",
        category: { id: "cat-transport", name: "Transportasi" },
        amount: 1000000,
        warningThreshold: 80,
      },
    ];

    const expenses = [
      { id: "e1", amount: 1700000, type: "EXPENSE", date: new Date(), categoryId: "cat-makan" }, // 85% -> Warning
      { id: "e2", amount: 1200000, type: "EXPENSE", date: new Date(), categoryId: "cat-transport" }, // 120% -> Exceeded
    ];

    const usage = calculateBudgetUsage(budgets, expenses);

    const makanUsage = usage.find((u) => u.categoryId === "cat-makan")!;
    expect(makanUsage.spentAmount).toBe(1700000);
    expect(makanUsage.usagePercentage).toBe(85);
    expect(makanUsage.isWarning).toBe(true);
    expect(makanUsage.isExceeded).toBe(false);

    const transportUsage = usage.find((u) => u.categoryId === "cat-transport")!;
    expect(transportUsage.spentAmount).toBe(1200000);
    expect(transportUsage.usagePercentage).toBe(120);
    expect(transportUsage.isExceeded).toBe(true);
  });
});
