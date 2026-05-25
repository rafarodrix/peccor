import { prisma } from "@/lib/prisma";

export async function getFinancePageData(tenantId: string) {
  const [sales, costs] = await Promise.all([
    prisma.sale.findMany({
      where: { farm: { tenantId } },
      include: {
        farm: { select: { name: true } },
        items: { include: { lot: { select: { code: true } } } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.cost.findMany({
      where: { farm: { tenantId }, status: { not: "CANCELED" } },
      select: { amount: true, type: true, lotId: true },
    }),
  ]);

  return { sales, costs };
}
