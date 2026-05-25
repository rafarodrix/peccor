import Link from "next/link";
import { LotDialog } from "./lot-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getLotsPageData } from "@/server/queries/lots";
import { requireTenant } from "@/server/services/tenant";

type LotRow = Awaited<ReturnType<typeof getLotsPageData>>["lots"][number];

const phaseLabels: Record<string, string> = {
  CRIA: "Cria",
  RECRIA: "Recria",
  ENGORDA: "Engorda",
  TERMINACAO: "Terminação",
  CONFINAMENTO: "Confinamento",
};

const statusColors: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "success",
  SOLD: "secondary",
  CLOSED: "outline",
  CANCELED: "destructive",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  SOLD: "Vendido",
  CLOSED: "Fechado",
  CANCELED: "Cancelado",
};

export default async function LotesPage() {
  const { tenant } = await requireTenant();
  const { lots, farms, areas } = await getLotsPageData(tenant.id);

  return (
    <>
      <Header
        title="Lotes"
        subtitle="Controle seus lotes de gado"
        actions={<LotDialog farms={farms} areas={areas} />}
      />

      <div className="space-y-4 p-4 sm:p-6">
        {lots.length === 0 ? (
          <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum lote cadastrado ainda.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {lots.map((lot: LotRow) => {
                const totalCost = lot.costs.reduce((sum: number, cost) => sum + Number(cost.amount), 0);

                return (
                  <article key={lot.id} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{lot.code}</p>
                        <p className="text-sm text-muted-foreground">{lot.farm.name}</p>
                        {lot.area && <p className="text-xs text-muted-foreground">{lot.area.name}</p>}
                      </div>
                      <Badge variant={statusColors[lot.status] ?? "default"}>
                        {statusLabels[lot.status] ?? lot.status}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Fase</p>
                        <p>{phaseLabels[lot.phase] ?? lot.phase}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cabeças</p>
                        <p>{lot.currentQuantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Peso médio</p>
                        <p>{lot.currentAvgWeight ? `${formatNumber(Number(lot.currentAvgWeight))} kg` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo total</p>
                        <p>{formatCurrency(totalCost)}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/lotes/${lot.id}`}>Ver lote</Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden rounded-lg border bg-card md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Fase</TableHead>
                    <TableHead>Fazenda / Área</TableHead>
                    <TableHead className="text-right">Cabeças</TableHead>
                    <TableHead className="text-right">Peso médio</TableHead>
                    <TableHead className="text-right">Custo total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots.map((lot: LotRow) => {
                    const totalCost = lot.costs.reduce((sum: number, cost) => sum + Number(cost.amount), 0);

                    return (
                      <TableRow key={lot.id}>
                        <TableCell className="font-medium">{lot.code}</TableCell>
                        <TableCell>{phaseLabels[lot.phase] ?? lot.phase}</TableCell>
                        <TableCell>
                          <div className="text-sm">{lot.farm.name}</div>
                          {lot.area && <div className="text-xs text-muted-foreground">{lot.area.name}</div>}
                        </TableCell>
                        <TableCell className="text-right">{lot.currentQuantity}</TableCell>
                        <TableCell className="text-right">
                          {lot.currentAvgWeight ? `${formatNumber(Number(lot.currentAvgWeight))} kg` : "—"}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[lot.status] ?? "default"}>
                            {statusLabels[lot.status] ?? lot.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/lotes/${lot.id}`}>Ver</Link>
                          </Button>
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
