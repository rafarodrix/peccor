"use server";

import { prisma } from "@/lib/prisma";
import { HealthEventSchema } from "@/lib/validations/health";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";

export async function createHealthEvent(data: unknown): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("health:create");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = HealthEventSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const animal = await prisma.animal.findFirst({
    where: { id: parsed.data.animalId, farm: { tenantId: tenantUser.tenant.id } },
  });
  if (!animal) return fail("Animal nao encontrado", "ANIMAL_NOT_FOUND");

  const { date, ...rest } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.healthEvent.create({
      data: { ...rest, date: new Date(date) },
    });

    if (parsed.data.type === "MORTE") {
      await tx.animal.update({
        where: { id: parsed.data.animalId },
        data: { status: "DEAD", exitDate: new Date() },
      });

      if (animal.lotId) {
        await tx.cattleLot.update({
          where: { id: animal.lotId },
          data: { currentQuantity: { decrement: 1 } },
        });
      }
    }
  });

  revalidatePaths(["/manejo-sanitario", "/rebanho"]);
  return ok();
}
