import { prisma } from "@/lib/prisma";

export class DfcService {
  static async generateDfcReport(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // 1. Buscar custos pagos (PAID) no período selecionado
    const costs = await prisma.cost.findMany({
      where: {
        farm: { tenantId },
        status: "PAID",
        paidAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        chartOfAccount: true,
      },
    });

    // 2. Buscar compras registradas no período
    const purchases = await prisma.purchase.findMany({
      where: {
        farm: { tenantId },
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // 3. Buscar vendas registradas no período
    const sales = await prisma.sale.findMany({
      where: {
        farm: { tenantId },
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // 4. Inicializadores de Fluxo de Caixa (FCO, FCI, FCF)
    let fco = 0;
    let fci = 0;
    let fcf = 0;

    // Estrutura para agrupar totais por Conta Contábil ativa
    const accountTotals: Record<string, {
      id: string;
      code: string;
      name: string;
      type: "INFLOW" | "OUTFLOW";
      amount: number;
      dfcCategory: "OPERATIONAL" | "INVESTMENT" | "FINANCING" | null;
    }> = {};

    // 5. Agrega Vendas (Receita Operacional FCO)
    const salesTotal = sales.reduce((acc, s) => acc + Number(s.netValue), 0);
    fco += salesTotal;

    if (salesTotal > 0) {
      accountTotals["1.1.01"] = {
        id: "sales-animals",
        code: "1.1.01",
        name: "Venda de Animais (Gado)",
        type: "INFLOW",
        amount: salesTotal,
        dfcCategory: "OPERATIONAL",
      };
    }

    // 6. Agrega Compras (Investimento de longo prazo se matriz/touro ou Operacional se reposição)
    // No Peccor, por padrão classificamos como Operacional (reposição) exceto se indicado.
    const purchasesTotal = purchases.reduce((acc, p) => acc + Number(p.totalValue), 0);
    fco -= purchasesTotal;

    if (purchasesTotal > 0) {
      accountTotals["2.2.01"] = {
        id: "purchases-animals",
        code: "2.2.01",
        name: "Aquisição de Animais (Reposição/Lote)",
        type: "OUTFLOW",
        amount: purchasesTotal,
        dfcCategory: "OPERATIONAL",
      };
    }

    // 7. Agrega todos os custos pagos baseado na classificação do Plano de Contas
    for (const cost of costs) {
      const amount = Number(cost.amount);
      const acc = cost.chartOfAccount;

      // Se a conta contábil do custo possui categoria DFC, usa-a, senão assume OPERATIONAL
      const dfcCat = acc?.dfcCategory ?? "OPERATIONAL";

      if (dfcCat === "OPERATIONAL") {
        fco -= amount;
      } else if (dfcCat === "INVESTMENT") {
        fci -= amount;
      } else if (dfcCat === "FINANCING") {
        fcf -= amount;
      }

      if (acc) {
        if (!accountTotals[acc.code]) {
          accountTotals[acc.code] = {
            id: acc.id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            amount: 0,
            dfcCategory: acc.dfcCategory,
          };
        }
        accountTotals[acc.code].amount += amount;
      } else {
        // Custos legados ou sem conta contábil vinculada
        const code = "2.1.99";
        if (!accountTotals[code]) {
          accountTotals[code] = {
            id: "legacy-costs",
            code,
            name: "Custos Gerais (Sem classificação)",
            type: "OUTFLOW",
            amount: 0,
            dfcCategory: "OPERATIONAL",
          };
        }
        accountTotals[code].amount += amount;
      }
    }

    const netCashFlow = fco + fci + fcf;

    // Ordena os detalhes da árvore contábil por código estrutural
    const details = Object.values(accountTotals).sort((a, b) => a.code.localeCompare(b.code));

    return {
      operationalFlow: fco,
      investmentFlow: fci,
      financingFlow: fcf,
      netCashFlow,
      details,
    };
  }
}
