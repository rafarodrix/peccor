"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/server/services/tenant";
import { CostSchema } from "@/lib/validations/cost";

export async function createCost(data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = CostSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  const { date, dueDate, ...rest } = parsed.data;
  await prisma.cost.create({
    data: { ...rest, date: new Date(date), dueDate: dueDate ? new Date(dueDate) : null },
  });

  revalidatePath("/custos");
  return { success: true };
}

export async function payCost(id: string) {
  const { tenant } = await requireTenant();
  const cost = await prisma.cost.findFirst({
    where: { id, farm: { tenantId: tenant.id }, status: "OPEN" },
  });
  if (!cost) return { error: "Custo não encontrado" };

  await prisma.cost.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });

  revalidatePath("/custos");
  return { success: true };
}

export async function deleteCost(id: string) {
  const { tenant } = await requireTenant();
  const cost = await prisma.cost.findFirst({
    where: { id, farm: { tenantId: tenant.id } },
  });
  if (!cost) return { error: "Custo não encontrado" };

  await prisma.cost.update({ where: { id }, data: { status: "CANCELED" } });

  revalidatePath("/custos");
  return { success: true };
}
