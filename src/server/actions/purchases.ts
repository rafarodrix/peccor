"use server";

import { prisma } from "@/lib/prisma";
import { calcPurchaseTotalCost } from "@/lib/utils";
import { PurchaseSchema } from "@/lib/validations/purchase";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";

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
  const totalValue = calcPurchaseTotalCost(
    rest.animalValue,
    rest.freightValue,
    rest.commissionValue,
    rest.otherCosts
  );

  const purchase = await prisma.$transaction(async (tx) => {
    const createdPurchase = await tx.purchase.create({
      data: {
        ...rest,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        totalValue,
        items: lotId
          ? {
              create: {
                lotId,
                quantity: rest.quantity,
                avgWeight: rest.totalWeight ? rest.totalWeight / rest.quantity : null,
                totalValue,
              },
            }
          : undefined,
      },
      select: { id: true },
    });

    if (lotId) {
      await tx.cattleLot.update({
        where: { id: lotId },
        data: {
          currentQuantity: { increment: rest.quantity },
          initialQuantity: { increment: rest.quantity },
        },
      });
    }

    return createdPurchase;
  });

  revalidatePaths(["/compras", "/dashboard"]);
  return ok({ id: purchase.id });
}
