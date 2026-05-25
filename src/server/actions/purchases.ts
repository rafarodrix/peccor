"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/services/tenant";
import { PurchaseSchema } from "@/lib/validations/purchase";
import { calcPurchaseTotalCost } from "@/lib/utils";

export async function createPurchase(data: unknown) {
  const { error, tenantUser } = await requirePermission("purchases:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = PurchaseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  const { date, dueDate, lotId, ...rest } = parsed.data;
  const totalValue = calcPurchaseTotalCost(
    rest.animalValue,
    rest.freightValue,
    rest.commissionValue,
    rest.otherCosts
  );

  const purchase = await prisma.purchase.create({
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
  });

  if (lotId) {
    const lot = await prisma.cattleLot.findUnique({ where: { id: lotId } });
    if (lot) {
      await prisma.cattleLot.update({
        where: { id: lotId },
        data: {
          currentQuantity: { increment: rest.quantity },
          initialQuantity: { increment: rest.quantity },
        },
      });
    }
  }

  revalidatePath("/compras");
  revalidatePath("/dashboard");
  return { success: true, id: purchase.id };
}
