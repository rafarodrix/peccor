import { Header } from "@/components/layout/header";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { WeighingDialog } from "./weighing-dialog";

export default async function PesagensPage() {
  const { tenant } = await requireTenant();

  const farms = await prisma.farm.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true, name: true },
  });
  const lots = await prisma.cattleLot.findMany({
    where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
    select: { id: true, code: true, farmId: true },
  });
  const animals = await prisma.animal.findMany({
    where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
    select: { id: true, tag: true, farmId: true },
  });
  const weighings = await prisma.weighing.findMany({
    where: { farm: { tenantId: tenant.id } },
    include: {
      lot: { select: { code: true } },
      animal: { select: { tag: true } },
    },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <>
      <Header
        title="Pesagens"
        subtitle="Histórico de pesagens e controle de GMD"
        actions={<WeighingDialog farms={farms} lots={lots} animals={animals} />}
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead className="text-right">Peso Anterior</TableHead>
                <TableHead className="text-right">Peso Atual</TableHead>
                <TableHead className="text-right">Ganho</TableHead>
                <TableHead className="text-right">Dias</TableHead>
                <TableHead className="text-right">GMD</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weighings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhuma pesagem registrada ainda.
                  </TableCell>
                </TableRow>
              ) : weighings.map((w) => {
                const dailyGain = w.dailyGain ? Number(w.dailyGain) : null;
                return (
                  <TableRow key={w.id}>
                    <TableCell>{formatDate(w.date)}</TableCell>
                    <TableCell className="font-medium">
                      {w.lot?.code ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {w.animal?.tag ?? <span className="text-muted-foreground">Lote</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {w.previousWeight ? `${formatNumber(Number(w.previousWeight))} kg` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(Number(w.weight))} kg
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {w.weightGain ? `+${formatNumber(Number(w.weightGain))} kg` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {w.daysSinceLast ? `${w.daysSinceLast}d` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {dailyGain !== null ? (
                        <span className={cn(
                          "font-medium",
                          dailyGain >= 1.2 ? "text-green-600" : dailyGain >= 0.8 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {formatNumber(dailyGain, 3)} kg/d
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{w.responsible ?? "—"}</TableCell>
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
