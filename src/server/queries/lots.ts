import { prisma } from "@/lib/prisma";
import { getFarmOptions } from "@/server/queries/reference";

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

export async function getLotsPageData(tenantId: string) {
  const [lots, farms, areas] = await Promise.all([
    getLots(tenantId),
    getFarmOptions(tenantId),
    prisma.farmArea.findMany({
      where: { farm: { tenantId }, active: true },
      select: { id: true, name: true, farmId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { lots, farms, areas };
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

export async function getLotFinancialSnapshot(lotId: string) {
  const sales = await prisma.sale.findMany({
    where: {
      items: { some: { lotId } },
    },
    include: {
      items: { where: { lotId } },
    },
  });

  type SaleRow = (typeof sales)[number];
  type SaleItemRow = SaleRow["items"][number];

  const totalRevenue = sales.reduce((sum: number, sale: SaleRow) => {
    const lotRevenue = sale.items.reduce(
      (itemsSum: number, item: SaleItemRow) => itemsSum + Number(item.totalValue),
      0
    );
    return sum + lotRevenue;
  }, 0);

  return { sales, totalRevenue };
}
