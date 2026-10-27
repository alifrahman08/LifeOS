import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PlannerClient } from "@/components/planner/PlannerClient";
import { calculateTaskPriority } from "@/lib/priority";

export default async function PlannerPage() {
  const user = await requireUser();

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    include: {
      category: true,
      goal: true,
      subtasks: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.taskCategory.findMany({
    where: { userId: user.id },
  });

  const goals = await prisma.goal.findMany({
    where: { userId: user.id, status: "ACTIVE" },
  });

  const now = new Date();

  // Hitung informasi prioritas transparan untuk setiap tugas
  const tasksWithPriority = tasks.map((t) => ({
    ...t,
    priorityInfo: calculateTaskPriority(
      {
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        manualPriority: t.priority as any,
        status: t.status,
        estimatedDuration: t.estimatedDuration,
        hasActiveGoal: !!t.goalId,
      },
      now
    ),
  }));

  return (
    <PlannerClient
      initialTasks={tasksWithPriority}
      categories={categories}
      goals={goals}
    />
  );
}

