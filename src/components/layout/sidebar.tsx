"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Layers,
  Package,
  ShoppingCart,
  DollarSign,
  Weight,
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  Beef,
  MapPin,
  Users,
  ShieldCheck,
  FileText,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

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

const configItems = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/configuracoes/usuarios", label: "Usuários", icon: Users },
  { href: "/configuracoes/perfis", label: "Perfis de acesso", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
            <Beef className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">Peccor</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
          <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

      <div className="border-t p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
