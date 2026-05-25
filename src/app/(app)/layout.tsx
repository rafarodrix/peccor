import type { ReactNode } from "react";
import { cache } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentTenant } from "@/server/services/tenant";
import { getAlerts } from "@/server/queries/alerts";
import type { Alert } from "@/server/queries/alerts";

// cache() deduplicates this call within a single request so individual page
// server components can call getLayoutAlerts() to get alerts without an extra
// DB round-trip.
export const getLayoutAlerts = cache(async (): Promise<Alert[]> => {
  const tenantUser = await getCurrentTenant();
  if (!tenantUser) return [];
  return getAlerts(tenantUser.tenantId);
});

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Warm the cache so that any page calling getLayoutAlerts() in the same
  // request gets the already-fetched result.
  await getLayoutAlerts();

  return <AppShell>{children}</AppShell>;
}
