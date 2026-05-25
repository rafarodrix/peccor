import { PurchaseDialog } from "./purchase-dialog";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { getPurchasesPageData } from "@/server/queries/purchases";
import { requireTenant } from "@/server/services/tenant";

type PurchaseRow = Awaited<ReturnType<typeof getPurchasesPageData>>["purchases"][number];

export default async function ComprasPage() {
  const { tenant } = await requireTenant();
  const { farms, lots, purchases } = await getPurchasesPageData(tenant.id);

  return (
    <>
      <Header
        title="Compras"
        subtitle="Histórico de compra de animais"
        actions={<PurchaseDialog farms={farms} lots={lots} />}
      />

      <div className="space-y-4 p-4 sm:p-6">
        {purchases.length === 0 ? (
          <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma compra registrada ainda.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {purchases.map((purchase: PurchaseRow) => {
                const totalValue = Number(purchase.totalValue);
                const costPerHead = totalValue / purchase.quantity;
                const totalWeight = purchase.totalWeight ? Number(purchase.totalWeight) : null;
                const costPerKg = totalWeight ? totalValue / totalWeight : null;

                return (
                  <article key={purchase.id} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{purchase.supplierName}</p>
                        <p className="text-sm text-muted-foreground">{purchase.farm.name}</p>
                      </div>
                      {purchase.paidAt ? <Badge variant="success">Pago</Badge> : <Badge variant="warning">Pendente</Badge>}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p>{formatDate(purchase.date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quantidade</p>
                        <p>{purchase.quantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Peso total</p>
                        <p>{totalWeight ? `${formatNumber(totalWeight / 1000, 1)} t` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor animais</p>
                        <p>{formatCurrency(Number(purchase.animalValue))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo total</p>
                        <p>{formatCurrency(totalValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo/cabeça</p>
                        <p>{formatCurrency(costPerHead)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Custo/kg</p>
                        <p>{costPerKg ? formatCurrency(costPerKg) : "—"}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden rounded-lg border bg-card md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Fazenda</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Peso total</TableHead>
                    <TableHead className="text-right">Valor animais</TableHead>
                    <TableHead className="text-right">Custo total</TableHead>
                    <TableHead className="text-right">Custo/cabeça</TableHead>
                    <TableHead className="text-right">Custo/kg</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase: PurchaseRow) => {
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
                        <TableCell className="text-right">{costPerKg ? formatCurrency(costPerKg) : "—"}</TableCell>
                        <TableCell>
                          {purchase.paidAt ? <Badge variant="success">Pago</Badge> : <Badge variant="warning">Pendente</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
