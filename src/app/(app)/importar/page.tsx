import { Header } from "@/components/layout/header";
import { requireTenant } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { ImportClient } from "./import-client";

export default async function ImportarPage() {
  const { tenant } = await requireTenant();

  const [farms, lots] = await Promise.all([
    prisma.farm.findMany({
      where: { tenantId: tenant.id, active: true },
      select: { id: true, name: true },
    }),
    prisma.cattleLot.findMany({
      where: { farm: { tenantId: tenant.id }, status: "ACTIVE" },
      select: { id: true, code: true, farmId: true },
    }),
  ]);

  return (
    <>
      <Header
        title="Importar"
        subtitle="Importe animais, pesagens e custos via arquivo CSV"
      />
      <ImportClient farms={farms} lots={lots} />
    </>
  );
}
