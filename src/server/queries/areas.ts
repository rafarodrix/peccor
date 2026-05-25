import { prisma } from "@/lib/prisma";
import { getFarmOptions } from "@/server/queries/reference";

export async function getAreasPageData(tenantId: string) {
  const [farms, areas] = await Promise.all([
    getFarmOptions(tenantId),
    prisma.farmArea.findMany({
      where: { farm: { tenantId }, active: true },
      include: {
        farm: { select: { name: true } },
        _count: { select: { lots: { where: { status: "ACTIVE" } } } },
      },
      orderBy: [{ farm: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  return { farms, areas };
}
