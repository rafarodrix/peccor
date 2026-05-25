"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/services/tenant";
import { LotSchema } from "@/lib/validations/lot";

export async function createLot(data: unknown) {
  const { error, tenantUser } = await requirePermission("lots:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = LotSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  const { startDate, ...rest } = parsed.data;
  await prisma.cattleLot.create({
    data: {
      ...rest,
      startDate: new Date(startDate),
      currentQuantity: rest.initialQuantity,
      currentAvgWeight: rest.initialAvgWeight,
    },
  });

  revalidatePath("/lotes");
  return { success: true };
}

export async function updateLot(id: string, data: unknown) {
  const { error, tenantUser } = await requirePermission("lots:edit");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = LotSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lot = await prisma.cattleLot.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id } },
  });
  if (!lot) return { error: "Lote não encontrado" };

  const { startDate, ...rest } = parsed.data;
  await prisma.cattleLot.update({
    where: { id },
    data: { ...rest, startDate: new Date(startDate) },
  });

  revalidatePath("/lotes");
  revalidatePath(`/lotes/${id}`);
  return { success: true };
}

export async function closeLot(id: string) {
  const { error, tenantUser } = await requirePermission("lots:close");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const lot = await prisma.cattleLot.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id } },
  });
  if (!lot) return { error: "Lote não encontrado" };

  await prisma.cattleLot.update({
    where: { id },
    data: { status: "CLOSED", endDate: new Date() },
  });

  revalidatePath("/lotes");
  revalidatePath(`/lotes/${id}`);
  return { success: true };
}

export async function deleteLot(id: string) {
  const { error, tenantUser } = await requirePermission("lots:edit");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const lot = await prisma.cattleLot.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id }, status: "ACTIVE" },
  });
  if (!lot) return { error: "Lote não encontrado ou não pode ser excluído" };

  const hasFinancial = await prisma.purchaseItem.findFirst({ where: { lotId: id } });
  if (hasFinancial) return { error: "Lote possui compras registradas e não pode ser excluído" };

  await prisma.cattleLot.update({ where: { id }, data: { status: "CANCELED" } });

  revalidatePath("/lotes");
  return { success: true };
}
