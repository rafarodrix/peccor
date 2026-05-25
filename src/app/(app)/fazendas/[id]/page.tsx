import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Beef, Layers, MapPin } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getFarmById } from "@/server/queries/farms";
import { getLots } from "@/server/queries/lots";

const areaTypeLabels: Record<string, string> = {
  PASTO: "Pasto",
  CURRAL: "Curral",
  PIQUETE: "Piquete",
  BAIA: "Baia",
  CONFINAMENTO: "Confinamento",
  OUTRO: "Outro",
};

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FazendaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { tenant } = await requireTenant();

  const [farm, lots] = await Promise.all([
    getFarmById(id, tenant.id),
    getLots(tenant.id, id),
  ]);

  if (!farm) {
    notFound();
  }

  // Determine which areas have at least one active lot assigned
  const activeAreaIds = new Set(
    lots
      .filter((lot: { status: string; areaId?: string | null }) => lot.status === "ACTIVE" && lot.areaId)
      .map((lot: { areaId?: string | null }) => lot.areaId as string)
  );

  return (
    <>
      <Header
        title={farm.name}
        subtitle="Detalhes da fazenda"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/fazendas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Animais Ativos</p>
                  <p className="mt-1 text-2xl font-bold">{farm._count.animals}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Beef className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lotes Ativos</p>
                  <p className="mt-1 text-2xl font-bold">{farm._count.lots}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Áreas</p>
                  <p className="mt-1 text-2xl font-bold">{farm.areas.length}</p>
                  {(farm.totalArea || farm.pastureArea) && (
                    <div className="mt-1 space-y-0.5">
                      {farm.totalArea && (
                        <p className="text-xs text-muted-foreground">
                          Total: {Number(farm.totalArea)} ha
                        </p>
                      )}
                      {farm.pastureArea && (
                        <p className="text-xs text-muted-foreground">
                          Pastagem: {Number(farm.pastureArea)} ha
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Areas table */}
        <Card>
          <CardHeader>
            <CardTitle>Áreas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Capacidade (cab.)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farm.areas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma área cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  farm.areas.map((area: {
                    id: string;
                    name: string;
                    type: string;
                    capacityHead: number | null;
                  }) => {
                    const occupied = activeAreaIds.has(area.id);
                    return (
                      <TableRow key={area.id}>
                        <TableCell className="font-medium">{area.name}</TableCell>
                        <TableCell>{areaTypeLabels[area.type] ?? area.type}</TableCell>
                        <TableCell className="text-right">
                          {area.capacityHead != null ? formatNumber(area.capacityHead, 0) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={occupied ? "success" : "outline"}>
                            {occupied ? "Ocupada" : "Livre"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lots table */}
        <Card>
          <CardHeader>
            <CardTitle>Lotes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Fase</TableHead>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum lote cadastrado nesta fazenda.
                    </TableCell>
                  </TableRow>
                ) : (
                  lots.map((lot: {
                    id: string;
                    code: string;
                    phase: string;
                    currentQuantity: number;
                    currentAvgWeight: unknown;
                    costs: Array<{ amount: unknown }>;
                    status: string;
                  }) => {
                    const totalCost = lot.costs.reduce(
                      (sum: number, c: { amount: unknown }) => sum + Number(c.amount),
                      0
                    );
                    return (
                      <TableRow key={lot.id}>
                        <TableCell className="font-medium">{lot.code}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {phaseLabels[lot.phase] ?? lot.phase}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{lot.currentQuantity}</TableCell>
                        <TableCell className="text-right">
                          {lot.currentAvgWeight
                            ? `${formatNumber(Number(lot.currentAvgWeight))} kg`
                            : "—"}
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
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
