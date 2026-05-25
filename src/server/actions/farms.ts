"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/services/tenant";
import { FarmSchema, AreaSchema } from "@/lib/validations/farm";

// ─── Farms ────────────────────────────────────────────────────────────────────

export async function createFarm(data: unknown) {
  const { error, tenantUser } = await requirePermission("farms:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = FarmSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.farm.create({
    data: { ...parsed.data, tenantId: tenantUser.tenant.id },
  });

  revalidatePath("/fazendas");
  return { success: true };
}

export async function updateFarm(id: string, data: unknown) {
  const { error, tenantUser } = await requirePermission("farms:edit");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = FarmSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({ where: { id, tenantId: tenantUser.tenant.id } });
  if (!farm) return { error: "Fazenda não encontrada" };

  await prisma.farm.update({ where: { id }, data: parsed.data });

  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${id}`);
  return { success: true };
}

export async function deleteFarm(id: string) {
  const { error, tenantUser } = await requirePermission("farms:delete");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const farm = await prisma.farm.findFirst({ where: { id, tenantId: tenantUser.tenant.id } });
  if (!farm) return { error: "Fazenda não encontrada" };

  await prisma.farm.update({ where: { id }, data: { active: false } });

  revalidatePath("/fazendas");
  return { success: true };
}

// ─── Areas ────────────────────────────────────────────────────────────────────

export async function createArea(data: unknown) {
  const { error, tenantUser } = await requirePermission("areas:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = AreaSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  await prisma.farmArea.create({ data: parsed.data });

  revalidatePath("/areas");
  revalidatePath(`/fazendas/${parsed.data.farmId}`);
  return { success: true };
}

export async function updateArea(id: string, data: unknown) {
  const { error, tenantUser } = await requirePermission("areas:edit");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = AreaSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const area = await prisma.farmArea.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id } },
  });
  if (!area) return { error: "Área não encontrada" };

  await prisma.farmArea.update({ where: { id }, data: parsed.data });

  revalidatePath("/areas");
  return { success: true };
}

export async function deleteArea(id: string) {
  const { error, tenantUser } = await requirePermission("areas:delete");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const area = await prisma.farmArea.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id } },
  });
  if (!area) return { error: "Área não encontrada" };

  await prisma.farmArea.update({ where: { id }, data: { active: false } });

  revalidatePath("/areas");
  return { success: true };
}
