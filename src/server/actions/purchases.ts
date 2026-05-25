"use server";

import { prisma } from "@/lib/prisma";
import { PurchaseSchema } from "@/lib/validations/purchase";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";
import { FinanceService } from "@/server/services/finance-service";

export async function createPurchase(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  const { error, tenantUser } = await requirePermission("purchases:create");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = PurchaseSchema.safeParse(data);
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
    const purchase = await financeService.registerPurchase({
      ...rest,
      lotId,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    revalidatePaths(["/compras", "/dashboard"]);
    return ok({ id: purchase.id });
  } catch (err) {
    console.error("createPurchase action error", err);
    return fail("Erro interno ao registrar compra", "INTERNAL_ERROR");
  }
}

