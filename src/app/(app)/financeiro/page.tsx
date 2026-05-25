import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, kgToArrobas } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getFinancePageData } from "@/server/queries/finance";

type FinanceSaleRow = Awaited<ReturnType<typeof getFinancePageData>>["sales"][number];
type FinanceCostRow = Awaited<ReturnType<typeof getFinancePageData>>["costs"][number];

export default async function FinanceiroPage() {
  const { tenant } = await requireTenant();
  const { sales, costs } = await getFinancePageData(tenant.id);

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

  return (
    <>
      <Header title="Financeiro" subtitle="Resultado por lote e demonstrativo financeiro" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Receita Total (vendas)</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Custos Totais</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCosts)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Resultado Líquido</p>
              <p className={`text-2xl font-bold ${netResult >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(netResult)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resultado por Venda</CardTitle>
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
                        <TableCell className="font-medium">{sale.customerName}</TableCell>
                        <TableCell>{sale.farm.name}</TableCell>
                        <TableCell className="text-right">{sale.quantity}</TableCell>
                        <TableCell className="text-right">
                          {totalWeight ? `${formatNumber(kgToArrobas(totalWeight), 1)} @` : "—"}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(sale.animalValue))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(netValue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(lotCosts)}</TableCell>
                        <TableCell className={`text-right font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(profit)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={profit >= 0 ? "success" : "destructive"}>
                            {profit >= 0 ? "Lucro" : "Prejuízo"}
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
    </>
  );
}
