"use server";

import { prisma } from "@/lib/prisma";
import { WeighingSchema } from "@/lib/validations/weighing";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission } from "@/server/services/tenant";
import { WeighingService } from "@/server/services/weighing-service";

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

  const { date, animalId, lotId, weight, responsible, notes } = parsed.data;

  try {
    const weighingService = new WeighingService();
    await weighingService.registerWeighing({
      farmId: parsed.data.farmId,
      animalId,
      lotId,
      date: new Date(date),
      weight,
      responsible,
      notes,
    });

    revalidatePaths(["/pesagens", "/rebanho", "/lotes"]);
    return ok();
  } catch (err) {
    console.error("createWeighing action error", err);
    return fail("Erro interno ao salvar pesagem", "INTERNAL_ERROR");
  }
}

