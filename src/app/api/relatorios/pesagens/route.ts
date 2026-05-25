import { NextResponse } from "next/server";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { toCSV } from "@/lib/export";

export async function GET() {
  try {
    const { tenant } = await requireTenant();

    const weighings = await prisma.weighing.findMany({
      where: { farm: { tenantId: tenant.id } },
      include: {
        lot: { select: { code: true } },
        animal: { select: { tag: true } },
      },
      orderBy: { date: "desc" },
      take: 500,
    });

    const headers = [
      "Data",
      "Lote",
      "Animal",
      "Peso Anterior (kg)",
      "Peso Atual (kg)",
      "Ganho (kg)",
      "Dias",
      "GMD (kg/d)",
      "Responsável",
    ];

    const rows = weighings.map((w) => [
      w.date.toISOString().split("T")[0],
      w.lot?.code ?? "",
      w.animal?.tag ?? "",
      w.previousWeight ? Number(w.previousWeight).toFixed(2) : "",
      Number(w.weight).toFixed(2),
      w.weightGain ? Number(w.weightGain).toFixed(2) : "",
      w.daysSinceLast ?? "",
      w.dailyGain ? Number(w.dailyGain).toFixed(4) : "",
      w.responsible ?? "",
    ]);

    const csv = toCSV(headers, rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="pesagens.csv"',
      },
    });
  } catch {
    return new NextResponse("Não autorizado", { status: 401 });
  }
}
