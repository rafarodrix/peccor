import { prisma } from "@/lib/prisma";

export async function getLots(tenantId: string, farmId?: string) {
  const farms = farmId
    ? [{ id: farmId }]
    : await prisma.farm.findMany({ where: { tenantId }, select: { id: true } });
  const farmIds = farms.map((f: { id: string }) => f.id);

  return prisma.cattleLot.findMany({
    where: { farmId: { in: farmIds } },
    include: {
      farm: { select: { name: true } },
      area: { select: { name: true } },
      costs: { select: { amount: true, type: true } },
      _count: {
        select: { animals: true, weighings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLotById(id: string, tenantId: string) {
  return prisma.cattleLot.findFirst({
    where: {
      id,
      farm: { tenantId },
    },
    include: {
      farm: { select: { name: true } },
      area: { select: { name: true } },
      animals: {
        where: { status: "ACTIVE" },
        orderBy: { tag: "asc" },
        take: 50,
      },
      weighings: {
        orderBy: { date: "desc" },
        take: 10,
      },
      costs: {
        orderBy: { date: "desc" },
      },
    },
  });
}
