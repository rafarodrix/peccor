"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/server/services/tenant";
import { HealthEventSchema } from "@/lib/validations/health";

export async function createHealthEvent(data: unknown) {
  const { tenant } = await requireTenant();
  const parsed = HealthEventSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const animal = await prisma.animal.findFirst({
    where: { id: parsed.data.animalId, farm: { tenantId: tenant.id } },
  });
  if (!animal) return { error: "Animal não encontrado" };

  const { date, ...rest } = parsed.data;
  await prisma.healthEvent.create({
    data: { ...rest, date: new Date(date) },
  });

  if (parsed.data.type === "MORTE") {
    await prisma.animal.update({
      where: { id: parsed.data.animalId },
      data: { status: "DEAD", exitDate: new Date() },
    });

    if (animal.lotId) {
      await prisma.cattleLot.update({
        where: { id: animal.lotId },
        data: { currentQuantity: { decrement: 1 } },
      });
    }
  }

  revalidatePath("/manejo-sanitario");
  return { success: true };
}
