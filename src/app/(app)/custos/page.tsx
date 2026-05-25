import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
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

const statusColors: Record<string, "success" | "warning" | "destructive"> = {
  PAID: "success",
  OPEN: "warning",
  CANCELED: "destructive",
};

const statusLabels: Record<string, string> = {
  PAID: "Pago",
  OPEN: "Em aberto",
  CANCELED: "Cancelado",
};

const typeLabels: Record<string, string> = {
  FIXED: "Fixo",
  VARIABLE: "Variável",
};

// Dados mock para MVP
const mockCosts = [
  {
    id: "1",
    description: "Salário funcionários",
    category: "FUNCIONARIO",
    type: "FIXED",
    farmName: "Fazenda Santa Maria",
    lotCode: null,
    date: new Date("2026-05-01"),
    dueDate: new Date("2026-05-05"),
    amount: 15000,
    status: "PAID",
  },
  {
    id: "2",
    description: "Ração confinamento",
    category: "RACAO",
    type: "VARIABLE",
    farmName: "Confinamento BR-365",
    lotCode: "TERMINACAO-2026-01",
    date: new Date("2026-05-05"),
    dueDate: new Date("2026-05-10"),
    amount: 8500,
    status: "OPEN",
  },
  {
    id: "3",
    description: "Arrendamento pasto",
    category: "ARRENDAMENTO",
    type: "FIXED",
    farmName: "Fazenda Santa Maria",
    lotCode: null,
    date: new Date("2026-05-01"),
    dueDate: new Date("2026-05-01"),
    amount: 6000,
    status: "PAID",
  },
  {
    id: "4",
    description: "Vacina aftosa",
    category: "VACINA",
    type: "VARIABLE",
    farmName: "Fazenda Santa Maria",
    lotCode: "RECRIA-2026-01",
    date: new Date("2026-05-08"),
    dueDate: new Date("2026-05-15"),
    amount: 1200,
    status: "OPEN",
  },
];

const totalPaid = mockCosts.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
const totalOpen = mockCosts.filter((c) => c.status === "OPEN").reduce((s, c) => s + c.amount, 0);
const totalFixed = mockCosts.filter((c) => c.type === "FIXED").reduce((s, c) => s + c.amount, 0);
const totalVariable = mockCosts.filter((c) => c.type === "VARIABLE").reduce((s, c) => s + c.amount, 0);

export default function CustosPage() {
  return (
    <>
      <Header
        title="Custos"
        subtitle="Controle de custos fixos e variáveis"
        actions={
          <Button asChild>
            <Link href="/custos/novo">
              <Plus className="h-4 w-4" />
              Novo Custo
            </Link>
          </Button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Pago</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Em Aberto</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(totalOpen)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Custos Fixos</p>
              <p className="text-xl font-bold">{formatCurrency(totalFixed)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Custos Variáveis</p>
              <p className="text-xl font-bold">{formatCurrency(totalVariable)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fazenda / Lote</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">{cost.description}</TableCell>
                  <TableCell>{categoryLabels[cost.category] ?? cost.category}</TableCell>
                  <TableCell>
                    <Badge variant={cost.type === "FIXED" ? "default" : "secondary"}>
                      {typeLabels[cost.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{cost.farmName}</div>
                    {cost.lotCode && (
                      <div className="text-xs text-muted-foreground">{cost.lotCode}</div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(cost.date)}</TableCell>
                  <TableCell>{cost.dueDate ? formatDate(cost.dueDate) : "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(cost.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[cost.status] ?? "default"}>
                      {statusLabels[cost.status] ?? cost.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/custos/${cost.id}`}>Ver</Link>
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
