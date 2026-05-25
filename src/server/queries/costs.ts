import { prisma } from "@/lib/prisma";
import { getFarmOptions, getLotOptions } from "@/server/queries/reference";

export async function getCostsPageData(tenantId: string) {
  const [farms, lots, costs] = await Promise.all([
    getFarmOptions(tenantId),
    getLotOptions(tenantId),
    prisma.cost.findMany({
      where: { farm: { tenantId }, status: { not: "CANCELED" } },
      include: { farm: { select: { name: true } }, lot: { select: { code: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  return { farms, lots, costs };
}
