import { prisma } from "@/lib/prisma";

export async function getSettingsPageData(tenantId: string) {
  const [subscription, users, farmCount, animalCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { tenantId } }),
    prisma.tenantUser.findMany({
      where: { tenantId, active: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.farm.count({ where: { tenantId, active: true } }),
    prisma.animal.count({ where: { farm: { tenantId }, status: "ACTIVE" } }),
  ]);

  return {
    subscription,
    users,
    farmCount,
    animalCount,
  };
}
