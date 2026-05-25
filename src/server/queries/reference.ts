import { prisma } from "@/lib/prisma";

export async function getFarmOptions(tenantId: string) {
  return prisma.farm.findMany({
    where: { tenantId, active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getLotOptions(tenantId: string) {
  return prisma.cattleLot.findMany({
    where: { farm: { tenantId }, status: "ACTIVE" },
    select: { id: true, code: true, farmId: true },
    orderBy: { code: "asc" },
  });
}

export async function getAnimalOptions(tenantId: string) {
  return prisma.animal.findMany({
    where: { farm: { tenantId }, status: "ACTIVE" },
    select: { id: true, tag: true, farmId: true },
    orderBy: { tag: "asc" },
  });
}
