import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, kgToArrobas } from "@/lib/utils";

// Dados mock para MVP
const mockResults = [
  {
    lotCode: "ENGORDA-2025-12",
    farmName: "Fazenda Santa Maria",
    quantity: 40,
    totalWeightSold: 18000,
    purchaseCost: 95000,
    variableCosts: 28000,
    fixedCostsRateio: 12000,
    totalCost: 135000,
    revenue: 185000,
    netRevenue: 174000,
    profit: 39000,
    profitPerHead: 975,
    profitPerArroba: 32.5,
  },
  {
    lotCode: "TERMINACAO-2025-11",
    farmName: "Confinamento BR-365",
    quantity: 60,
    totalWeightSold: 27600,
    purchaseCost: 184000,
    variableCosts: 52000,
    fixedCostsRateio: 18000,
    totalCost: 254000,
    revenue: 280000,
    netRevenue: 265000,
    profit: 11000,
    profitPerHead: 183,
    profitPerArroba: 6.0,
  },
];

const totalRevenue = mockResults.reduce((s, r) => s + r.netRevenue, 0);
const totalCost = mockResults.reduce((s, r) => s + r.totalCost, 0);
const totalProfit = mockResults.reduce((s, r) => s + r.profit, 0);

export default function FinanceiroPage() {
  return (
    <>
      <Header
        title="Financeiro"
        subtitle="Resultado por lote e demonstrativo financeiro"
      />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Receita Total (lotes fechados)</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalProfit)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resultado por Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Fazenda</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Arrobas</TableHead>
                  <TableHead className="text-right">Custo Compra</TableHead>
                  <TableHead className="text-right">Custos Variáveis</TableHead>
                  <TableHead className="text-right">Custo Fixo Rateio</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                  <TableHead className="text-right">Receita Líquida</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-right">Lucro/@</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockResults.map((r) => (
                  <TableRow key={r.lotCode}>
                    <TableCell className="font-medium">{r.lotCode}</TableCell>
                    <TableCell>{r.farmName}</TableCell>
                    <TableCell className="text-right">{r.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(kgToArrobas(r.totalWeightSold), 1)} @
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(r.purchaseCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.variableCosts)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.fixedCostsRateio)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.totalCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.netRevenue)}</TableCell>
                    <TableCell className={`text-right font-bold ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(r.profit)}
                    </TableCell>
                    <TableCell className={`text-right ${r.profitPerArroba >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(r.profitPerArroba)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.profit >= 0 ? "success" : "destructive"}>
                        {r.profit >= 0 ? "Lucro" : "Prejuízo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
