"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/services/tenant";
import { WeighingSchema } from "@/lib/validations/weighing";

export async function createWeighing(data: unknown) {
  const { error, tenantUser } = await requirePermission("weighings:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = WeighingSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada" };

  const { date, animalId, lotId, ...rest } = parsed.data;

  let previousWeight: number | null = null;
  let daysSinceLast: number | null = null;

  if (animalId) {
    const prev = await prisma.weighing.findFirst({
      where: { animalId },
      orderBy: { date: "desc" },
    });
    if (prev) {
      previousWeight = Number(prev.weight);
      daysSinceLast = Math.round(
        (new Date(date).getTime() - prev.date.getTime()) / 86400000
      );
    }
  } else if (lotId) {
    const prev = await prisma.weighing.findFirst({
      where: { lotId, animalId: null },
      orderBy: { date: "desc" },
    });
    if (prev) {
      previousWeight = Number(prev.weight);
      daysSinceLast = Math.round(
        (new Date(date).getTime() - prev.date.getTime()) / 86400000
      );
    }
  }

  const weightGain = previousWeight !== null ? rest.weight - previousWeight : null;
  const dailyGain =
    weightGain !== null && daysSinceLast && daysSinceLast > 0
      ? weightGain / daysSinceLast
      : null;

  await prisma.weighing.create({
    data: {
      ...rest,
      date: new Date(date),
      animalId: animalId ?? null,
      lotId: lotId ?? null,
      previousWeight,
      weightGain,
      daysSinceLast,
      dailyGain,
    },
  });

  if (animalId) {
    await prisma.animal.update({
      where: { id: animalId },
      data: { currentWeight: rest.weight },
    });
  } else if (lotId) {
    await prisma.cattleLot.update({
      where: { id: lotId },
      data: { currentAvgWeight: rest.weight },
    });
  }

  revalidatePath("/pesagens");
  return { success: true };
}
