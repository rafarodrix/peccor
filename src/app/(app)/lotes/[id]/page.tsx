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
import { getLotById, getLotFinancialSnapshot } from "@/server/queries/lots";
import { WeightChart } from "@/components/charts/weight-chart";
import { GmdChart } from "@/components/charts/gmd-chart";

type LotDetail = NonNullable<Awaited<ReturnType<typeof getLotById>>>;
type LotCost = LotDetail["costs"][number];
type LotAnimal = LotDetail["animals"][number];
type LotWeighing = LotDetail["weighings"][number];

const phaseLabels: Record<string, string> = {
  CRIA: "Cria",
  RECRIA: "Recria",
  ENGORDA: "Engorda",
  TERMINACAO: "Terminação",
  CONFINAMENTO: "Confinamento",
};

const lotStatusColors: Record<
  string,
  "success" | "secondary" | "outline" | "destructive"
> = {
  ACTIVE: "success",
  SOLD: "secondary",
  CLOSED: "outline",
  CANCELED: "destructive",
};

const lotStatusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  SOLD: "Vendido",
  CLOSED: "Fechado",
  CANCELED: "Cancelado",
};

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

const costCategoryLabels: Record<string, string> = {
  FUNCIONARIO: "Funcionário",
  ENERGIA: "Energia",
  ARRENDAMENTO: "Arrendamento",
  RACAO: "Ração",
  SAL_MINERAL: "Sal Mineral",
  VACINA: "Vacina",
  MEDICAMENTO: "Medicamento",
  FRETE: "Frete",
  MANUTENCAO: "Manutenção",
  COMISSAO: "Comissão",
  COMBUSTIVEL: "Combustível",
  VETERINARIO: "Veterinário",
  OUTROS: "Outros",
};

const costTypeLabels: Record<string, string> = {
  FIXED: "Fixo",
  VARIABLE: "Variável",
};

function gmdColor(gmd: number): string {
  if (gmd >= 1.2) return "text-green-600";
  if (gmd >= 0.8) return "text-yellow-600";
  return "text-red-600";
}

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tenant } = await requireTenant();
  const lot = await getLotById(id, tenant.id);

  if (!lot) {
    notFound();
  }

  // Total costs excluding CANCELED
  const totalCost = lot.costs
    .filter((c: LotCost) => c.status !== "CANCELED")
    .reduce((sum: number, c: LotCost) => sum + Number(c.amount), 0);

  // Sales linked to this lot
  const { totalRevenue } = await getLotFinancialSnapshot(lot.id);

  const resultado = totalRevenue - totalCost;

  return (
    <>
      <Header
        title={lot.code}
        subtitle={`Fazenda: ${lot.farm.name}`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/lotes">← Voltar</Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Animais no lote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{lot.currentQuantity}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Peso médio atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {lot.currentAvgWeight
                  ? `${formatNumber(Number(lot.currentAvgWeight))} kg`
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={lotStatusColors[lot.status] ?? "default"}>
                {lotStatusLabels[lot.status] ?? lot.status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Fase</dt>
                <dd className="font-medium">
                  {phaseLabels[lot.phase] ?? lot.phase}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Data de início</dt>
                <dd className="font-medium">{formatDate(lot.startDate)}</dd>
              </div>
              {lot.endDate && (
                <div>
                  <dt className="text-muted-foreground">Data fim</dt>
                  <dd className="font-medium">{formatDate(lot.endDate)}</dd>
                </div>
              )}
              {lot.area && (
                <div>
                  <dt className="text-muted-foreground">Área</dt>
                  <dd className="font-medium">{lot.area.name}</dd>
                </div>
              )}
              {lot.description && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Descrição</dt>
                  <dd className="font-medium">{lot.description}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Animais */}
        <Card>
          <CardHeader>
            <CardTitle>Animais</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brinco</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead className="text-right">Peso atual</TableHead>
                  <TableHead className="text-right">Custo compra</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lot.animals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum animal ativo neste lote.
                    </TableCell>
                  </TableRow>
                ) : (
                  lot.animals.map((animal: LotAnimal) => (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/rebanho/${animal.id}`}
                          className="hover:underline"
                        >
                          {animal.tag ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {categoryLabels[animal.category] ?? animal.category}
                      </TableCell>
                      <TableCell>
                        {animal.sex === "MALE" ? "Macho" : "Fêmea"}
                      </TableCell>
                      <TableCell>{animal.breed ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {animal.currentWeight
                          ? `${formatNumber(Number(animal.currentWeight))} kg`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {animal.purchaseCost
                          ? formatCurrency(Number(animal.purchaseCost))
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            animalStatusColors[animal.status] ?? "default"
                          }
                        >
                          {animalStatusLabels[animal.status] ?? animal.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Gráficos */}
        {lot.weighings.length >= 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Evolução do Peso (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightChart
                  data={[...lot.weighings].reverse().map((w) => ({
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
                  data={[...lot.weighings]
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

        {/* Pesagens */}
        <Card>
          <CardHeader>
            <CardTitle>Pesagens</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Peso anterior</TableHead>
                  <TableHead className="text-right">Peso atual</TableHead>
                  <TableHead className="text-right">Ganho</TableHead>
                  <TableHead className="text-right">Dias</TableHead>
                  <TableHead className="text-right">GMD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lot.weighings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma pesagem registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  lot.weighings.map((w: LotWeighing) => {
                    const gmd = w.dailyGain ? Number(w.dailyGain) : null;
                    return (
                      <TableRow key={w.id}>
                        <TableCell>{formatDate(w.date)}</TableCell>
                        <TableCell className="text-right">
                          {w.previousWeight
                            ? `${formatNumber(Number(w.previousWeight))} kg`
                            : "—"}
                        </TableCell>
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

        {/* Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Custos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lot.costs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum custo registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  lot.costs.map((cost: LotCost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{formatDate(cost.date)}</TableCell>
                      <TableCell>{cost.description}</TableCell>
                      <TableCell>
                        {costCategoryLabels[cost.category] ?? cost.category}
                      </TableCell>
                      <TableCell>
                        {costTypeLabels[cost.type] ?? cost.type}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(cost.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cost.status === "PAID"
                              ? "success"
                              : cost.status === "CANCELED"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {cost.status === "PAID"
                            ? "Pago"
                            : cost.status === "CANCELED"
                              ? "Cancelado"
                              : "Aberto"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Financial summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted-foreground">Custo total</dt>
                <dd className="text-xl font-bold">
                  {formatCurrency(totalCost)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Receita</dt>
                <dd className="text-xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Resultado</dt>
                <dd
                  className={`text-xl font-bold ${resultado >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(resultado)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
