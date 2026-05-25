import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireTenant } from "@/server/services/tenant";
import { getCostsPageData } from "@/server/queries/costs";
import { CostDialog } from "./cost-dialog";
import { PayCostButton } from "./pay-cost-button";

type CostRow = Awaited<ReturnType<typeof getCostsPageData>>["costs"][number];

const categoryLabels: Record<string, string> = {
  FUNCIONARIO: "Funcionário", ENERGIA: "Energia", ARRENDAMENTO: "Arrendamento",
  RACAO: "Ração", SAL_MINERAL: "Sal Mineral", VACINA: "Vacina",
  MEDICAMENTO: "Medicamento", FRETE: "Frete", MANUTENCAO: "Manutenção",
  COMISSAO: "Comissão", COMBUSTIVEL: "Combustível", VETERINARIO: "Veterinário", OUTROS: "Outros",
};

export default async function CustosPage() {
  const { tenant } = await requireTenant();
  const { farms, lots, costs } = await getCostsPageData(tenant.id);

  const totalPaid = costs
    .filter((c: CostRow) => c.status === "PAID")
    .reduce((s: number, c: CostRow) => s + Number(c.amount), 0);
  const totalOpen = costs
    .filter((c: CostRow) => c.status === "OPEN")
    .reduce((s: number, c: CostRow) => s + Number(c.amount), 0);
  const totalFixed = costs
    .filter((c: CostRow) => c.type === "FIXED")
    .reduce((s: number, c: CostRow) => s + Number(c.amount), 0);
  const totalVariable = costs
    .filter((c: CostRow) => c.type === "VARIABLE")
    .reduce((s: number, c: CostRow) => s + Number(c.amount), 0);

  return (
    <>
      <Header
        title="Custos"
        subtitle="Controle de custos fixos e variáveis"
        actions={<CostDialog farms={farms} lots={lots} />}
      />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Pago", value: totalPaid, className: "text-green-600" },
            { label: "Em Aberto", value: totalOpen, className: "text-yellow-600" },
            { label: "Custos Fixos", value: totalFixed, className: "" },
            { label: "Custos Variáveis", value: totalVariable, className: "" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-xl font-bold ${item.className}`}>{formatCurrency(item.value)}</p>
              </CardContent>
            </Card>
          ))}
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
              {costs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum custo registrado ainda.
                  </TableCell>
                </TableRow>
              ) : costs.map((cost: CostRow) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">{cost.description}</TableCell>
                  <TableCell>{categoryLabels[cost.category] ?? cost.category}</TableCell>
                  <TableCell>
                    <Badge variant={cost.type === "FIXED" ? "default" : "secondary"}>
                      {cost.type === "FIXED" ? "Fixo" : "Variável"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{cost.farm.name}</div>
                    {cost.lot && <div className="text-xs text-muted-foreground">{cost.lot.code}</div>}
                  </TableCell>
                  <TableCell>{formatDate(cost.date)}</TableCell>
                  <TableCell>{cost.dueDate ? formatDate(cost.dueDate) : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(cost.amount))}</TableCell>
                  <TableCell>
                    <Badge variant={cost.status === "PAID" ? "success" : cost.status === "OPEN" ? "warning" : "secondary"}>
                      {cost.status === "PAID" ? "Pago" : cost.status === "OPEN" ? "Em aberto" : "Cancelado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cost.status === "OPEN" && <PayCostButton id={cost.id} />}
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
