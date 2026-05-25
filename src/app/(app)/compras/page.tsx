import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { PurchaseDialog } from "./purchase-dialog";

export default async function ComprasPage() {
  const { tenant } = await requireTenant();

  const farms = await prisma.farm.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true, name: true },
  });
  const lots = await prisma.cattleLot.findMany({
    where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
    select: { id: true, code: true, farmId: true },
  });
  const purchases = await prisma.purchase.findMany({
    where: { farm: { tenantId: tenant.id } },
    include: { farm: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <>
      <Header
        title="Compras"
        subtitle="Histórico de compra de animais"
        actions={<PurchaseDialog farms={farms} lots={lots} />}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Nenhuma compra registrada ainda.
                  </TableCell>
                </TableRow>
              ) : purchases.map((purchase) => {
                const totalValue = Number(purchase.totalValue);
                const costPerHead = totalValue / purchase.quantity;
                const totalWeight = purchase.totalWeight ? Number(purchase.totalWeight) : null;
                const costPerKg = totalWeight ? totalValue / totalWeight : null;
                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                    <TableCell>{formatDate(purchase.date)}</TableCell>
                    <TableCell>{purchase.farm.name}</TableCell>
                    <TableCell className="text-right">{purchase.quantity}</TableCell>
                    <TableCell className="text-right">
                      {totalWeight ? `${formatNumber(totalWeight / 1000, 1)} t` : "—"}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(purchase.animalValue))}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(totalValue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(costPerHead)}</TableCell>
                    <TableCell className="text-right">
                      {costPerKg ? formatCurrency(costPerKg) : "—"}
                    </TableCell>
                    <TableCell>
                      {purchase.paidAt ? (
                        <Badge variant="success">Pago</Badge>
                      ) : (
                        <Badge variant="warning">Pendente</Badge>
                      )}
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
