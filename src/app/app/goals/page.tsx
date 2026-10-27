import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoalsClient } from "@/components/goals/GoalsClient";

export default async function GoalsPage() {
  const user = await requireUser();

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <GoalsClient initialGoals={goals as any} />;
}
