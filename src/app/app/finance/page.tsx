import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FinanceClient } from "@/components/finance/FinanceClient";
import { calculateFinancialSummary } from "@/lib/finance";

export default async function FinancePage() {
  const user = await requireUser();

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: {
      category: true,
      account: true,
    },
    orderBy: { date: "desc" },
  });

  const accounts = await prisma.financialAccount.findMany({
    where: { userId: user.id },
  });

  const categories = await prisma.transactionCategory.findMany({
    where: {
      OR: [{ userId: user.id }, { isDefault: true }],
    },
  });

  const savingsGoals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
  });

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthTx = transactions.filter(
    (t) => new Date(t.date) >= currentMonthStart && new Date(t.date) <= currentMonthEnd
  );

  const summary = calculateFinancialSummary(monthTx as any);

  return (
    <FinanceClient
      initialTransactions={transactions as any}
      accounts={accounts as any}
      categories={categories as any}
      savingsGoals={savingsGoals as any}
      summary={summary}
    />
  );
}
