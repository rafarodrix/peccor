import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate, kgToArrobas } from "@/lib/utils";

// Dados mock para MVP
const mockSales = [
  {
    id: "1",
    customerName: "Frigorífico Mineiro",
    date: new Date("2026-04-20"),
    farmName: "Fazenda Santa Maria",
    quantity: 40,
    totalWeight: 18000,
    pricePerArroba: 310,
    animalValue: 372000,
    freightValue: 3200,
    commissionValue: 7440,
    discountValue: 0,
    totalValue: 372000,
    netValue: 361360,
    paidAt: new Date("2026-04-25"),
  },
  {
    id: "2",
    customerName: "JBS - Unidade Uberlândia",
    date: new Date("2026-03-10"),
    farmName: "Confinamento BR-365",
    quantity: 60,
    totalWeight: 27600,
    pricePerArroba: 305,
    animalValue: 561200,
    freightValue: 4500,
    commissionValue: 11224,
    discountValue: 0,
    totalValue: 561200,
    netValue: 545476,
    paidAt: null,
  },
];

export default function VendasPage() {
  return (
    <>
      <Header
        title="Vendas"
        subtitle="Histórico de vendas de animais"
        actions={
          <Button asChild>
            <Link href="/vendas/nova">
              <Plus className="h-4 w-4" />
              Nova Venda
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprador</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Peso</TableHead>
                <TableHead className="text-right">Arrobas</TableHead>
                <TableHead className="text-right">R$/Arroba</TableHead>
                <TableHead className="text-right">Receita Líquida</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.customerName}</TableCell>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell>{sale.farmName}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(sale.totalWeight / 1000, 1)} t
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(kgToArrobas(sale.totalWeight), 1)} @
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.pricePerArroba)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(sale.netValue)}
                  </TableCell>
                  <TableCell>
                    {sale.paidAt ? (
                      <Badge variant="success">Pago</Badge>
                    ) : (
                      <Badge variant="warning">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/vendas/${sale.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
