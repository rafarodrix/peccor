"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertsBell } from "@/components/layout/alerts-bell";
import type { Alert } from "@/server/queries/alerts";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  alerts?: Alert[];
}

export function Header({ title, subtitle, actions, alerts = [] }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="w-64 pl-8" />
        </div>
        <AlertsBell alerts={alerts} />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-medium text-white">
          U
        </div>
      </div>
    </header>
  );
}
