export type UserRole = "USER" | "ADMIN" | "DEMO";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "INBOX" | "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface PriorityScore {
  score: number; // 0 - 100
  level: TaskPriority;
  reason: string;
  isOverdue: boolean;
  daysUntilDue: number | null;
}

export type HabitCategory = "HEALTH" | "PRODUCTIVITY" | "LEARNING" | "MINDFULNESS" | "FINANCE";
export type HabitFrequency = "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";
export type HabitTargetType = "BOOLEAN" | "NUMERIC";

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCheckIns: number;
  completionRate: number; // 0 - 100%
  completedToday: boolean;
  todayValue?: number;
}

export type GoalCategory = "CAREER" | "FINANCE" | "HEALTH" | "LEARNING" | "PERSONAL";
export type GoalTargetType = "NUMERIC" | "MILESTONE" | "COMPLETION";
export type GoalStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  savingsRate: number; // percentage
  previousMonthComparison?: {
    incomeDiffPercentage: number;
    expenseDiffPercentage: number;
  };
}

export interface BudgetUsage {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  isWarning: boolean;
  isExceeded: boolean;
}

export interface AIInsightRecommendation {
  id: string;
  title: string;
  summary: string;
  category: "OVERLOAD" | "FINANCE" | "HABIT" | "GOAL" | "FOCUS";
  facts: string[];
  recommendation: string;
  actionText?: string;
  actionUrl?: string;
}
