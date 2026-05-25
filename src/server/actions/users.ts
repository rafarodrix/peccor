"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { InviteUserSchema, UpdateRoleSchema } from "@/lib/validations/user";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { revalidatePaths } from "@/server/lib/revalidate-paths";
import { requirePermission, requireTenant } from "@/server/services/tenant";

export async function inviteUser(data: unknown): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("users:invite");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = InviteUserSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const { name, email, password, role: newRole } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        const hashed = await bcrypt.hash(password, 12);
        user = await tx.user.create({ data: { name, email, password: hashed } });
      }

      const existing = await tx.tenantUser.findUnique({
        where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId: user.id } },
      });

      if (existing) {
        if (existing.active) {
          throw new Error("USER_ALREADY_IN_TENANT");
        }

        await tx.tenantUser.update({
          where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId: user.id } },
          data: { active: true, role: newRole },
        });
        return;
      }

      await tx.tenantUser.create({
        data: { tenantId: tenantUser.tenant.id, userId: user.id, role: newRole },
      });
    });
  } catch (transactionError) {
    if (
      transactionError instanceof Error &&
      transactionError.message === "USER_ALREADY_IN_TENANT"
    ) {
      return fail("Usuario ja esta na organizacao", "USER_ALREADY_IN_TENANT");
    }

    throw transactionError;
  }

  revalidatePaths(["/configuracoes/usuarios"]);
  return ok();
}

export async function updateUserRole(data: unknown): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("users:edit_role");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const parsed = UpdateRoleSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const { userId, role: newRole } = parsed.data;

  const ownerRecord = await prisma.tenantUser.findFirst({
    where: { tenantId: tenantUser.tenant.id, role: "OWNER" },
  });
  if (ownerRecord?.userId === userId && newRole !== "OWNER") {
    return fail("Nao e possivel remover o papel de proprietario de si mesmo", "OWNER_GUARD");
  }

  await prisma.tenantUser.update({
    where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId } },
    data: { role: newRole },
  });

  revalidatePaths(["/configuracoes/usuarios"]);
  return ok();
}

export async function removeUser(userId: string): Promise<ActionResult> {
  const { error, tenantUser } = await requirePermission("users:remove");
  if (error || !tenantUser) return fail(error ?? "Sem permissao", "FORBIDDEN");

  const target = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId } },
  });
  if (!target) return fail("Usuario nao encontrado", "USER_NOT_FOUND");
  if (target.role === "OWNER") return fail("Nao e possivel remover o proprietario", "OWNER_GUARD");

  await prisma.tenantUser.update({
    where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId } },
    data: { active: false },
  });

  revalidatePaths(["/configuracoes/usuarios"]);
  return ok();
}

export async function getUsers() {
  const { tenant } = await requireTenant();

  return prisma.tenantUser.findMany({
    where: { tenantId: tenant.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
}
