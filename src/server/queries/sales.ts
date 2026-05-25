import { prisma } from "@/lib/prisma";
import { getFarmOptions, getLotOptions } from "@/server/queries/reference";

export async function getSalesPageData(tenantId: string) {
  const [farms, lots, sales] = await Promise.all([
    getFarmOptions(tenantId),
    getLotOptions(tenantId),
    prisma.sale.findMany({
      where: { farm: { tenantId } },
      include: { farm: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  return { farms, lots, sales };
}
