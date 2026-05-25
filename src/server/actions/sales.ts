"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/server/services/tenant";
import { SaleSchema } from "@/lib/validations/sale";
import { calcSaleNetValue } from "@/lib/utils";

export async function createSale(data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = SaleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  const { date, dueDate, lotId, ...rest } = parsed.data;
  const netValue = calcSaleNetValue(
    rest.animalValue,
    rest.freightValue,
    rest.commissionValue,
    rest.discountValue
  );

  const sale = await prisma.sale.create({
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
              avgWeight: rest.totalWeight
                ? rest.totalWeight / rest.quantity
                : null,
              totalValue: netValue,
            },
          }
        : undefined,
    },
  });

  // Update lot quantity and mark animals as sold
  if (lotId) {
    await prisma.cattleLot.update({
      where: { id: lotId },
      data: { currentQuantity: { decrement: rest.quantity } },
    });

    // Check if lot is now empty → close it
    const lot = await prisma.cattleLot.findUnique({ where: { id: lotId } });
    if (lot && lot.currentQuantity <= 0) {
      await prisma.cattleLot.update({
        where: { id: lotId },
        data: { status: "SOLD", endDate: new Date() },
      });
    }
  }

  revalidatePath("/vendas");
  revalidatePath("/dashboard");
  return { success: true, id: sale.id };
}
