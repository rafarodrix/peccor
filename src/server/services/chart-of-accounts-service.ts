import { prisma as defaultPrisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";
import type { PrismaTransactionClient } from "@/server/lib/prisma-types";

export const DEFAULT_PECUARIA_ACCOUNTS = [
  // ─── RECEITAS ─────────────────────────────────────────────────────────────
  { code: "1", name: "Receitas", type: "INFLOW", dfcCategory: null },
  { code: "1.1", name: "Receitas Operacionais", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1" },
  { code: "1.1.01", name: "Venda de Animais (Gado Gordo)", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1.1" },
  { code: "1.1.02", name: "Venda de Animais (Cria/Desmame)", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1.1" },
  { code: "1.1.03", name: "Venda de Subprodutos (Leite, Couro)", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1.1" },
  { code: "1.2", name: "Outras Receitas", type: "INFLOW", dfcCategory: "INVESTMENT", parentCode: "1" },
  { code: "1.2.01", name: "Venda de Imobilizado (Máquinas/Terra)", type: "INFLOW", dfcCategory: "INVESTMENT", parentCode: "1.2" },

  // ─── DESPESAS / CUSTOS ─────────────────────────────────────────────────────
  { code: "2", name: "Despesas e Custos", type: "OUTFLOW", dfcCategory: null },
  { code: "2.1", name: "Custos Operacionais", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2" },
  { code: "2.1.01", name: "Nutrição (Ração, Mineral)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.02", name: "Saúde Animal (Medicamentos, Vacinas)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.03", name: "Mão de Obra (Salários, Encargos)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.04", name: "Despesas Administrativas (Energia, Internet)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.05", name: "Impostos e Taxas (Funrural)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.2", name: "Custos de Investimento", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2" },
  { code: "2.2.01", name: "Aquisição de Touros/Matrizes", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2.2" },
  { code: "2.2.02", name: "Compra de Tratores/Implementos", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2.2" },
  { code: "2.2.03", name: "Construção de Cercas/Currais", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2.2" },
  { code: "2.3", name: "Fluxos de Financiamento", type: "OUTFLOW", dfcCategory: "FINANCING", parentCode: "2" },
  { code: "2.3.01", name: "Amortização de Custeio Agrícola", type: "OUTFLOW", dfcCategory: "FINANCING", parentCode: "2.3" },
  { code: "2.3.02", name: "Juros sobre Empréstimos", type: "OUTFLOW", dfcCategory: "FINANCING", parentCode: "2.3" },
];

export class ChartOfAccountsService {
  private prisma: PrismaClient | PrismaTransactionClient;

  constructor(prisma: PrismaClient | PrismaTransactionClient = defaultPrisma) {
    this.prisma = prisma;
  }

  /**
   * Realiza o seed contábil para o Plano de Contas padrão de Pecuária para um inquilino (Tenant).
   * Executa em ordem de dependência contábil (pais primeiro, depois filhos).
   */
  async seedDefaultAccounts(tenantId: string) {
    const createdAccounts = new Map<string, string>(); // code -> id

    // Se this.prisma já for uma transação, usamos diretamente, senão criamos uma transação
    const execute = async (tx: PrismaTransactionClient) => {
      for (const item of DEFAULT_PECUARIA_ACCOUNTS) {
        const parentId = item.parentCode ? createdAccounts.get(item.parentCode) : null;

        const account = await tx.chartOfAccount.upsert({
          where: {
            tenantId_code: {
              tenantId,
              code: item.code,
            },
          },
          update: {
            name: item.name,
            type: item.type as "INFLOW" | "OUTFLOW",
            dfcCategory: item.dfcCategory as "OPERATIONAL" | "INVESTMENT" | "FINANCING" | null,
            parentId: parentId ?? null,
          },
          create: {
            tenantId,
            code: item.code,
            name: item.name,
            type: item.type as "INFLOW" | "OUTFLOW",
            dfcCategory: item.dfcCategory as "OPERATIONAL" | "INVESTMENT" | "FINANCING" | null,
            parentId: parentId ?? null,
          },
        });

        createdAccounts.set(item.code, account.id);
      }

      return createdAccounts;
    };

    if ("$transaction" in this.prisma) {
      return this.prisma.$transaction(execute);
    } else {
      return execute(this.prisma as PrismaTransactionClient);
    }
  }
}
