import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, type Permission } from "@/lib/permissions";
import { fail } from "@/server/lib/action-result";

export const CURRENT_TENANT_COOKIE = "peccor.currentTenantId";

type CurrentTenant = NonNullable<Awaited<ReturnType<typeof getCurrentTenant>>>;
type TenantRole = CurrentTenant["role"];

export async function getCurrentTenant() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const cookieStore = await cookies();
  const currentTenantId = cookieStore.get(CURRENT_TENANT_COOKIE)?.value;

  const tenantUsers = await prisma.tenantUser.findMany({
    where: { userId: session.user.id, active: true },
    include: {
      tenant: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (tenantUsers.length === 0) return null;

  if (currentTenantId) {
    const currentTenant = tenantUsers.find(
      (tenantUser: (typeof tenantUsers)[number]) => tenantUser.tenantId === currentTenantId
    );
    if (currentTenant) return currentTenant;
  }

  return tenantUsers[0];
}

export async function requireTenant() {
  const tenantUser = await getCurrentTenant();
  if (!tenantUser) throw new Error("Nao autenticado");
  return tenantUser;
}

export async function requirePermission(permission: Permission) {
  const tenantUser = await requireTenant();
  if (!hasPermission(tenantUser.role, permission)) {
    return { error: "Sem permissao para executar esta acao", tenantUser: null };
  }

  return { error: null, tenantUser };
}

export async function getUserRole(): Promise<TenantRole | null> {
  const tenantUser = await getCurrentTenant();
  return tenantUser?.role ?? null;
}

export async function setCurrentTenant(tenantId: string) {
  const tenantUser = await getCurrentTenant();
  if (!tenantUser) return fail("Nao autenticado", "UNAUTHENTICATED");

  const membership = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId: tenantUser.userId,
      },
    },
  });

  if (!membership?.active) {
    return fail("Tenant invalido para o usuario atual", "TENANT_NOT_ALLOWED");
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true as const };
}
