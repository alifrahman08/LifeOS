"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ActionResult } from "./auth";

export async function createTransactionAction(data: {
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  date: string; // YYYY-MM-DD
  categoryId?: string;
  accountId?: string;
  notes?: string;
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!data.title || data.title.trim() === "") {
    return { success: false, message: "Keterangan transaksi wajib diisi." };
  }

  const amount = Math.abs(Number(data.amount));
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Nominal transaksi harus lebih dari Rp 0." };
  }

  const txDate = data.date ? new Date(data.date) : new Date();

  // Simpan transaksi
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      title: data.title.trim(),
      amount,
      type: data.type,
      date: txDate,
      categoryId: data.categoryId || null,
      accountId: data.accountId || null,
      notes: data.notes?.trim() || null,
    },
    include: { category: true },
  });

  // Jika terhubung ke FinancialAccount, perbarui saldo akun
  if (data.accountId) {
    const account = await prisma.financialAccount.findUnique({
      where: { id: data.accountId },
    });
    if (account) {
      const balanceChange = data.type === "INCOME" ? amount : -amount;
      await prisma.financialAccount.update({
        where: { id: account.id },
        data: { balance: account.balance + balanceChange },
      });
    }
  }

  // Jika EXPENSE dan memiliki categoryId, periksa ambang batas anggaran bulan ini
  if (data.type === "EXPENSE" && data.categoryId) {
    const month = txDate.getMonth() + 1;
    const year = txDate.getFullYear();

    const budget = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId: data.categoryId,
          month,
          year,
        },
      },
      include: { category: true },
    });

    if (budget) {
      // Hitung total pengeluaran kategori ini di bulan berjalan
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      const expenses = await prisma.transaction.aggregate({
        where: {
          userId: user.id,
          categoryId: data.categoryId,
          type: "EXPENSE",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      });

      const totalSpent = expenses._sum.amount || 0;
      const usagePercent = Math.round((totalSpent / budget.amount) * 100);

      if (usagePercent >= budget.warningThreshold) {
        // Buat notifikasi peringatan anggaran jika belum ada notifikasi serupa hari ini
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: `Peringatan Anggaran: ${budget.category.name}`,
            message: `Pengeluaran telah mencapai ${usagePercent}% dari batas anggaran Rp ${new Intl.NumberFormat(
              "id-ID"
            ).format(budget.amount)}.`,
            type: "BUDGET",
            link: "/app/budgets",
          },
        });
      }
    }
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/finance");
  revalidatePath("/app/budgets");
  revalidatePath("/app/reports");

  return { success: true, message: "Transaksi berhasil dicatat.", data: transaction };
}

export async function deleteTransactionAction(txId: string): Promise<ActionResult> {
  const user = await requireUser();

  const tx = await prisma.transaction.findFirst({
    where: { id: txId, userId: user.id },
  });

  if (!tx) {
    return { success: false, message: "Transaksi tidak ditemukan." };
  }

  // Kembalikan saldo akun jika terhubung
  if (tx.accountId) {
    const account = await prisma.financialAccount.findUnique({
      where: { id: tx.accountId },
    });
    if (account) {
      const rollbackChange = tx.type === "INCOME" ? -tx.amount : tx.amount;
      await prisma.financialAccount.update({
        where: { id: account.id },
        data: { balance: account.balance + rollbackChange },
      });
    }
  }

  await prisma.transaction.delete({
    where: { id: txId },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/finance");
  revalidatePath("/app/budgets");
  revalidatePath("/app/reports");

  return { success: true, message: "Transaksi berhasil dihapus dan saldo disesuaikan." };
}

export async function createBudgetAction(data: {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  warningThreshold?: number;
}): Promise<ActionResult> {
  const user = await requireUser();

  const amount = Math.abs(Number(data.amount));
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Batas anggaran harus lebih dari Rp 0." };
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: user.id,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      amount,
      warningThreshold: data.warningThreshold ? Number(data.warningThreshold) : 80,
    },
    create: {
      userId: user.id,
      categoryId: data.categoryId,
      month: data.month,
      year: data.year,
      amount,
      warningThreshold: data.warningThreshold ? Number(data.warningThreshold) : 80,
    },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/budgets");
  revalidatePath("/app/finance");

  return { success: true, message: "Anggaran berhasil disimpan.", data: budget };
}

export async function deleteBudgetAction(budgetId: string): Promise<ActionResult> {
  const user = await requireUser();

  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId: user.id },
  });

  if (!budget) {
    return { success: false, message: "Anggaran tidak ditemukan." };
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  });

  revalidatePath("/app/budgets");
  revalidatePath("/app/dashboard");

  return { success: true, message: "Anggaran berhasil dihapus." };
}

export async function createSavingsGoalAction(data: {
  name: string;
  targetAmount: number;
  initialAmount?: number;
  targetDate?: string;
  icon?: string;
}): Promise<ActionResult> {
  const user = await requireUser();

  if (!data.name || data.name.trim() === "") {
    return { success: false, message: "Nama target tabungan wajib diisi." };
  }

  const targetAmount = Math.abs(Number(data.targetAmount));
  const currentAmount = data.initialAmount ? Math.abs(Number(data.initialAmount)) : 0;

  const savings = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: data.name.trim(),
      targetAmount,
      currentAmount,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      icon: data.icon || "piggy-bank",
    },
  });

  revalidatePath("/app/finance");
  revalidatePath("/app/dashboard");
  return { success: true, message: "Target tabungan baru berhasil dibuat.", data: savings };
}

export async function addSavingsContributionAction(
  savingsGoalId: string,
  amount: number,
  type: "DEPOSIT" | "WITHDRAWAL",
  notes?: string
): Promise<ActionResult> {
  const user = await requireUser();

  const savings = await prisma.savingsGoal.findFirst({
    where: { id: savingsGoalId, userId: user.id },
  });

  if (!savings) {
    return { success: false, message: "Target tabungan tidak ditemukan." };
  }

  const numAmount = Math.abs(Number(amount));
  if (isNaN(numAmount) || numAmount <= 0) {
    return { success: false, message: "Nominal harus lebih dari Rp 0." };
  }

  const newCurrent =
    type === "DEPOSIT"
      ? savings.currentAmount + numAmount
      : Math.max(0, savings.currentAmount - numAmount);

  await prisma.$transaction([
    prisma.savingsContribution.create({
      data: {
        savingsGoalId,
        amount: numAmount,
        type,
        notes: notes?.trim() || null,
      },
    }),
    prisma.savingsGoal.update({
      where: { id: savingsGoalId },
      data: { currentAmount: newCurrent },
    }),
  ]);

  // Periksa apakah ada Goal yang auto-calculated dari SAVINGS
  const linkedGoal = await prisma.goal.findFirst({
    where: { userId: user.id, autoSource: "SAVINGS", status: "ACTIVE" },
  });
  if (linkedGoal) {
    const isCompleted = newCurrent >= linkedGoal.targetValue;
    await prisma.goal.update({
      where: { id: linkedGoal.id },
      data: {
        currentValue: newCurrent,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
      },
    });
  }

  revalidatePath("/app/finance");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/goals");

  return {
    success: true,
    message: type === "DEPOSIT" ? "Setoran tabungan berhasil dicatat!" : "Penarikan tabungan berhasil dicatat.",
  };
}

