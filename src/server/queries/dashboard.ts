import { prisma } from "@/lib/prisma";

export async function getDashboardStats(tenantId: string) {
  const farms = await prisma.farm.findMany({
    where: { tenantId, active: true },
    select: { id: true },
  });
  const farmIds = farms.map((f: { id: string }) => f.id);

  const [
    activeAnimals,
    soldAnimals,
    deadAnimals,
    activeLots,
    recentWeighings,
    monthCosts,
    monthSales,
  ] = await Promise.all([
    prisma.animal.count({ where: { farmId: { in: farmIds }, status: "ACTIVE" } }),
    prisma.animal.count({ where: { farmId: { in: farmIds }, status: "SOLD" } }),
    prisma.animal.count({ where: { farmId: { in: farmIds }, status: "DEAD" } }),
    prisma.cattleLot.count({ where: { farmId: { in: farmIds }, status: "ACTIVE" } }),
    prisma.weighing.findMany({
      where: { farmId: { in: farmIds } },
      orderBy: { date: "desc" },
      take: 100,
      select: { weight: true, dailyGain: true },
    }),
    prisma.cost.aggregate({
      where: {
        farmId: { in: farmIds },
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.sale.aggregate({
      where: {
        farmId: { in: farmIds },
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { netValue: true },
    }),
  ]);

  const avgWeight =
    recentWeighings.length > 0
      ? recentWeighings.reduce(
          (sum: number, w: { weight: { toString(): string } }) => sum + Number(w.weight),
          0
        ) / recentWeighings.length
      : 0;

  const weighingsWithGain = recentWeighings.filter(
    (w: { dailyGain: unknown }) => w.dailyGain !== null
  );
  const avgDailyGain =
    weighingsWithGain.length > 0
      ? weighingsWithGain.reduce(
          (sum: number, w: { dailyGain: unknown }) => sum + Number(w.dailyGain),
          0
        ) / weighingsWithGain.length
      : 0;

  const monthlyCost = Number(monthCosts._sum.amount ?? 0);
  const monthlyRevenue = Number(monthSales._sum.netValue ?? 0);
  const costPerHeadDay = activeAnimals > 0 ? monthlyCost / activeAnimals / 30 : 0;

  return {
    activeAnimals,
    soldAnimals,
    deadAnimals,
    activeLots,
    avgWeight,
    avgDailyGain,
    monthlyCost,
    costPerHeadDay,
    monthlyRevenue,
    projectedProfit: monthlyRevenue - monthlyCost,
  };
}

export async function getRecentLots(tenantId: string, limit = 5) {
  const farms = await prisma.farm.findMany({
    where: { tenantId, active: true },
    select: { id: true },
  });
  const farmIds = farms.map((f: { id: string }) => f.id);

  const lots = await prisma.cattleLot.findMany({
    where: { farmId: { in: farmIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      costs: { select: { amount: true } },
    },
  });

  return lots.map(
    (lot: {
      id: string;
      code: string;
      phase: string;
      currentQuantity: number;
      currentAvgWeight: unknown;
      costs: Array<{ amount: unknown }>;
      status: string;
    }) => ({
      id: lot.id,
      code: lot.code,
      phase: lot.phase,
      currentQuantity: lot.currentQuantity,
      currentAvgWeight: lot.currentAvgWeight ? Number(lot.currentAvgWeight) : null,
      totalCost: lot.costs.reduce((sum: number, c: { amount: unknown }) => sum + Number(c.amount), 0),
      status: lot.status,
    })
  );
}
