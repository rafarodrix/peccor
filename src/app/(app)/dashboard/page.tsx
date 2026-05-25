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

// Dados de exemplo para o MVP - substituir por dados reais via Prisma
const mockStats = {
  activeAnimals: 450,
  soldAnimals: 120,
  deadAnimals: 3,
  activeLots: 6,
  avgWeight: 342.5,
  avgDailyGain: 1.15,
  monthlyCost: 38500,
  costPerHeadDay: 2.85,
  monthlyRevenue: 95000,
  projectedProfit: 56500,
};

const mockLots = [
  {
    id: "1",
    code: "ENGORDA-2026-01",
    phase: "ENGORDA",
    currentQuantity: 80,
    currentAvgWeight: 380,
    totalCost: 125000,
    status: "ACTIVE",
  },
  {
    id: "2",
    code: "TERMINACAO-2026-01",
    phase: "TERMINACAO",
    currentQuantity: 45,
    currentAvgWeight: 460,
    totalCost: 88000,
    status: "ACTIVE",
  },
  {
    id: "3",
    code: "RECRIA-2026-01",
    phase: "RECRIA",
    currentQuantity: 120,
    currentAvgWeight: 260,
    totalCost: 142000,
    status: "ACTIVE",
  },
  {
    id: "4",
    code: "ENGORDA-2025-12",
    phase: "ENGORDA",
    currentQuantity: 0,
    currentAvgWeight: null,
    totalCost: 95000,
    status: "SOLD",
  },
];

export default function DashboardPage() {
  const stats = mockStats;

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Visão geral da sua operação pecuária"
      />
      <div className="p-6 space-y-6">
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
            description={`${formatNumber((stats.deadAnimals / (stats.activeAnimals + stats.deadAnimals)) * 100, 2)}% do rebanho`}
            icon={Beef}
            variant="danger"
          />
          <StatCard
            title="Custo por Arroba"
            value={formatCurrency(
              stats.monthlyCost /
                ((stats.activeAnimals * stats.avgWeight) / 15)
            )}
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
            <RecentLotsTable lots={mockLots} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
