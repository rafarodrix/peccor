import { prisma } from "@/lib/prisma";
import {
  getAnimalOptions,
  getFarmOptions,
  getLotOptions,
} from "@/server/queries/reference";

export async function getWeighingsPageData(tenantId: string) {
  const [farms, lots, animals, weighings] = await Promise.all([
    getFarmOptions(tenantId),
    getLotOptions(tenantId),
    getAnimalOptions(tenantId),
    prisma.weighing.findMany({
      where: { farm: { tenantId } },
      include: {
        lot: { select: { code: true } },
        animal: { select: { tag: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    }),
  ]);

  return { farms, lots, animals, weighings };
}
