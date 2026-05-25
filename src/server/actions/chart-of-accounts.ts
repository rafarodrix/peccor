"use server";

import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { requirePermission } from "@/server/services/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateAccountSchema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  name: z.string().min(1, "Nome obrigatório"),
  type: z.enum(["INFLOW", "OUTFLOW"]),
  dfcCategory: z.enum(["OPERATIONAL", "INVESTMENT", "FINANCING"]).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export async function createChartOfAccount(data: unknown): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("settings:read");
  if (error || !tenantUser) return fail(error ?? "Sem permissão", "FORBIDDEN");

  const parsed = CreateAccountSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos", "VALIDATION_ERROR");
  }

  try {
    const existing = await prisma.chartOfAccount.findUnique({
      where: {
        tenantId_code: {
          tenantId: tenantUser.tenant.id,
          code: parsed.data.code,
        },
      },
    });

    if (existing) {
      return fail("Já existe uma conta com este código", "CODE_ALREADY_EXISTS");
    }

    await prisma.chartOfAccount.create({
      data: {
        tenantId: tenantUser.tenant.id,
        code: parsed.data.code,
        name: parsed.data.name,
        type: parsed.data.type,
        dfcCategory: parsed.data.dfcCategory ?? null,
        parentId: parsed.data.parentId ?? null,
      },
    });

    revalidatePath("/configuracoes/financeiro");
    return ok();
  } catch (err) {
    console.error("createChartOfAccount error", err);
    return fail("Erro ao criar conta no Plano de Contas", "INTERNAL_ERROR");
  }
}
