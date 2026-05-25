import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getAnimals } from "@/server/queries/animals";
import { prisma } from "@/lib/prisma";
import { AnimalDialog } from "./animal-dialog";

const categoryLabels: Record<string, string> = {
  BEZERRO: "Bezerro", BEZERRA: "Bezerra", GARROTE: "Garrote",
  NOVILHA: "Novilha", NOVILHO: "Novilho", VACA: "Vaca", BOI: "Boi", TOURO: "Touro",
};
const statusColors: Record<string, "success" | "secondary" | "destructive" | "warning"> = {
  ACTIVE: "success", SOLD: "secondary", DEAD: "destructive", TRANSFERRED: "warning", LOST: "destructive",
};
const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo", SOLD: "Vendido", DEAD: "Morto", TRANSFERRED: "Transferido", LOST: "Perdido",
};

export default async function RebanhoPage() {
  const { tenant } = await requireTenant();
  const animals = await getAnimals(tenant.id);

  const farms = await prisma.farm.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true, name: true },
  });
  const lots = await prisma.cattleLot.findMany({
    where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
    select: { id: true, code: true, farmId: true },
  });

  return (
    <>
      <Header
        title="Rebanho"
        subtitle="Controle individual do seu rebanho"
        actions={<AnimalDialog farms={farms} lots={lots} />}
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brinco</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Lote / Fazenda</TableHead>
                <TableHead className="text-right">Peso Atual</TableHead>
                <TableHead className="text-right">GMD</TableHead>
                <TableHead className="text-right">Custo Compra</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Nenhum animal cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : animals.map((animal) => {
                const lastWeighing = animal.weighings[0];
                return (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">{animal.tag ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{categoryLabels[animal.category] ?? animal.category}</TableCell>
                    <TableCell>{animal.breed ?? "—"}</TableCell>
                    <TableCell>
                      <div className="text-sm">{animal.farm.name}</div>
                      {animal.lot && <div className="text-xs text-muted-foreground">{animal.lot.code}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      {animal.currentWeight ? `${formatNumber(Number(animal.currentWeight))} kg` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {lastWeighing?.dailyGain
                        ? `${formatNumber(Number(lastWeighing.dailyGain), 3)} kg/d`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {animal.purchaseCost ? formatCurrency(Number(animal.purchaseCost)) : "—"}
                    </TableCell>
                    <TableCell>{formatDate(animal.entryDate)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[animal.status] ?? "default"}>
                        {statusLabels[animal.status] ?? animal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/rebanho/${animal.id}`}>Ver</Link>
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
