import { prisma } from "@/lib/prisma";

export async function getFarms(tenantId: string) {
  return prisma.farm.findMany({
    where: { tenantId, active: true },
    include: {
      _count: {
        select: {
          animals: { where: { status: "ACTIVE" } },
          lots: { where: { status: "ACTIVE" } },
          areas: { where: { active: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getFarmById(id: string, tenantId: string) {
  return prisma.farm.findFirst({
    where: { id, tenantId },
    include: {
      areas: { where: { active: true }, orderBy: { name: "asc" } },
      _count: {
        select: {
          animals: { where: { status: "ACTIVE" } },
          lots: { where: { status: "ACTIVE" } },
        },
      },
    },
  });
}
