import { prisma } from "@/lib/prisma";

export async function getChartOfAccounts(tenantId: string) {
  return prisma.chartOfAccount.findMany({
    where: { tenantId },
    orderBy: { code: "asc" },
  });
}
