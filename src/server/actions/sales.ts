"use server";

import { prisma } from "@/lib/prisma";
import { calcSaleNetValue } from "@/lib/utils";
import { SaleSchema } from "@/lib/validations/sale";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";

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
  const netValue = calcSaleNetValue(
    rest.animalValue,
    rest.freightValue,
    rest.commissionValue,
    rest.discountValue
  );

  const sale = await prisma.$transaction(async (tx) => {
    const createdSale = await tx.sale.create({
      data: {
        ...rest,
        totalValue: rest.animalValue,
        netValue,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        items: lotId
          ? {
              create: {
                lotId,
                quantity: rest.quantity,
                avgWeight: rest.totalWeight ? rest.totalWeight / rest.quantity : null,
                totalValue: netValue,
              },
            }
          : undefined,
      },
      select: { id: true },
    });

    if (lotId) {
      const updatedLot = await tx.cattleLot.update({
        where: { id: lotId },
        data: { currentQuantity: { decrement: rest.quantity } },
        select: { currentQuantity: true },
      });

      if (updatedLot.currentQuantity <= 0) {
        await tx.cattleLot.update({
          where: { id: lotId },
          data: { status: "SOLD", endDate: new Date() },
        });
      }
    }

    return createdSale;
  });

  revalidatePaths(["/vendas", "/dashboard"]);
  return ok({ id: sale.id });
}
