import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getLots } from "@/server/queries/lots";
import { prisma } from "@/lib/prisma";
import { LotDialog } from "./lot-dialog";

const phaseLabels: Record<string, string> = {
  CRIA: "Cria", RECRIA: "Recria", ENGORDA: "Engorda", TERMINACAO: "Terminação", CONFINAMENTO: "Confinamento",
};
const statusColors: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "success", SOLD: "secondary", CLOSED: "outline", CANCELED: "destructive",
};
const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo", SOLD: "Vendido", CLOSED: "Fechado", CANCELED: "Cancelado",
};

export default async function LotesPage() {
  const { tenant } = await requireTenant();
  const lots = await getLots(tenant.id);

  const farms = await prisma.farm.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true, name: true },
  });
  const areas = await prisma.farmArea.findMany({
    where: { farm: { tenantId: tenant.id }, active: true },
    select: { id: true, name: true, farmId: true },
  });

  return (
    <>
      <Header
        title="Lotes"
        subtitle="Controle seus lotes de gado"
        actions={<LotDialog farms={farms} areas={areas} />}
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Fazenda / Área</TableHead>
                <TableHead className="text-right">Cabeças</TableHead>
                <TableHead className="text-right">Peso Médio</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum lote cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : lots.map((lot) => {
                const totalCost = lot.costs.reduce((s: number, c: { amount: unknown }) => s + Number(c.amount), 0);
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
      </div>
    </>
  );
}
