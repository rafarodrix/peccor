"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/server/services/tenant";
import { InviteUserSchema, UpdateRoleSchema } from "@/lib/validations/user";

export async function inviteUser(data: unknown) {
  const { tenant, role } = await requireTenant();
  if (!["OWNER", "ADMIN"].includes(role)) {
    return { error: "Sem permissão para convidar usuários" };
  }

  const parsed = InviteUserSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password, role: newRole } = parsed.data;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const hashed = await bcrypt.hash(password, 12);
    user = await prisma.user.create({ data: { name, email, password: hashed } });
  }

  const existing = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
  });

  if (existing) {
    if (existing.active) return { error: "Usuário já está na organização" };
    await prisma.tenantUser.update({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      data: { active: true, role: newRole },
    });
  } else {
    await prisma.tenantUser.create({
      data: { tenantId: tenant.id, userId: user.id, role: newRole },
    });
  }

  revalidatePath("/configuracoes/usuarios");
  return { success: true };
}

export async function updateUserRole(data: unknown) {
  const { tenant, role } = await requireTenant();
  if (!["OWNER", "ADMIN"].includes(role)) {
    return { error: "Sem permissão para alterar perfis" };
  }

  const parsed = UpdateRoleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { userId, role: newRole } = parsed.data;

  // Prevent changing own role
  const currentUser = await prisma.tenantUser.findFirst({
    where: { tenantId: tenant.id, role: "OWNER" },
    include: { user: true },
  });
  if (currentUser?.userId === userId && newRole !== "OWNER") {
    return { error: "Não é possível remover o papel de proprietário de si mesmo" };
  }

  await prisma.tenantUser.update({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
    data: { role: newRole },
  });

  revalidatePath("/configuracoes/usuarios");
  return { success: true };
}

export async function removeUser(userId: string) {
  const { tenant, role } = await requireTenant();
  if (!["OWNER", "ADMIN"].includes(role)) {
    return { error: "Sem permissão para remover usuários" };
  }

  const target = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
  });
  if (!target) return { error: "Usuário não encontrado" };
  if (target.role === "OWNER") return { error: "Não é possível remover o proprietário" };

  await prisma.tenantUser.update({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
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
