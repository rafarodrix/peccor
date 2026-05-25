"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/server/services/tenant";
import { AnimalSchema } from "@/lib/validations/animal";

export async function createAnimal(data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = AnimalSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  const { birthDate, entryDate, ...rest } = parsed.data;
  await prisma.animal.create({
    data: {
      ...rest,
      entryDate: new Date(entryDate),
      birthDate: birthDate ? new Date(birthDate) : null,
      currentWeight: rest.entryWeight,
    },
  });

  if (rest.lotId) {
    await prisma.cattleLot.update({
      where: { id: rest.lotId },
      data: { currentQuantity: { increment: 1 } },
    });
  }

  revalidatePath("/rebanho");
  return { success: true };
}

export async function updateAnimal(id: string, data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = AnimalSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const animal = await prisma.animal.findFirst({
    where: { id, farm: { tenantId: tenant.id } },
  });
  if (!animal) return { error: "Animal não encontrado" };

  const { birthDate, entryDate, ...rest } = parsed.data;
  await prisma.animal.update({
    where: { id },
    data: {
      ...rest,
      entryDate: new Date(entryDate),
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });

  revalidatePath("/rebanho");
  revalidatePath(`/rebanho/${id}`);
  return { success: true };
}

export async function markAnimalDead(id: string, notes?: string) {
  const { tenant } = await requireTenant();
  const animal = await prisma.animal.findFirst({
    where: { id, farm: { tenantId: tenant.id }, status: "ACTIVE" },
  });
  if (!animal) return { error: "Animal não encontrado" };

  await prisma.animal.update({
    where: { id },
    data: { status: "DEAD", exitDate: new Date(), notes },
  });

  if (animal.lotId) {
    await prisma.cattleLot.update({
      where: { id: animal.lotId },
      data: { currentQuantity: { decrement: 1 } },
    });
  }

  revalidatePath("/rebanho");
  return { success: true };
}

export async function transferAnimal(
  id: string,
  toLotId: string,
  toAreaId?: string
) {
  const { tenant } = await requireTenant();
  const animal = await prisma.animal.findFirst({
    where: { id, farm: { tenantId: tenant.id }, status: "ACTIVE" },
  });
  if (!animal) return { error: "Animal não encontrado" };

  await prisma.$transaction([
    prisma.animalMovement.create({
      data: {
        animalId: id,
        fromLotId: animal.lotId,
        toLotId,
        date: new Date(),
        reason: "Transferência",
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

  revalidatePath("/rebanho");
  return { success: true };
}
