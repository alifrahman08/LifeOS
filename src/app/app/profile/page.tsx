import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const session = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { profile: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return <ProfileClient user={user} />;
}

