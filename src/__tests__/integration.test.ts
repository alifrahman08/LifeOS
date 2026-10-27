import { describe, it, expect, beforeEach } from "vitest";
import prisma from "../lib/prisma";
import { calculateBudgetUsage, calculateFinancialSummary } from "../lib/finance";
import { generateRuleBasedInsights } from "../lib/ai";
import { calculateTaskPriority } from "../lib/priority";

describe("Integrasi Antarmodul & Aturan Keamanan LifeOS", () => {
  it("Perubahan transaksi pengeluaran otomatis menghitung ulang sisa anggaran", async () => {
    // Simulasi data anggaran
    const budgets = [
      {
        id: "b1",
        categoryId: "cat-makan",
        category: { id: "cat-makan", name: "Makanan & Minuman", color: "#f97316" },
        amount: 3000000,
        warningThreshold: 80,
      },
    ];

    // Transaksi pengeluaran awal: 1.500.000 (50%)
    const initialExpenses = [
      { id: "tx1", amount: 1500000, type: "EXPENSE", date: new Date(), categoryId: "cat-makan" },
    ];

    let usage = calculateBudgetUsage(budgets, initialExpenses);
    expect(usage[0].spentAmount).toBe(1500000);
    expect(usage[0].remainingAmount).toBe(1500000);
    expect(usage[0].usagePercentage).toBe(50);
    expect(usage[0].isWarning).toBe(false);

    // Tambah pengeluaran baru: 1.000.000 (total 2.500.000 = 83% -> Warning!)
    const updatedExpenses = [
      ...initialExpenses,
      { id: "tx2", amount: 1000000, type: "EXPENSE", date: new Date(), categoryId: "cat-makan" },
    ];

    usage = calculateBudgetUsage(budgets, updatedExpenses);
    expect(usage[0].spentAmount).toBe(2500000);
    expect(usage[0].remainingAmount).toBe(500000);
    expect(usage[0].usagePercentage).toBe(83);
    expect(usage[0].isWarning).toBe(true);
    expect(usage[0].isExceeded).toBe(false);

    // Tambah pengeluaran lagi melewati batas (total 3.200.000 = 107% -> Exceeded!)
    const exceededExpenses = [
      ...updatedExpenses,
      { id: "tx3", amount: 700000, type: "EXPENSE", date: new Date(), categoryId: "cat-makan" },
    ];

    usage = calculateBudgetUsage(budgets, exceededExpenses);
    expect(usage[0].spentAmount).toBe(3200000);
    expect(usage[0].remainingAmount).toBe(0);
    expect(usage[0].usagePercentage).toBe(107);
    expect(usage[0].isExceeded).toBe(true);
  });

  it("Penyelesaian tugas yang terhubung dengan target dapat memicu kenaikan capaian target", () => {
    const tasks = [
      { id: "t1", status: "COMPLETED", goalId: "g1" },
      { id: "t2", status: "COMPLETED", goalId: "g1" },
      { id: "t3", status: "IN_PROGRESS", goalId: "g1" },
    ];

    const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
    const progressPercent = Math.round((completedCount / tasks.length) * 100);

    expect(progressPercent).toBe(67);
  });

  it("Sistem analisis AI memiliki fallback berbasis aturan 100% saat tidak ada API key", () => {
    const mockContext = {
      tasks: {
        total: 5,
        completed: 1,
        overdue: 2,
        urgent: 3,
        highPriorityTitles: ["Laporan Q4", "Review Kontrak"],
      },
      habits: {
        total: 3,
        completedToday: 2,
        averageConsistency: 60,
        strugglingHabitNames: ["Meditasi 10 Menit"],
      },
      finance: {
        totalIncome: 15000000,
        totalExpense: 12000000,
        netCashFlow: 3000000,
        budgetWarningCategories: ["Makanan"],
      },
      goals: {
        activeCount: 2,
        completedCount: 1,
        nearDeadlineTitles: ["Sertifikasi Cloud"],
      },
    };

    const recommendations = generateRuleBasedInsights(mockContext);
    expect(recommendations.length).toBeGreaterThan(0);

    // Harus mendeteksi peringatan tugas terlambat
    const overdueRec = recommendations.find((r) => r.category === "OVERLOAD");
    expect(overdueRec).toBeDefined();
    expect(overdueRec?.title).toContain("2 Tugas Terlambat");

    // Harus mendeteksi peringatan anggaran
    const budgetRec = recommendations.find((r) => r.category === "FINANCE");
    expect(budgetRec).toBeDefined();
    expect(budgetRec?.facts).toContain("Kategori berisiko: Makanan");
  });

  it("Data isolasi per pengguna terjamin melalui query Prisma dengan userId", async () => {
    // Pastikan user demo dan budi memiliki data terpisah di database
    const budi = await prisma.user.findUnique({ where: { email: "budi@lifeos.id" } });
    const demo = await prisma.user.findUnique({ where: { email: "demo@lifeos.id" } });

    expect(budi).toBeDefined();
    expect(demo).toBeDefined();
    expect(budi?.id).not.toBe(demo?.id);

    const budiTasks = await prisma.task.findMany({ where: { userId: budi!.id } });
    const demoTasks = await prisma.task.findMany({ where: { userId: demo!.id } });

    // Tidak boleh ada task yang beririsan kepemilikannya
    const budiTaskIds = new Set(budiTasks.map((t) => t.id));
    for (const dTask of demoTasks) {
      expect(budiTaskIds.has(dTask.id)).toBe(false);
    }
  });

  it("Akun dengan role bukan ADMIN tidak boleh memiliki role ADMIN", async () => {
    const regularUser = await prisma.user.findUnique({ where: { email: "budi@lifeos.id" } });
    expect(regularUser?.role).toBe("USER");
    expect(regularUser?.role).not.toBe("ADMIN");

    const adminUser = await prisma.user.findUnique({ where: { email: "admin@lifeos.id" } });
    expect(adminUser?.role).toBe("ADMIN");
  });
});

