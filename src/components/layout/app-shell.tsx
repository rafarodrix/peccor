"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellContextValue = {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShell must be used within AppShell");
  }

  return context;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const value = useMemo<AppShellContextValue>(
    () => ({
      mobileNavOpen,
      openMobileNav: () => setMobileNavOpen(true),
      closeMobileNav: () => setMobileNavOpen(false),
      toggleMobileNav: () => setMobileNavOpen((current) => !current),
    }),
    [mobileNavOpen]
  );

  return (
    <AppShellContext.Provider value={value}>
      <div className="min-h-screen bg-background lg:flex">
        <Sidebar />

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={value.closeMobileNav} />
        )}

        <div
          className={[
            "fixed inset-y-0 left-0 z-50 w-[88vw] max-w-sm transition-transform duration-300 lg:hidden",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar mobile onNavigate={value.closeMobileNav} />
        </div>

        <main className="flex min-w-0 flex-1 flex-col lg:pl-64">{children}</main>
      </div>
    </AppShellContext.Provider>
  );
}
