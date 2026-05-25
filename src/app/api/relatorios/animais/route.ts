import { NextResponse } from "next/server";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { toCSV } from "@/lib/export";

export async function GET() {
  try {
    const { tenant } = await requireTenant();

    const animals = await prisma.animal.findMany({
      where: { farm: { tenantId: tenant.id } },
      include: {
        farm: { select: { name: true } },
        lot: { select: { code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Brinco",
      "Categoria",
      "Sexo",
      "Raça",
      "Fazenda",
      "Lote",
      "Peso Atual (kg)",
      "Custo Compra",
      "Data Entrada",
      "Status",
    ];

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
    const sexLabels: Record<string, string> = {
      MALE: "Macho",
      FEMALE: "Fêmea",
    };
    const statusLabels: Record<string, string> = {
      ACTIVE: "Ativo",
      SOLD: "Vendido",
      DEAD: "Morto",
      TRANSFERRED: "Transferido",
      LOST: "Perdido",
    };

    const rows = animals.map((a) => [
      a.tag ?? "",
      categoryLabels[a.category] ?? a.category,
      sexLabels[a.sex] ?? a.sex,
      a.breed ?? "",
      a.farm.name,
      a.lot?.code ?? "",
      a.currentWeight ? Number(a.currentWeight).toFixed(2) : "",
      a.purchaseCost ? Number(a.purchaseCost).toFixed(2) : "",
      a.entryDate.toISOString().split("T")[0],
      statusLabels[a.status] ?? a.status,
    ]);

    const csv = toCSV(headers, rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="animais.csv"',
      },
    });
  } catch {
    return new NextResponse("Não autorizado", { status: 401 });
  }
}
