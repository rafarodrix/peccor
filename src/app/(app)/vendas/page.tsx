import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate, kgToArrobas } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { SaleDialog } from "./sale-dialog";

export default async function VendasPage() {
  const { tenant } = await requireTenant();

  const farms = await prisma.farm.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true, name: true },
  });
  const lots = await prisma.cattleLot.findMany({
    where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
    select: { id: true, code: true, farmId: true },
  });
  const sales = await prisma.sale.findMany({
    where: { farm: { tenantId: tenant.id } },
    include: { farm: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <>
      <Header
        title="Vendas"
        subtitle="Histórico de vendas de animais"
        actions={<SaleDialog farms={farms} lots={lots} />}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhuma venda registrada ainda.
                  </TableCell>
                </TableRow>
              ) : sales.map((sale) => {
                const totalWeight = sale.totalWeight ? Number(sale.totalWeight) : null;
                return (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.customerName}</TableCell>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>{sale.farm.name}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right">
                      {totalWeight ? `${formatNumber(totalWeight / 1000, 1)} t` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {totalWeight ? `${formatNumber(kgToArrobas(totalWeight), 1)} @` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.pricePerArroba ? formatCurrency(Number(sale.pricePerArroba)) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(Number(sale.netValue))}
                    </TableCell>
                    <TableCell>
                      {sale.paidAt ? (
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
