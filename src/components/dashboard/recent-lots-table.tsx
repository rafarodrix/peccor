import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Lot {
  id: string;
  code: string;
  phase: string;
  currentQuantity: number;
  currentAvgWeight: number | null;
  totalCost: number;
  status: string;
}

const phaseLabels: Record<string, string> = {
  CRIA: "Cria",
  RECRIA: "Recria",
  ENGORDA: "Engorda",
  TERMINACAO: "Terminação",
  CONFINAMENTO: "Confinamento",
};

const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
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

interface RecentLotsTableProps {
  lots: Lot[];
}

export function RecentLotsTable({ lots }: RecentLotsTableProps) {
  if (lots.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Nenhum lote encontrado
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Fase</TableHead>
          <TableHead className="text-right">Cabeças</TableHead>
          <TableHead className="text-right">Peso Médio</TableHead>
          <TableHead className="text-right">Custo Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lots.map((lot) => (
          <TableRow key={lot.id}>
            <TableCell className="font-medium">{lot.code}</TableCell>
            <TableCell>{phaseLabels[lot.phase] ?? lot.phase}</TableCell>
            <TableCell className="text-right">{lot.currentQuantity}</TableCell>
            <TableCell className="text-right">
              {lot.currentAvgWeight ? `${formatNumber(lot.currentAvgWeight)} kg` : "-"}
            </TableCell>
            <TableCell className="text-right">{formatCurrency(lot.totalCost)}</TableCell>
            <TableCell>
              <Badge variant={statusVariants[lot.status] ?? "default"}>
                {statusLabels[lot.status] ?? lot.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
