import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { HealthDialog } from "./health-dialog";

const eventTypeLabels: Record<string, string> = {
  VACINA: "Vacina", VERMIFUGO: "Vermífugo", MEDICAMENTO: "Medicamento",
  DOENCA: "Doença", MORTE: "Morte", OUTRO: "Outro",
};
const eventTypeColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  VACINA: "success", VERMIFUGO: "default", MEDICAMENTO: "warning",
  DOENCA: "destructive", MORTE: "destructive", OUTRO: "secondary",
};

export default async function ManejoSanitarioPage() {
  const { tenant } = await requireTenant();

  const animals = await prisma.animal.findMany({
    where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
    select: { id: true, tag: true, farmId: true },
  });
  const healthEvents = await prisma.healthEvent.findMany({
    where: { animal: { farm: { tenantId: tenant.id } } },
    include: {
      animal: {
        select: { tag: true, lot: { select: { code: true } }, farm: { select: { name: true } } },
      },
    },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <>
      <Header
        title="Manejo Sanitário"
        subtitle="Controle de vacinas, medicamentos e ocorrências"
        actions={<HealthDialog animals={animals} />}
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Animal / Lote</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead className="text-right">Carência (dias)</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum evento sanitário registrado ainda.
                  </TableCell>
                </TableRow>
              ) : healthEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>
                    <Badge variant={eventTypeColors[event.type]}>
                      {eventTypeLabels[event.type] ?? event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{event.description}</TableCell>
                  <TableCell>{event.productName ?? "—"}</TableCell>
                  <TableCell>{event.dosage ?? "—"}</TableCell>
                  <TableCell>
                    {event.animal.tag ? (
                      <span className="font-mono text-sm">{event.animal.tag}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {event.animal.lot?.code ?? "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{event.animal.farm.name}</TableCell>
                  <TableCell className="text-right">
                    {event.withdrawalDays && event.withdrawalDays > 0 ? event.withdrawalDays : "—"}
                  </TableCell>
                  <TableCell>{event.responsible ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
