"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/services/tenant";
import { WeighingService } from "@/server/services/weighing-service";

// ─── Animal Import ─────────────────────────────────────────────────────────────

export interface AnimalImportRow {
  tag?: string;
  category: string;
  sex: string;
  breed?: string;
  entryDate: string;
  entryWeight?: number;
  purchaseCost?: number;
}

export async function importAnimals(farmId: string, rows: AnimalImportRow[]) {
  const { error, tenantUser } = await requirePermission("animals:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const farm = await prisma.farm.findFirst({
    where: { id: farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada ou sem acesso" };

  const validCategories = [
    "BOI", "BRINCO", "GARROTE", "NOVILHA", "NOVILHO", "VACA", "BEZERRA", "BEZERRO", "TOURO",
  ];
  const validSexes = ["MALE", "FEMALE"];

  const validRows = rows.filter((row) => {
    return (
      validCategories.includes(row.category?.toUpperCase()) &&
      validSexes.includes(row.sex?.toUpperCase()) &&
      row.entryDate
    );
  });

  if (validRows.length === 0) {
    return { error: "Nenhuma linha válida encontrada. Verifique os valores de categoria e sexo." };
  }

  try {
    await prisma.animal.createMany({
      data: validRows.map((row) => ({
        farmId,
        tag: row.tag || null,
        category: row.category.toUpperCase() as
          | "BOI"
          | "GARROTE"
          | "NOVILHA"
          | "NOVILHO"
          | "VACA"
          | "BEZERRA"
          | "BEZERRO"
          | "TOURO",
        sex: row.sex.toUpperCase() as "MALE" | "FEMALE",
        breed: row.breed || null,
        entryDate: new Date(row.entryDate),
        entryWeight: row.entryWeight ?? null,
        currentWeight: row.entryWeight ?? null,
        purchaseCost: row.purchaseCost ?? null,
        status: "ACTIVE",
      })),
      skipDuplicates: false,
    });

    return { success: true, count: validRows.length };
  } catch (err) {
    console.error("importAnimals error", err);
    return { error: "Erro ao importar animais. Verifique os dados e tente novamente." };
  }
}

// ─── Weighing Import ───────────────────────────────────────────────────────────

export interface WeighingImportRow {
  date: string;
  lotCode?: string;
  animalTag?: string;
  weight: number;
  responsible?: string;
}

export async function importWeighings(farmId: string, rows: WeighingImportRow[]) {
  const { error, tenantUser } = await requirePermission("weighings:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const farm = await prisma.farm.findFirst({
    where: { id: farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada ou sem acesso" };

  if (rows.length === 0) return { error: "Nenhuma linha para importar." };

  // Pre-fetch lots and animals for this farm to avoid N+1
  const [lots, animals] = await Promise.all([
    prisma.cattleLot.findMany({
      where: { farmId },
      select: { id: true, code: true },
    }),
    prisma.animal.findMany({
      where: { farmId, status: "ACTIVE" },
      select: { id: true, tag: true },
    }),
  ]);

  const lotByCode = new Map(lots.map((l) => [l.code.toLowerCase(), l.id]));
  const animalByTag = new Map(
    animals.filter((a) => a.tag).map((a) => [a.tag!.toLowerCase(), a.id])
  );

  const itemsToImport = rows
    .filter((row) => row.weight > 0 && row.date)
    .map((row) => {
      let lotId: string | null = null;
      let animalId: string | null = null;

      if (row.lotCode) {
        lotId = lotByCode.get(row.lotCode.toLowerCase()) ?? null;
      } else if (row.animalTag) {
        animalId = animalByTag.get(row.animalTag.toLowerCase()) ?? null;
      }

      return {
        lotId,
        animalId,
        date: new Date(row.date),
        weight: row.weight,
        responsible: row.responsible || null,
      };
    })
    .filter((item) => item.lotId !== null || item.animalId !== null);

  if (itemsToImport.length === 0) {
    return {
      error:
        "Nenhuma linha válida encontrada. Certifique-se de que os brincos e códigos de lote existem na fazenda selecionada.",
    };
  }

  try {
    const weighingService = new WeighingService();
    const result = await weighingService.registerBatchWeighings(farmId, itemsToImport);
    return { success: true, count: result.count };
  } catch (err) {
    console.error("importWeighings error", err);
    return { error: "Erro ao importar pesagens." };
  }
}

// ─── Cost Import ───────────────────────────────────────────────────────────────

export interface CostImportRow {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  dueDate?: string;
}

export async function importCosts(farmId: string, rows: CostImportRow[]) {
  const { error, tenantUser } = await requirePermission("costs:create");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const farm = await prisma.farm.findFirst({
    where: { id: farmId, tenantId: tenantUser.tenant.id },
  });
  if (!farm) return { error: "Fazenda não encontrada ou sem acesso" };

  const validCategories = [
    "FUNCIONARIO",
    "ENERGIA",
    "ARRENDAMENTO",
    "RACAO",
    "SAL_MINERAL",
    "VACINA",
    "MEDICAMENTO",
    "FRETE",
    "MANUTENCAO",
    "COMISSAO",
    "COMBUSTIVEL",
    "VETERINARIO",
    "OUTROS",
  ];
  const validTypes = ["FIXED", "VARIABLE"];

  const validRows = rows.filter(
    (row) =>
      row.date &&
      row.description?.trim() &&
      row.amount > 0 &&
      validCategories.includes(row.category?.toUpperCase()) &&
      validTypes.includes(row.type?.toUpperCase())
  );

  if (validRows.length === 0) {
    return { error: "Nenhuma linha válida encontrada. Verifique os valores de categoria e tipo." };
  }

  try {
    await prisma.cost.createMany({
      data: validRows.map((row) => ({
        farmId,
        description: row.description.trim(),
        date: new Date(row.date),
        dueDate: row.dueDate ? new Date(row.dueDate) : null,
        amount: row.amount,
        category: row.category.toUpperCase() as
          | "FUNCIONARIO"
          | "ENERGIA"
          | "ARRENDAMENTO"
          | "RACAO"
          | "SAL_MINERAL"
          | "VACINA"
          | "MEDICAMENTO"
          | "FRETE"
          | "MANUTENCAO"
          | "COMISSAO"
          | "COMBUSTIVEL"
          | "VETERINARIO"
          | "OUTROS",
        type: row.type.toUpperCase() as "FIXED" | "VARIABLE",
        status: "OPEN",
      })),
    });

    return { success: true, count: validRows.length };
  } catch (err) {
    console.error("importCosts error", err);
    return { error: "Erro ao importar custos." };
  }
}
