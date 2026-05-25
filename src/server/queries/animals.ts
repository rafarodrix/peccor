import { prisma } from "@/lib/prisma";

export async function getAnimals(tenantId: string, farmId?: string, lotId?: string) {
  return prisma.animal.findMany({
    where: {
      farm: { tenantId },
      ...(farmId ? { farmId } : {}),
      ...(lotId ? { lotId } : {}),
    },
    include: {
      farm: { select: { name: true } },
      lot: { select: { code: true } },
      weighings: {
        orderBy: { date: "desc" },
        take: 1,
        select: { weight: true, date: true, dailyGain: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getAnimalById(id: string, tenantId: string) {
  return prisma.animal.findFirst({
    where: { id, farm: { tenantId } },
    include: {
      farm: { select: { name: true } },
      lot: { select: { code: true, description: true } },
      weighings: { orderBy: { date: "desc" } },
      healthEvents: { orderBy: { date: "desc" } },
      movements: { orderBy: { date: "desc" } },
    },
  });
}
