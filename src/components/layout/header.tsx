"use client";

import type { ReactNode } from "react";
import { Menu, Search } from "lucide-react";
import { AlertsBell } from "@/components/layout/alerts-bell";
import { useAppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Alert } from "@/server/queries/alerts";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  alerts?: Alert[];
}

export function Header({ title, subtitle, actions, alerts = [] }: HeaderProps) {
  const { toggleMobileNav } = useAppShell();

  return (
    <header className="border-b bg-background px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-0.5 lg:hidden"
            onClick={toggleMobileNav}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}

          <div className="relative hidden min-w-0 lg:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="w-64 pl-8 xl:w-80" />
          </div>

          <div className="flex items-center justify-end gap-3">
            <AlertsBell alerts={alerts} />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-medium text-white">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
