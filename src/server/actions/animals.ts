"use server";

import { prisma } from "@/lib/prisma";
import { AnimalSchema } from "@/lib/validations/animal";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";

export async function createAnimal(data: unknown): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("animals:create");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = AnimalSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return fail("Fazenda nao encontrada", "FARM_NOT_FOUND");

  const { birthDate, entryDate, ...rest } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.animal.create({
      data: {
        ...rest,
        entryDate: new Date(entryDate),
        birthDate: birthDate ? new Date(birthDate) : null,
        currentWeight: rest.entryWeight,
      },
    });

    if (rest.lotId) {
      await tx.cattleLot.update({
        where: { id: rest.lotId },
        data: { currentQuantity: { increment: 1 } },
      });
    }
  });

  revalidatePaths(["/rebanho"]);
  return ok();
}

export async function updateAnimal(id: string, data: unknown): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("animals:edit");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = AnimalSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const animal = await prisma.animal.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id } },
  });
  if (!animal) return fail("Animal nao encontrado", "ANIMAL_NOT_FOUND");

  const { birthDate, entryDate, ...rest } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.animal.update({
      where: { id },
      data: {
        ...rest,
        entryDate: new Date(entryDate),
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    if (animal.lotId !== rest.lotId) {
      if (animal.lotId) {
        await tx.cattleLot.update({
          where: { id: animal.lotId },
          data: { currentQuantity: { decrement: 1 } },
        });
      }

      if (rest.lotId) {
        await tx.cattleLot.update({
          where: { id: rest.lotId },
          data: { currentQuantity: { increment: 1 } },
        });
      }
    }
  });

  revalidatePaths(["/rebanho", `/rebanho/${id}`]);
  return ok();
}

export async function markAnimalDead(id: string, notes?: string): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("animals:edit");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const animal = await prisma.animal.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id }, status: "ACTIVE" },
  });
  if (!animal) return fail("Animal nao encontrado", "ANIMAL_NOT_FOUND");

  await prisma.$transaction(async (tx) => {
    await tx.animal.update({
      where: { id },
      data: { status: "DEAD", exitDate: new Date(), notes },
    });

    if (animal.lotId) {
      await tx.cattleLot.update({
        where: { id: animal.lotId },
        data: { currentQuantity: { decrement: 1 } },
      });
    }
  });

  revalidatePaths(["/rebanho", `/rebanho/${id}`]);
  return ok();
}

export async function transferAnimal(
  id: string,
  toLotId: string,
  toAreaId?: string
): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("animals:edit");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const animal = await prisma.animal.findFirst({
    where: { id, farm: { tenantId: tenantUser.tenant.id }, status: "ACTIVE" },
  });
  if (!animal) return fail("Animal nao encontrado", "ANIMAL_NOT_FOUND");

  const targetLot = await prisma.cattleLot.findFirst({
    where: { id: toLotId, farm: { tenantId: tenantUser.tenant.id } },
  });
  if (!targetLot) return fail("Lote de destino nao encontrado", "LOT_NOT_FOUND");

  await prisma.$transaction([
    prisma.animalMovement.create({
      data: {
        animalId: id,
        fromLotId: animal.lotId,
        toLotId,
        fromAreaId: undefined,
        toAreaId,
        date: new Date(),
        reason: "Transferencia",
      },
    }),
    prisma.animal.update({
      where: { id },
      data: { lotId: toLotId, status: "ACTIVE" },
    }),
    ...(animal.lotId
      ? [prisma.cattleLot.update({
          where: { id: animal.lotId },
          data: { currentQuantity: { decrement: 1 } },
        })]
      : []),
    prisma.cattleLot.update({
      where: { id: toLotId },
      data: { currentQuantity: { increment: 1 } },
    }),
  ]);

  revalidatePaths(["/rebanho", `/rebanho/${id}`, `/lotes/${toLotId}`]);
  return ok();
}
