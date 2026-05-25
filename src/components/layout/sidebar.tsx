"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Beef,
  Building2,
  DollarSign,
  FileText,
  Heart,
  Layers,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Upload,
  Weight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/fazendas", label: "Fazendas", icon: Building2 },
  { href: "/areas", label: "Áreas", icon: MapPin },
  { href: "/rebanho", label: "Rebanho", icon: Beef },
  { href: "/lotes", label: "Lotes", icon: Layers },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
  { href: "/vendas", label: "Vendas", icon: Package },
  { href: "/pesagens", label: "Pesagens", icon: Weight },
  { href: "/custos", label: "Custos", icon: DollarSign },
  { href: "/manejo-sanitario", label: "Manejo Sanitário", icon: Heart },
  { href: "/financeiro", label: "Financeiro", icon: TrendingUp },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/importar", label: "Importar", icon: Upload },
];

const configItems = [{ href: "/configuracoes", label: "Configurações", icon: Settings }];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

function SidebarBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600">
        <Beef className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-base font-bold text-foreground">Peccor</p>
        <p className="text-xs text-muted-foreground">Gestão pecuária</p>
      </div>
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto p-4">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div>
        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Administração
        </p>
        <ul className="space-y-1">
          {configItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="border-t p-4">
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          void signOut({ callbackUrl: "/login" });
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  );
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  if (mobile) {
    return (
      <aside className="flex h-full flex-col border-r bg-sidebar shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <SidebarBrand />
          <Button type="button" variant="ghost" size="icon" onClick={onNavigate} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarNav onNavigate={onNavigate} />
        <SidebarFooter onNavigate={onNavigate} />
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-full w-64 flex-col border-r bg-sidebar lg:flex">
      <div className="flex min-h-16 items-center border-b px-6">
        <SidebarBrand />
      </div>
      <SidebarNav />
      <SidebarFooter />
    </aside>
  );
}
