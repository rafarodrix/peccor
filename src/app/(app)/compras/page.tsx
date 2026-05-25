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
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

// Dados mock para MVP
const mockPurchases = [
  {
    id: "1",
    supplierName: "Agro Rodrigues",
    date: new Date("2026-01-10"),
    quantity: 80,
    totalWeight: 22400,
    animalValue: 280000,
    freightValue: 4500,
    commissionValue: 5600,
    otherCosts: 800,
    totalValue: 290900,
    farmName: "Fazenda Santa Maria",
    paidAt: new Date("2026-01-15"),
  },
  {
    id: "2",
    supplierName: "Pecuária Boa Vista",
    date: new Date("2025-11-05"),
    quantity: 45,
    totalWeight: 18000,
    animalValue: 183000,
    freightValue: 3200,
    commissionValue: 3660,
    otherCosts: 400,
    totalValue: 190260,
    farmName: "Confinamento BR-365",
    paidAt: null,
  },
];

export default function ComprasPage() {
  return (
    <>
      <Header
        title="Compras"
        subtitle="Histórico de compra de animais"
        actions={
          <Button asChild>
            <Link href="/compras/nova">
              <Plus className="h-4 w-4" />
              Nova Compra
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Peso Total</TableHead>
                <TableHead className="text-right">Valor Animais</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-right">Custo/Cabeça</TableHead>
                <TableHead className="text-right">Custo/kg</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchases.map((purchase) => {
                const costPerHead = purchase.totalValue / purchase.quantity;
                const costPerKg = purchase.totalWeight
                  ? purchase.totalValue / purchase.totalWeight
                  : 0;
                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                    <TableCell>{formatDate(purchase.date)}</TableCell>
                    <TableCell>{purchase.farmName}</TableCell>
                    <TableCell className="text-right">{purchase.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(purchase.totalWeight / 1000, 1)} t
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(purchase.animalValue)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(purchase.totalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(costPerHead)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(costPerKg)}
                    </TableCell>
                    <TableCell>
                      {purchase.paidAt ? (
                        <Badge variant="success">Pago</Badge>
                      ) : (
                        <Badge variant="warning">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/compras/${purchase.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
