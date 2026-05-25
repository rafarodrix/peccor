"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/server/services/tenant";
import { FarmSchema, AreaSchema } from "@/lib/validations/farm";

// ─── Farms ────────────────────────────────────────────────────────────────────

export async function createFarm(data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = FarmSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.farm.create({
    data: { ...parsed.data, tenantId: tenant.id },
  });

  revalidatePath("/fazendas");
  return { success: true };
}

export async function updateFarm(id: string, data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = FarmSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({ where: { id, tenantId: tenant.id } });
  if (!farm) return { error: "Fazenda não encontrada" };

  await prisma.farm.update({ where: { id }, data: parsed.data });

  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${id}`);
  return { success: true };
}

export async function deleteFarm(id: string) {
  const { tenant } = await requireTenant();
  const farm = await prisma.farm.findFirst({ where: { id, tenantId: tenant.id } });
  if (!farm) return { error: "Fazenda não encontrada" };

  await prisma.farm.update({ where: { id }, data: { active: false } });

  revalidatePath("/fazendas");
  return { success: true };
}

// ─── Areas ────────────────────────────────────────────────────────────────────

export async function createArea(data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = AreaSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  await prisma.farmArea.create({ data: parsed.data });

  revalidatePath("/areas");
  revalidatePath(`/fazendas/${parsed.data.farmId}`);
  return { success: true };
}

export async function updateArea(id: string, data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = AreaSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const area = await prisma.farmArea.findFirst({
    where: { id, farm: { tenantId: tenant.id } },
  });
  if (!area) return { error: "Área não encontrada" };

  await prisma.farmArea.update({ where: { id }, data: parsed.data });

  revalidatePath("/areas");
  return { success: true };
}

export async function deleteArea(id: string) {
  const { tenant } = await requireTenant();
  const area = await prisma.farmArea.findFirst({
    where: { id, farm: { tenantId: tenant.id } },
  });
  if (!area) return { error: "Área não encontrada" };

  await prisma.farmArea.update({ where: { id }, data: { active: false } });

  revalidatePath("/areas");
  return { success: true };
}
