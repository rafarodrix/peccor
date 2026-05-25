import { CostDialog } from "./cost-dialog";
import { PayCostButton } from "./pay-cost-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCostsPageData } from "@/server/queries/costs";
import { requireTenant } from "@/server/services/tenant";

type CostRow = Awaited<ReturnType<typeof getCostsPageData>>["costs"][number];

const categoryLabels: Record<string, string> = {
  FUNCIONARIO: "Funcionário",
  ENERGIA: "Energia",
  ARRENDAMENTO: "Arrendamento",
  RACAO: "Ração",
  SAL_MINERAL: "Sal mineral",
  VACINA: "Vacina",
  MEDICAMENTO: "Medicamento",
  FRETE: "Frete",
  MANUTENCAO: "Manutenção",
  COMISSAO: "Comissão",
  COMBUSTIVEL: "Combustível",
  VETERINARIO: "Veterinário",
  OUTROS: "Outros",
};

export default async function CustosPage() {
  const { tenant } = await requireTenant();
  const { farms, lots, costs, chartOfAccounts } = await getCostsPageData(tenant.id);

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
        actions={<CostDialog farms={farms} lots={lots} chartOfAccounts={chartOfAccounts} />}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total pago", value: totalPaid, className: "text-green-600" },
            { label: "Em aberto", value: totalOpen, className: "text-yellow-600" },
            { label: "Custos fixos", value: totalFixed, className: "" },
            { label: "Custos variáveis", value: totalVariable, className: "" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-xl font-bold ${item.className}`}>{formatCurrency(item.value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {costs.length === 0 ? (
          <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum custo registrado ainda.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {costs.map((cost: CostRow) => (
                <article key={cost.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{cost.description}</p>
                      <p className="text-sm text-muted-foreground">{cost.farm.name}</p>
                      {cost.lot && <p className="text-xs text-muted-foreground">{cost.lot.code}</p>}
                    </div>
                    <Badge variant={cost.status === "PAID" ? "success" : cost.status === "OPEN" ? "warning" : "secondary"}>
                      {cost.status === "PAID" ? "Pago" : cost.status === "OPEN" ? "Em aberto" : "Cancelado"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Categoria</p>
                      {cost.chartOfAccount ? (
                        <div>
                          <p>{cost.chartOfAccount.name}</p>
                          <p className="text-xs text-muted-foreground">{cost.chartOfAccount.code}</p>
                        </div>
                      ) : (
                        <p>{categoryLabels[cost.category] ?? cost.category}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p>{cost.type === "FIXED" ? "Fixo" : "Variável"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data</p>
                      <p>{formatDate(cost.date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vencimento</p>
                      <p>{cost.dueDate ? formatDate(cost.dueDate) : "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-semibold">{formatCurrency(Number(cost.amount))}</p>
                    </div>
                  </div>

                  {cost.status === "OPEN" && (
                    <div className="mt-4">
                      <PayCostButton id={cost.id} className="w-full" />
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="hidden rounded-lg border bg-card md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria / Conta contábil</TableHead>
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
                  {costs.map((cost: CostRow) => (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.description}</TableCell>
                      <TableCell>
                        {cost.chartOfAccount ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{cost.chartOfAccount.name}</span>
                            <span className="mt-0.5 text-[10px] font-mono leading-none text-muted-foreground">
                              {cost.chartOfAccount.code}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm">{categoryLabels[cost.category] ?? cost.category}</span>
                        )}
                      </TableCell>
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
                      <TableCell>{cost.status === "OPEN" && <PayCostButton id={cost.id} />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
