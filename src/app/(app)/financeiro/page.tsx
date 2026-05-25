import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate, kgToArrobas } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getFinancePageData } from "@/server/queries/finance";
import { DfcService } from "@/server/services/dfc-service";
import { TrendingUp, Layers, Calendar, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";

type FinanceSaleRow = Awaited<ReturnType<typeof getFinancePageData>>["sales"][number];
type FinanceCostRow = Awaited<ReturnType<typeof getFinancePageData>>["costs"][number];

interface Props {
  searchParams: Promise<{ tab?: string; start?: string; end?: string }>;
}

export default async function FinanceiroPage({ searchParams }: Props) {
  const { tenant } = await requireTenant();
  const params = await searchParams;
  const activeTab = params.tab ?? "lotes";
  const startDate = params.start ?? "";
  const endDate = params.end ?? "";

  // 1. Carrega dados para a aba de Lotes (existente)
  const { sales, costs } = await getFinancePageData(tenant.id);

  // 2. Carrega dados para a DFC
  const dfc = await DfcService.generateDfcReport(tenant.id, startDate, endDate);

  const totalRevenue = sales.reduce(
    (s: number, sale: FinanceSaleRow) => s + Number(sale.netValue),
    0
  );
  const totalCosts = costs.reduce(
    (s: number, c: FinanceCostRow) => s + Number(c.amount),
    0
  );
  const netResult = totalRevenue - totalCosts;

  const costsByLot = costs.reduce<Record<string, number>>((acc: Record<string, number>, c: FinanceCostRow) => {
    if (c.lotId) acc[c.lotId] = (acc[c.lotId] ?? 0) + Number(c.amount);
    return acc;
  }, {});

  const dfcLabels: Record<string, string> = {
    OPERATIONAL: "Operacional (FCO)",
    INVESTMENT: "Investimento (FCI)",
    FINANCING: "Financiamento (FCF)",
  };

  return (
    <>
      <Header 
        title="Financeiro & Caixa" 
        subtitle="Analise os resultados operacionais e demonstrativos contábeis" 
      />

      <div className="p-6 space-y-6">
        {/* Abas de Navegação Premium */}
        <div className="flex border-b pb-px gap-4">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 font-semibold text-sm -mb-px transition-all ${
              activeTab === "lotes"
                ? "border-green-600 text-green-700 bg-green-50/30 dark:bg-green-950/10 dark:text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            asChild
          >
            <Link href="/financeiro?tab=lotes">
              <Layers className="h-4 w-4 mr-2" />
              Resultado por Lote
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 font-semibold text-sm -mb-px transition-all ${
              activeTab === "dfc"
                ? "border-green-600 text-green-700 bg-green-50/30 dark:bg-green-950/10 dark:text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            asChild
          >
            <Link href="/financeiro?tab=dfc">
              <TrendingUp className="h-4 w-4 mr-2" />
              Fluxo de Caixa (DFC)
            </Link>
          </Button>
        </div>

        {/* ─── ABA 1: RESULTADO POR LOTES ─────────────────────────────────────── */}
        {activeTab === "lotes" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-green-50/20 to-green-100/5 dark:from-green-950/5 dark:to-green-900/5">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Receita Total (Vendas)</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {formatCurrency(totalRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50/20 to-red-100/5 dark:from-red-950/5 dark:to-red-900/5">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Custos Operacionais Totais</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {formatCurrency(totalCosts)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50/20 to-blue-100/5 dark:from-blue-950/5 dark:to-blue-900/5">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Resultado Operacional Líquido</p>
                  <p className={`text-3xl font-bold mt-1 ${netResult >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600"}`}>
                    {formatCurrency(netResult)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Margem e Lucratividade por Lote Vendido</CardTitle>
                <CardDescription>Detalhamento de faturamento confrontado com custos diretos alocados ao lote</CardDescription>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada ainda.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Comprador</TableHead>
                        <TableHead>Fazenda</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Arrobas</TableHead>
                        <TableHead className="text-right">Valor Animais</TableHead>
                        <TableHead className="text-right">Receita Líquida</TableHead>
                        <TableHead className="text-right">Custos Lote</TableHead>
                        <TableHead className="text-right">Resultado</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale: FinanceSaleRow) => {
                        const linkedLotId = sale.items[0]?.lotId;
                        const lotCosts = linkedLotId ? (costsByLot[linkedLotId] ?? 0) : 0;
                        const netValue = Number(sale.netValue);
                        const profit = netValue - lotCosts;
                        const totalWeight = sale.totalWeight ? Number(sale.totalWeight) : null;
                        return (
                          <TableRow key={sale.id}>
                            <TableCell className="font-semibold">{sale.customerName}</TableCell>
                            <TableCell>{sale.farm.name}</TableCell>
                            <TableCell className="text-right font-medium">{sale.quantity}</TableCell>
                            <TableCell className="text-right">
                              {totalWeight ? `${formatNumber(kgToArrobas(totalWeight), 1)} @` : "—"}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(sale.animalValue))}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(netValue)}</TableCell>
                            <TableCell className="text-right text-destructive font-medium">{formatCurrency(lotCosts)}</TableCell>
                            <TableCell className={`text-right font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {formatCurrency(profit)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={profit >= 0 ? "success" : "destructive"} className="font-bold">
                                {profit >= 0 ? "LUCRO" : "PREJUÍZO"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── ABA 2: FLUXO DE CAIXA (DFC) ─────────────────────────────────────── */}
        {activeTab === "dfc" && (
          <div className="space-y-6">
            {/* Filtros de data simplificados integrados via URL query */}
            <Card className="bg-card">
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-sm">Filtros de Período</span>
                </div>
                <form className="flex items-center gap-3">
                  <input type="hidden" name="tab" value="dfc" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Início:</span>
                    <input 
                      type="date" 
                      name="start" 
                      defaultValue={startDate} 
                      className="flex h-8 rounded-md border border-input bg-transparent px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Fim:</span>
                    <input 
                      type="date" 
                      name="end" 
                      defaultValue={endDate} 
                      className="flex h-8 rounded-md border border-input bg-transparent px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <Button type="submit" size="sm" className="h-8">Filtrar</Button>
                  {(startDate || endDate) && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                      <Link href="/financeiro?tab=dfc">Limpar</Link>
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Sumário das 3 Atividades DFC */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Atividade Operacional (FCO)</p>
                    <p className={`text-xl font-bold mt-1 ${dfc.operationalFlow >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {formatCurrency(dfc.operationalFlow)}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${dfc.operationalFlow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                    {dfc.operationalFlow >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Atividade Investimento (FCI)</p>
                    <p className={`text-xl font-bold mt-1 ${dfc.investmentFlow >= 0 ? "text-blue-600" : "text-destructive"}`}>
                      {formatCurrency(dfc.investmentFlow)}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${dfc.investmentFlow >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
                    {dfc.investmentFlow >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Atividade Financiamento (FCF)</p>
                    <p className={`text-xl font-bold mt-1 ${dfc.financingFlow >= 0 ? "text-amber-600" : "text-destructive"}`}>
                      {formatCurrency(dfc.financingFlow)}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${dfc.financingFlow >= 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                    {dfc.financingFlow >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-md">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-green-100 uppercase">Geração Líquida de Caixa</p>
                    <p className="text-2xl font-bold mt-0.5">
                      {formatCurrency(dfc.netCashFlow)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/20 text-white">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demonstrativo Contábil Estruturado */}
            <Card>
              <CardHeader>
                <CardTitle>DFC - Demonstrativo do Fluxo de Caixa Gerencial</CardTitle>
                <CardDescription>
                  Entradas e saídas de caixa liquidadas no período organizadas por tipo de atividade
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Código</TableHead>
                      <TableHead>Conta Contábil / Descrição</TableHead>
                      <TableHead>Atividade DFC</TableHead>
                      <TableHead className="w-24 text-center">Fluxo</TableHead>
                      <TableHead className="text-right w-40">Total Líquido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dfc.details.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Nenhuma movimentação de caixa paga no período selecionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      dfc.details.map((item) => {
                        const isRoot = !item.code.includes(".");
                        const isSub = (item.code.match(/\./g) || []).length >= 2;
                        
                        return (
                          <TableRow key={item.id} className={isRoot ? "bg-muted/30 font-semibold" : ""}>
                            <TableCell className="font-mono text-xs font-semibold">
                              {item.code}
                            </TableCell>
                            <TableCell className={isSub ? "pl-8" : ""}>
                              {item.name}
                            </TableCell>
                            <TableCell>
                              {item.dfcCategory && (
                                <Badge
                                  variant={
                                    item.dfcCategory === "OPERATIONAL"
                                      ? "outline"
                                      : item.dfcCategory === "INVESTMENT"
                                      ? "default"
                                      : "destructive"
                                  }
                                  className={`text-[9px] font-bold ${
                                    item.dfcCategory === "OPERATIONAL"
                                      ? "border-emerald-600/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                                      : item.dfcCategory === "INVESTMENT"
                                      ? "bg-blue-600 text-white hover:bg-blue-600"
                                      : "bg-amber-600 text-white hover:bg-amber-600"
                                  }`}
                                >
                                  {dfcLabels[item.dfcCategory] ?? item.dfcCategory}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={item.type === "INFLOW" ? "success" : "secondary"} className="text-[9px] font-bold">
                                {item.type === "INFLOW" ? "ENTRADA" : "SAÍDA"}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              item.type === "INFLOW" ? "text-green-600 font-semibold" : "text-muted-foreground"
                            }`}>
                              {item.type === "INFLOW" ? "+" : "-"}{formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
