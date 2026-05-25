"use server";

import { prisma } from "@/lib/prisma";
import { WeighingSchema } from "@/lib/validations/weighing";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import type { PrismaTransactionClient } from "@/server/lib/prisma-types";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";

export async function createWeighing(data: unknown): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("weighings:create");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = WeighingSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const farm = await prisma.farm.findFirst({
    where: { id: parsed.data.farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return fail("Fazenda nao encontrada", "FARM_NOT_FOUND");

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

  await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    await tx.weighing.create({
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
      await tx.animal.update({
        where: { id: animalId },
        data: { currentWeight: rest.weight },
      });
    } else if (lotId) {
      await tx.cattleLot.update({
        where: { id: lotId },
        data: { currentAvgWeight: rest.weight },
      });
    }
  });

  revalidatePaths(["/pesagens", "/rebanho", "/lotes"]);
  return ok();
}
