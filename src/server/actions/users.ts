"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireTenant, requirePermission } from "@/server/services/tenant";
import { InviteUserSchema, UpdateRoleSchema } from "@/lib/validations/user";

export async function inviteUser(data: unknown) {
  const { error, tenantUser } = await requirePermission("users:invite");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = InviteUserSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password, role: newRole } = parsed.data;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const hashed = await bcrypt.hash(password, 12);
    user = await prisma.user.create({ data: { name, email, password: hashed } });
  }

  const existing = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId: user.id } },
  });

  if (existing) {
    if (existing.active) return { error: "Usuário já está na organização" };
    await prisma.tenantUser.update({
      where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId: user.id } },
      data: { active: true, role: newRole },
    });
  } else {
    await prisma.tenantUser.create({
      data: { tenantId: tenantUser.tenant.id, userId: user.id, role: newRole },
    });
  }

  revalidatePath("/configuracoes/usuarios");
  return { success: true };
}

export async function updateUserRole(data: unknown) {
  const { error, tenantUser } = await requirePermission("users:edit_role");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const parsed = UpdateRoleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { userId, role: newRole } = parsed.data;

  const ownerRecord = await prisma.tenantUser.findFirst({
    where: { tenantId: tenantUser.tenant.id, role: "OWNER" },
  });
  if (ownerRecord?.userId === userId && newRole !== "OWNER") {
    return { error: "Não é possível remover o papel de proprietário de si mesmo" };
  }

  await prisma.tenantUser.update({
    where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId } },
    data: { role: newRole },
  });

  revalidatePath("/configuracoes/usuarios");
  return { success: true };
}

export async function removeUser(userId: string) {
  const { error, tenantUser } = await requirePermission("users:remove");
  if (error || !tenantUser) return { error: error ?? "Sem permissão" };

  const target = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId } },
  });
  if (!target) return { error: "Usuário não encontrado" };
  if (target.role === "OWNER") return { error: "Não é possível remover o proprietário" };

  await prisma.tenantUser.update({
    where: { tenantId_userId: { tenantId: tenantUser.tenant.id, userId } },
    data: { active: false },
  });

  revalidatePath("/configuracoes/usuarios");
  return { success: true };
}

export async function getUsers() {
  const { tenant } = await requireTenant();

  return prisma.tenantUser.findMany({
    where: { tenantId: tenant.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
}
