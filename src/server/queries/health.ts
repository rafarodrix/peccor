import { prisma } from "@/lib/prisma";
import { getAnimalOptions } from "@/server/queries/reference";

export async function getHealthPageData(tenantId: string) {
  const [animals, healthEvents] = await Promise.all([
    getAnimalOptions(tenantId),
    prisma.healthEvent.findMany({
      where: { animal: { farm: { tenantId } } },
      include: {
        animal: {
          select: { tag: true, lot: { select: { code: true } }, farm: { select: { name: true } } },
        },
      },
      orderBy: { date: "desc" },
      take: 200,
    }),
  ]);

  return { animals, healthEvents };
}
