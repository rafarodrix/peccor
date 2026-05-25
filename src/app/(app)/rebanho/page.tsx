import Link from "next/link";
import { AnimalDialog } from "./animal-dialog";
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
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { getAnimals } from "@/server/queries/animals";
import { getFarmOptions, getLotOptions } from "@/server/queries/reference";
import { requireTenant } from "@/server/services/tenant";

const categoryLabels: Record<string, string> = {
  BEZERRO: "Bezerro",
  BEZERRA: "Bezerra",
  GARROTE: "Garrote",
  NOVILHA: "Novilha",
  NOVILHO: "Novilho",
  VACA: "Vaca",
  BOI: "Boi",
  TOURO: "Touro",
};

const statusColors: Record<string, "success" | "secondary" | "destructive" | "warning"> = {
  ACTIVE: "success",
  SOLD: "secondary",
  DEAD: "destructive",
  TRANSFERRED: "warning",
  LOST: "destructive",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  SOLD: "Vendido",
  DEAD: "Morto",
  TRANSFERRED: "Transferido",
  LOST: "Perdido",
};

type AnimalRow = Awaited<ReturnType<typeof getAnimals>>[number];

export default async function RebanhoPage() {
  const { tenant } = await requireTenant();
  const [animals, farms, lots] = await Promise.all([
    getAnimals(tenant.id),
    getFarmOptions(tenant.id),
    getLotOptions(tenant.id),
  ]);

  return (
    <>
      <Header
        title="Rebanho"
        subtitle="Controle individual do seu rebanho"
        actions={<AnimalDialog farms={farms} lots={lots} />}
      />

      <div className="space-y-4 p-4 sm:p-6">
        {animals.length === 0 ? (
          <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum animal cadastrado ainda.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {animals.map((animal: AnimalRow) => {
                const lastWeighing = animal.weighings[0];

                return (
                  <article key={animal.id} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Brinco</p>
                        <p className="font-semibold">{animal.tag ?? "—"}</p>
                      </div>
                      <Badge variant={statusColors[animal.status] ?? "default"}>
                        {statusLabels[animal.status] ?? animal.status}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Categoria</p>
                        <p>{categoryLabels[animal.category] ?? animal.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Raça</p>
                        <p>{animal.breed ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fazenda</p>
                        <p>{animal.farm.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lote</p>
                        <p>{animal.lot?.code ?? "Sem lote"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Peso atual</p>
                        <p>
                          {animal.currentWeight ? `${formatNumber(Number(animal.currentWeight))} kg` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">GMD</p>
                        <p>
                          {lastWeighing?.dailyGain
                            ? `${formatNumber(Number(lastWeighing.dailyGain), 3)} kg/d`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo compra</p>
                        <p>{animal.purchaseCost ? formatCurrency(Number(animal.purchaseCost)) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Entrada</p>
                        <p>{formatDate(animal.entryDate)}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/rebanho/${animal.id}`}>Ver animal</Link>
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
                    <TableHead>Brinco</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Raça</TableHead>
                    <TableHead>Lote / Fazenda</TableHead>
                    <TableHead className="text-right">Peso atual</TableHead>
                    <TableHead className="text-right">GMD</TableHead>
                    <TableHead className="text-right">Custo compra</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animals.map((animal: AnimalRow) => {
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
          </>
        )}
      </div>
    </>
  );
}
