import { NextResponse } from "next/server";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { toCSV } from "@/lib/export";

export async function GET() {
  try {
    const { tenant } = await requireTenant();

    const costs = await prisma.cost.findMany({
      where: {
        farm: { tenantId: tenant.id },
        status: { not: "CANCELED" },
      },
      include: {
        farm: { select: { name: true } },
        lot: { select: { code: true } },
      },
      orderBy: { date: "desc" },
    });

    const headers = [
      "Data",
      "Descrição",
      "Categoria",
      "Tipo",
      "Fazenda",
      "Lote",
      "Valor",
      "Status",
      "Pago em",
    ];

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
    const typeLabels: Record<string, string> = {
      FIXED: "Fixo",
      VARIABLE: "Variável",
    };
    const statusLabels: Record<string, string> = {
      OPEN: "Em aberto",
      PAID: "Pago",
      CANCELED: "Cancelado",
    };

    const rows = costs.map((c) => [
      c.date.toISOString().split("T")[0],
      c.description,
      categoryLabels[c.category] ?? c.category,
      typeLabels[c.type] ?? c.type,
      c.farm.name,
      c.lot?.code ?? "",
      Number(c.amount).toFixed(2),
      statusLabels[c.status] ?? c.status,
      c.paidAt ? c.paidAt.toISOString().split("T")[0] : "",
    ]);

    const csv = toCSV(headers, rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="custos.csv"',
      },
    });
  } catch {
    return new NextResponse("Não autorizado", { status: 401 });
  }
}
