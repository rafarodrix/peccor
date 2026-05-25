import { prisma } from "@/lib/prisma";
import { getFarmOptions, getLotOptions } from "@/server/queries/reference";

export async function getPurchasesPageData(tenantId: string) {
  const [farms, lots, purchases] = await Promise.all([
    getFarmOptions(tenantId),
    getLotOptions(tenantId),
    prisma.purchase.findMany({
      where: { farm: { tenantId } },
      include: { farm: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  return { farms, lots, purchases };
}
