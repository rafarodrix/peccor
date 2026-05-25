import { describe, it, expect, vi } from "vitest";

// Mocka o prisma antes do import do DfcService para evitar erros de conexão em testes
vi.mock("@/lib/prisma", () => ({
  prisma: {
    cost: {
      findMany: vi.fn(),
    },
    purchase: {
      findMany: vi.fn(),
    },
    sale: {
      findMany: vi.fn(),
    },
  },
}));

import { DfcService } from "../dfc-service";
import { prisma } from "@/lib/prisma";

describe("DfcService", () => {
  it("deve agregar movimentações de caixa corretamente por atividades FCO, FCI e FCF", async () => {
    // Mock de Custos pagos no período
    vi.mocked(prisma.cost.findMany).mockResolvedValue([
      {
        id: "cost-1",
        amount: 500, // OUTFLOW
        status: "PAID",
        paidAt: new Date("2026-05-01"),
        chartOfAccount: {
          id: "acc-1",
          code: "2.1.01",
          name: "Nutrição",
          type: "OUTFLOW",
          dfcCategory: "OPERATIONAL",
        },
      },
      {
        id: "cost-2",
        amount: 15000, // OUTFLOW
        status: "PAID",
        paidAt: new Date("2026-05-10"),
        chartOfAccount: {
          id: "acc-2",
          code: "2.2.02",
          name: "Compra de Tratores",
          type: "OUTFLOW",
          dfcCategory: "INVESTMENT",
        },
      },
      {
        id: "cost-3",
        amount: 2000, // OUTFLOW
        status: "PAID",
        paidAt: new Date("2026-05-15"),
        chartOfAccount: {
          id: "acc-3",
          code: "2.3.01",
          name: "Amortização de Custeio",
          type: "OUTFLOW",
          dfcCategory: "FINANCING",
        },
      },
    ] as any);

    // Mock de Compras
    vi.mocked(prisma.purchase.findMany).mockResolvedValue([
      {
        id: "pur-1",
        totalValue: 10000, // OUTFLOW
        date: new Date("2026-05-05"),
      },
    ] as any);

    // Mock de Vendas
    vi.mocked(prisma.sale.findMany).mockResolvedValue([
      {
        id: "sale-1",
        netValue: 35000, // INFLOW
        date: new Date("2026-05-20"),
      },
    ] as any);

    const report = await DfcService.generateDfcReport("tenant-1");

    // FCO = +35000 (Vendas) - 10000 (Compras) - 500 (Custo Nutrição) = 24500
    expect(report.operationalFlow).toBe(24500);

    // FCI = -15000 (Compra de Tratores)
    expect(report.investmentFlow).toBe(-15000);

    // FCF = -2000 (Amortização Custeio)
    expect(report.financingFlow).toBe(-2000);

    // Saldo Líquido = 24500 - 15000 - 2000 = 7500
    expect(report.netCashFlow).toBe(7500);

    // Verifica ordenação e agrupamento de detalhes
    expect(report.details.length).toBeGreaterThan(0);
    const nutritionDetail = report.details.find((d) => d.code === "2.1.01");
    expect(nutritionDetail).toBeDefined();
    expect(nutritionDetail?.amount).toBe(500);
  });

  it("deve lidar com custos legados sem conta contábil associando-os a custos gerais", async () => {
    vi.mocked(prisma.cost.findMany).mockResolvedValue([
      {
        id: "legacy-1",
        amount: 250,
        status: "PAID",
        paidAt: new Date("2026-05-01"),
        chartOfAccount: null, // Sem classificação contábil
      },
    ] as any);

    vi.mocked(prisma.purchase.findMany).mockResolvedValue([]);
    vi.mocked(prisma.sale.findMany).mockResolvedValue([]);

    const report = await DfcService.generateDfcReport("tenant-1");

    // Deve computar como FCO
    expect(report.operationalFlow).toBe(-250);
    expect(report.netCashFlow).toBe(-250);

    // Deve colocar sob o código de fallback "2.1.99"
    const legacyDetail = report.details.find((d) => d.code === "2.1.99");
    expect(legacyDetail).toBeDefined();
    expect(legacyDetail?.amount).toBe(250);
  });
});
