import { prisma } from "@/lib/prisma";
import { getFarmOptions, getLotOptions } from "@/server/queries/reference";

export async function getCostsPageData(tenantId: string) {
  const [farms, lots, costs, chartOfAccounts] = await Promise.all([
    getFarmOptions(tenantId),
    getLotOptions(tenantId),
    prisma.cost.findMany({
      where: { farm: { tenantId }, status: { not: "CANCELED" } },
      include: { 
        farm: { select: { name: true } }, 
        lot: { select: { code: true } },
        chartOfAccount: { select: { name: true, code: true } }
      },
      orderBy: { date: "desc" },
    }),
    prisma.chartOfAccount.findMany({
      where: { tenantId, active: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return { farms, lots, costs, chartOfAccounts };
}
