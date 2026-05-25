import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export interface Alert {
  type: "cost_due" | "no_weighing" | "withdrawal_ending" | "low_gmd";
  severity: "warning" | "danger";
  title: string;
  description: string;
  link?: string;
}

export async function getAlerts(tenantId: string): Promise<Alert[]> {
  const farms = await prisma.farm.findMany({
    where: { tenantId },
    select: { id: true },
  });
  const farmIds = farms.map((f: { id: string }) => f.id);

  if (farmIds.length === 0) return [];

  const now = Date.now();
  const in7Days = new Date(now + 7 * 86400000);
  const days30Ago = new Date(now - 30 * 86400000);
  const days90Ago = new Date(now - 90 * 86400000);

  const [dueCosts, animalsWithWeighings, recentHealthEvents, activeLots] =
    await Promise.all([
      // Query 1: Costs due in next 7 days
      prisma.cost.findMany({
        where: {
          farmId: { in: farmIds },
          status: "OPEN",
          dueDate: {
            lte: in7Days,
            gte: new Date(),
          },
        },
        select: { id: true, description: true, dueDate: true },
      }),

      // Query 2: Animals without weighing in 30+ days
      prisma.animal.findMany({
        where: {
          farmId: { in: farmIds },
          status: "ACTIVE",
        },
        select: {
          id: true,
          weighings: {
            orderBy: { date: "desc" },
            take: 1,
            select: { date: true },
          },
        },
      }),

      // Query 3: Health events with withdrawal period ending in 7 days
      prisma.healthEvent.findMany({
        where: {
          animal: { farm: { tenantId } },
          withdrawalDays: { gt: 0 },
          date: { gte: days90Ago },
        },
        select: { id: true, date: true, withdrawalDays: true },
      }),

      // Query 4: Lots with low GMD (<0.8)
      prisma.cattleLot.findMany({
        where: {
          farmId: { in: farmIds },
          status: "ACTIVE",
        },
        select: {
          id: true,
          code: true,
          weighings: {
            orderBy: { date: "desc" },
            take: 1,
            select: { dailyGain: true },
          },
        },
      }),
    ]);

  const alerts: Alert[] = [];

  // Cost due alerts (one per cost)
  for (const cost of dueCosts) {
    alerts.push({
      type: "cost_due",
      severity: "warning",
      title: `Custo vencendo: ${cost.description}`,
      description: `Vence em ${formatDate(cost.dueDate)}`,
      link: "/custos",
    });
  }

  // No weighing alert (grouped)
  const animalsWithoutWeighing = animalsWithWeighings.filter(
    (a: { weighings: Array<{ date: Date }> }) =>
      a.weighings.length === 0 || a.weighings[0].date < days30Ago
  );
  if (animalsWithoutWeighing.length > 0) {
    alerts.push({
      type: "no_weighing",
      severity: "warning",
      title: `${animalsWithoutWeighing.length} animais sem pesagem`,
      description: "Sem pesagem há mais de 30 dias",
      link: "/rebanho",
    });
  }

  // Withdrawal ending alert (grouped)
  const withdrawalEnding = recentHealthEvents.filter(
    (event: { date: Date; withdrawalDays: number | null }) => {
      if (!event.withdrawalDays) return false;
      const endTime =
        new Date(event.date).getTime() + event.withdrawalDays * 86400000;
      return endTime >= now && endTime <= now + 7 * 86400000;
    }
  );
  if (withdrawalEnding.length > 0) {
    alerts.push({
      type: "withdrawal_ending",
      severity: "warning",
      title: `${withdrawalEnding.length} carências sanitárias terminando`,
      description: "Carência sanitária termina em até 7 dias",
      link: "/rebanho",
    });
  }

  // Low GMD alert (grouped)
  const lowGmdLots = activeLots.filter(
    (lot: { weighings: Array<{ dailyGain: unknown }> }) => {
      const gain = lot.weighings[0]?.dailyGain;
      return gain != null && Number(gain) < 0.8;
    }
  );
  if (lowGmdLots.length > 0) {
    alerts.push({
      type: "low_gmd",
      severity: "danger",
      title: `${lowGmdLots.length} lotes com GMD baixo`,
      description: "GMD abaixo de 0,8 kg/dia",
      link: "/lotes",
    });
  }

  // Sort: danger first, then warning
  return alerts.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "danger" ? -1 : 1;
  });
}
