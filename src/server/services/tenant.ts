import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TenantRole } from "@prisma/client";
import { hasPermission, type Permission } from "@/lib/permissions";

export async function getCurrentTenant() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const tenantUser = await prisma.tenantUser.findFirst({
    where: { userId: session.user.id, active: true },
    include: {
      tenant: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return tenantUser;
}

export async function requireTenant() {
  const tenantUser = await getCurrentTenant();
  if (!tenantUser) throw new Error("Não autenticado");
  return tenantUser;
}

export async function requirePermission(permission: Permission) {
  const tenantUser = await requireTenant();
  if (!hasPermission(tenantUser.role, permission)) {
    return { error: "Sem permissão para executar esta ação", tenantUser: null };
  }
  return { error: null, tenantUser };
}

export async function getUserRole(): Promise<TenantRole | null> {
  const tenantUser = await getCurrentTenant();
  return tenantUser?.role ?? null;
}
