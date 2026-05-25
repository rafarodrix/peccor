import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getAnimalById } from "@/server/queries/animals";
import { WeightChart } from "@/components/charts/weight-chart";
import { GmdChart } from "@/components/charts/gmd-chart";

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

const animalStatusColors: Record<
  string,
  "success" | "secondary" | "destructive" | "warning"
> = {
  ACTIVE: "success",
  SOLD: "secondary",
  DEAD: "destructive",
  TRANSFERRED: "warning",
  LOST: "destructive",
};

const animalStatusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  SOLD: "Vendido",
  DEAD: "Morto",
  TRANSFERRED: "Transferido",
  LOST: "Perdido",
};

const healthEventColors: Record<
  string,
  "success" | "default" | "warning" | "destructive" | "secondary"
> = {
  VACINA: "success",
  VERMIFUGO: "default",
  MEDICAMENTO: "warning",
  DOENCA: "destructive",
  MORTE: "destructive",
  OUTRO: "secondary",
};

const healthEventLabels: Record<string, string> = {
  VACINA: "Vacina",
  VERMIFUGO: "Vermífugo",
  MEDICAMENTO: "Medicamento",
  DOENCA: "Doença",
  MORTE: "Morte",
  OUTRO: "Outro",
};

function gmdColor(gmd: number): string {
  if (gmd >= 1.2) return "text-green-600";
  if (gmd >= 0.8) return "text-yellow-600";
  return "text-red-600";
}

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tenant } = await requireTenant();
  const animal = await getAnimalById(id, tenant.id);

  if (!animal) {
    notFound();
  }

  const title = animal.tag ?? animal.id.slice(0, 8);
  const subtitleParts = [animal.farm.name];
  if (animal.lot) {
    subtitleParts.push(`Lote: ${animal.lot.code}`);
  }

  return (
    <>
      <Header
        title={title}
        subtitle={subtitleParts.join(" · ")}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/rebanho">← Voltar</Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Peso atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {animal.currentWeight
                  ? `${formatNumber(Number(animal.currentWeight))} kg`
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo de compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {animal.purchaseCost
                  ? formatCurrency(Number(animal.purchaseCost))
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={animalStatusColors[animal.status] ?? "default"}>
                {animalStatusLabels[animal.status] ?? animal.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Data de entrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatDate(animal.entryDate)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Animal details */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Animal</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Categoria</dt>
                <dd className="font-medium">
                  {categoryLabels[animal.category] ?? animal.category}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sexo</dt>
                <dd className="font-medium">
                  {animal.sex === "MALE" ? "Macho" : "Fêmea"}
                </dd>
              </div>
              {animal.breed && (
                <div>
                  <dt className="text-muted-foreground">Raça</dt>
                  <dd className="font-medium">{animal.breed}</dd>
                </div>
              )}
              {animal.birthDate && (
                <div>
                  <dt className="text-muted-foreground">Nascimento</dt>
                  <dd className="font-medium">{formatDate(animal.birthDate)}</dd>
                </div>
              )}
              {animal.entryWeight && (
                <div>
                  <dt className="text-muted-foreground">Peso de entrada</dt>
                  <dd className="font-medium">
                    {formatNumber(Number(animal.entryWeight))} kg
                  </dd>
                </div>
              )}
              {animal.lot && (
                <div>
                  <dt className="text-muted-foreground">Lote</dt>
                  <dd className="font-medium">
                    {animal.lot.description
                      ? `${animal.lot.code} — ${animal.lot.description}`
                      : animal.lot.code}
                  </dd>
                </div>
              )}
              {animal.electronicTag && (
                <div>
                  <dt className="text-muted-foreground">Brinco eletrônico</dt>
                  <dd className="font-medium">{animal.electronicTag}</dd>
                </div>
              )}
              {animal.sisbov && (
                <div>
                  <dt className="text-muted-foreground">SISBOV</dt>
                  <dd className="font-medium">{animal.sisbov}</dd>
                </div>
              )}
              {animal.notes && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Observações</dt>
                  <dd className="font-medium">{animal.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Gráficos de evolução */}
        {animal.weighings.length >= 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Evolução do Peso (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightChart
                  data={[...animal.weighings].reverse().map((w) => ({
                    date: formatDate(w.date),
                    weight: Number(w.weight),
                    dailyGain: w.dailyGain ? Number(w.dailyGain) : null,
                  }))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">GMD por Pesagem (kg/dia)</CardTitle>
              </CardHeader>
              <CardContent>
                <GmdChart
                  data={[...animal.weighings]
                    .reverse()
                    .filter((w) => w.dailyGain !== null)
                    .map((w) => ({
                      date: formatDate(w.date),
                      dailyGain: Number(w.dailyGain),
                    }))}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Histórico de Pesagens */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pesagens</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Peso</TableHead>
                  <TableHead className="text-right">Ganho</TableHead>
                  <TableHead className="text-right">Dias</TableHead>
                  <TableHead className="text-right">GMD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animal.weighings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma pesagem registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  animal.weighings.map((w) => {
                    const gmd = w.dailyGain ? Number(w.dailyGain) : null;
                    return (
                      <TableRow key={w.id}>
                        <TableCell>{formatDate(w.date)}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(Number(w.weight))} kg
                        </TableCell>
                        <TableCell className="text-right">
                          {w.weightGain != null
                            ? `${formatNumber(Number(w.weightGain))} kg`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {w.daysSinceLast ?? "—"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${gmd !== null ? gmdColor(gmd) : ""}`}
                        >
                          {gmd !== null
                            ? `${formatNumber(gmd, 3)} kg/d`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Eventos Sanitários */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Sanitários</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead className="text-right">Carência (dias)</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animal.healthEvents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum evento sanitário registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  animal.healthEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{formatDate(event.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            healthEventColors[event.type] ?? "default"
                          }
                        >
                          {healthEventLabels[event.type] ?? event.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.description}</TableCell>
                      <TableCell>{event.productName ?? "—"}</TableCell>
                      <TableCell>{event.dosage ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {event.withdrawalDays ?? "—"}
                      </TableCell>
                      <TableCell>{event.responsible ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Movimentações */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animal.movements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma movimentação registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  animal.movements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{formatDate(mov.date)}</TableCell>
                      <TableCell>
                        {mov.fromLotId ? (
                          <span className="text-muted-foreground text-xs font-mono">
                            {mov.fromLotId.slice(0, 8)}…
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {mov.toLotId ? (
                          <span className="text-muted-foreground text-xs font-mono">
                            {mov.toLotId.slice(0, 8)}…
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{mov.reason ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
