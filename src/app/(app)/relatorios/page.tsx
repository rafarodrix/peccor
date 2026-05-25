import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { FileText, Download, Printer } from "lucide-react";

export default async function RelatoriosPage() {
  const { tenant } = await requireTenant();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const farms = await prisma.farm.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true },
  });
  const farmIds = farms.map((f) => f.id);

  const [totalAnimals, totalLots, monthCosts, monthSales] = await Promise.all([
    prisma.animal.count({ where: { farmId: { in: farmIds }, status: "ACTIVE" } }),
    prisma.cattleLot.count({ where: { farmId: { in: farmIds }, status: "ACTIVE" } }),
    prisma.cost.aggregate({
      where: {
        farmId: { in: farmIds },
        date: { gte: monthStart },
        status: { not: "CANCELED" },
      },
      _sum: { amount: true },
    }),
    prisma.sale.aggregate({
      where: {
        farmId: { in: farmIds },
        date: { gte: monthStart },
      },
      _sum: { netValue: true },
    }),
  ]);

  const totalMonthCost = Number(monthCosts._sum.amount ?? 0);
  const totalMonthSales = Number(monthSales._sum.netValue ?? 0);

  return (
    <>
      <Header title="Relatórios" subtitle="Exportações e relatórios gerenciais" />
      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Animais Ativos</p>
              <p className="text-2xl font-bold">{formatNumber(totalAnimals, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Lotes Ativos</p>
              <p className="text-2xl font-bold">{formatNumber(totalLots, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Custo do Mês</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMonthCost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Receita do Mês</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthSales)}</p>
            </CardContent>
          </Card>
        </div>

        {/* CSV Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportações CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Baixe os dados em formato CSV para análise em planilhas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href="/api/relatorios/animais">
                  <FileText className="mr-2 h-4 w-4" />
                  Animais CSV
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/api/relatorios/custos">
                  <FileText className="mr-2 h-4 w-4" />
                  Custos CSV
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/api/relatorios/pesagens">
                  <FileText className="mr-2 h-4 w-4" />
                  Pesagens CSV
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PDF Print Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Relatórios para Impressão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Abra o relatório em uma nova aba e use a função de impressão do navegador para gerar PDF.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href="/relatorios/dre/print" target="_blank" rel="noopener noreferrer">
                  <Printer className="mr-2 h-4 w-4" />
                  DRE
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/relatorios/lotes/print" target="_blank" rel="noopener noreferrer">
                  <Printer className="mr-2 h-4 w-4" />
                  Lotes
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/relatorios/animais/print" target="_blank" rel="noopener noreferrer">
                  <Printer className="mr-2 h-4 w-4" />
                  Animais
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
