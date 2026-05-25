import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";

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

// Dados mock para MVP
const mockLots = [
  {
    id: "1",
    code: "ENGORDA-2026-01",
    description: "Garrotes Nelore",
    phase: "ENGORDA",
    farmName: "Fazenda Santa Maria",
    areaName: "Pasto 3",
    currentQuantity: 80,
    currentAvgWeight: 380,
    totalCost: 125000,
    avgDailyGain: 1.2,
    status: "ACTIVE",
  },
  {
    id: "2",
    code: "TERMINACAO-2026-01",
    description: "Novilhos Angus",
    phase: "TERMINACAO",
    farmName: "Confinamento BR-365",
    areaName: "Baia A",
    currentQuantity: 45,
    currentAvgWeight: 460,
    totalCost: 88000,
    avgDailyGain: 1.5,
    status: "ACTIVE",
  },
  {
    id: "3",
    code: "RECRIA-2026-01",
    description: "Bezerros cruzados",
    phase: "RECRIA",
    farmName: "Fazenda Santa Maria",
    areaName: "Pasto 1",
    currentQuantity: 120,
    currentAvgWeight: 260,
    totalCost: 142000,
    avgDailyGain: 0.9,
    status: "ACTIVE",
  },
];

export default function LotesPage() {
  return (
    <>
      <Header
        title="Lotes"
        subtitle="Controle seus lotes de gado"
        actions={
          <Button asChild>
            <Link href="/lotes/novo">
              <Plus className="h-4 w-4" />
              Novo Lote
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Fazenda / Área</TableHead>
                <TableHead className="text-right">Cabeças</TableHead>
                <TableHead className="text-right">Peso Médio</TableHead>
                <TableHead className="text-right">GMD</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.code}</TableCell>
                  <TableCell className="text-muted-foreground">{lot.description}</TableCell>
                  <TableCell>{phaseLabels[lot.phase]}</TableCell>
                  <TableCell>
                    <div className="text-sm">{lot.farmName}</div>
                    <div className="text-xs text-muted-foreground">{lot.areaName}</div>
                  </TableCell>
                  <TableCell className="text-right">{lot.currentQuantity}</TableCell>
                  <TableCell className="text-right">{formatNumber(lot.currentAvgWeight)} kg</TableCell>
                  <TableCell className="text-right">{formatNumber(lot.avgDailyGain, 3)} kg/d</TableCell>
                  <TableCell className="text-right">{formatCurrency(lot.totalCost)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[lot.status]}>
                      {statusLabels[lot.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/lotes/${lot.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
