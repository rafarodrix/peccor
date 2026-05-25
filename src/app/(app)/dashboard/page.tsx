import {
  Beef,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
  Weight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentLotsTable } from "@/components/dashboard/recent-lots-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getDashboardStats, getRecentLots } from "@/server/queries/dashboard";
import { getLayoutAlerts } from "@/app/(app)/layout";
import { OnboardingBanner } from "@/components/onboarding/onboarding-banner";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { tenant } = await requireTenant();

  const [stats, recentLots, alerts] = await Promise.all([
    getDashboardStats(tenant.id),
    getRecentLots(tenant.id),
    getLayoutAlerts(),
  ]);

  // Onboarding step detection
  const farms = await prisma.farm.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true },
  });
  const farmIds = farms.map((f: { id: string }) => f.id);
  const farmCount = farms.length;

  let onboardingStep: "no_farm" | "no_lot" | "no_weighing" | null = null;

  if (farmCount === 0) {
    onboardingStep = "no_farm";
  } else {
    const [lotCount, weighingCount] = await Promise.all([
      prisma.cattleLot.count({
        where: { farmId: { in: farmIds }, status: "ACTIVE" },
      }),
      prisma.weighing.count({
        where: {
          farmId: { in: farmIds },
          date: { gte: new Date(Date.now() - 30 * 86400000) },
        },
      }),
    ]);

    if (lotCount === 0) {
      onboardingStep = "no_lot";
    } else if (weighingCount === 0) {
      onboardingStep = "no_weighing";
    }
  }

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Visão geral da sua operação pecuária"
        alerts={alerts}
      />
      <div className="p-6 space-y-6">
        <OnboardingBanner step={onboardingStep} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Animais Ativos"
            value={formatNumber(stats.activeAnimals, 0)}
            description={`${stats.activeLots} lotes em andamento`}
            icon={Beef}
            variant="success"
          />
          <StatCard
            title="Peso Médio"
            value={`${formatNumber(stats.avgWeight)} kg`}
            description={`GMD médio: ${formatNumber(stats.avgDailyGain, 3)} kg/dia`}
            icon={Weight}
            variant="default"
          />
          <StatCard
            title="Custo Mensal"
            value={formatCurrency(stats.monthlyCost)}
            description={`${formatCurrency(stats.costPerHeadDay)}/cabeça/dia`}
            icon={TrendingDown}
            variant="warning"
          />
          <StatCard
            title="Receita no Mês"
            value={formatCurrency(stats.monthlyRevenue)}
            description={`Lucro: ${formatCurrency(stats.projectedProfit)}`}
            icon={TrendingUp}
            variant="success"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Animais Vendidos"
            value={formatNumber(stats.soldAnimals, 0)}
            description="Total histórico"
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Mortes / Perdas"
            value={formatNumber(stats.deadAnimals, 0)}
            description={
              stats.activeAnimals + stats.deadAnimals > 0
                ? `${formatNumber((stats.deadAnimals / (stats.activeAnimals + stats.deadAnimals)) * 100, 2)}% do rebanho`
                : "Nenhum animal registrado"
            }
            icon={Beef}
            variant="danger"
          />
          <StatCard
            title="Custo por Arroba"
            value={
              stats.activeAnimals > 0 && stats.avgWeight > 0
                ? formatCurrency(stats.monthlyCost / ((stats.activeAnimals * stats.avgWeight) / 15))
                : "—"
            }
            description="Custo médio de produção"
            icon={DollarSign}
            variant="warning"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lotes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentLotsTable lots={recentLots} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
