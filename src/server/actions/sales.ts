"use server";

import { prisma } from "@/lib/prisma";
import { SaleSchema } from "@/lib/validations/sale";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";
import { FinanceService } from "@/server/services/finance-service";

export async function createSale(data: unknown): Promise<ActionResult<{ id: string }>> {
  const { error, tenantUser } = await requirePermission("sales:create");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = SaleSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return fail("Fazenda nao encontrada", "FARM_NOT_FOUND");

  const { date, dueDate, lotId, ...rest } = parsed.data;

  try {
    const financeService = new FinanceService();
    const sale = await financeService.registerSale({
      ...rest,
      lotId,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    revalidatePaths(["/vendas", "/dashboard"]);
    return ok({ id: sale.id });
  } catch (err) {
    console.error("createSale action error", err);
    return fail("Erro interno ao registrar venda", "INTERNAL_ERROR");
  }
}

