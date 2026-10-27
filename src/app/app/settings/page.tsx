import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const user = await requireUser();

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
  });

  const defaultPrefs = {
    currency: "IDR",
    timezone: "Asia/Jakarta",
    theme: "light",
    notifyEmail: true,
    notifyBrowser: true,
    notifyHabits: true,
    notifyBudget: true,
    notifyDeadlines: true,
    aiInsightsEnabled: true,
  };

  return <SettingsClient preferences={preferences || defaultPrefs} />;
}

