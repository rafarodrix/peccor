import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  Settings, Users, ShieldCheck, DollarSign, Folder, FileText, Check, X 
} from "lucide-react";
import { requireTenant } from "@/server/services/tenant";
import { getSettingsPageData } from "@/server/queries/settings";
import { getChartOfAccounts } from "@/server/queries/chart-of-accounts";
import { AccountDialog } from "./financeiro/account-dialog";
import { UserManagementClient } from "./usuarios/user-management-client";
import { getUsers } from "@/server/actions/users";
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  hasPermission,
} from "@/lib/permissions";
import type { TenantRole } from "@prisma/client";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratuito", STARTER: "Starter", PRO: "Pro", ENTERPRISE: "Enterprise",
};

const ROLES: TenantRole[] = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "FINANCE",
  "VETERINARY",
  "OPERATOR",
  "VIEWER",
];

const ROLE_COLORS: Record<TenantRole, string> = {
  OWNER: "text-purple-700 bg-purple-50",
  ADMIN: "text-blue-700 bg-blue-50",
  MANAGER: "text-green-700 bg-green-50",
  FINANCE: "text-yellow-700 bg-yellow-50",
  VETERINARY: "text-teal-700 bg-teal-50",
  OPERATOR: "text-orange-700 bg-orange-50",
  VIEWER: "text-gray-700 bg-gray-50",
  MEMBER: "text-gray-600 bg-gray-50",
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ConfiguracoesPage({ searchParams }: Props) {
  const { tenant } = await requireTenant();
  const params = await searchParams;
  const activeTab = params.tab ?? "organizacao";

  // Carrega dados em paralelo para todas as abas
  const [settingsData, accounts, activeUsers] = await Promise.all([
    getSettingsPageData(tenant.id),
    getChartOfAccounts(tenant.id),
    getUsers(),
  ]);

  const { subscription, users, farmCount, animalCount } = settingsData;

  // Mapeamentos do Plano de Contas
  const typeLabels: Record<string, string> = {
    INFLOW: "Receita",
    OUTFLOW: "Despesa",
  };

  const dfcLabels: Record<string, string> = {
    OPERATIONAL: "Operacional (FCO)",
    INVESTMENT: "Investimento (FCI)",
    FINANCING: "Financiamento (FCF)",
  };

  const getIndentClass = (code: string) => {
    const depth = (code.match(/\./g) || []).length;
    if (depth === 1) return "pl-8";
    if (depth >= 2) return "pl-16";
    return "pl-0";
  };

  return (
    <>
      <Header title="Configurações" subtitle="Gerencie as preferências e controle da sua fazenda" />
      
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Abas de Navegação Premium das Configurações */}
        <div className="flex border-b pb-px gap-4">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 font-semibold text-sm -mb-px transition-all ${
              activeTab === "organizacao"
                ? "border-green-600 text-green-700 bg-green-50/30 dark:bg-green-950/10 dark:text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            asChild
          >
            <Link href="/configuracoes?tab=organizacao">
              <Settings className="h-4 w-4 mr-2" />
              Organização
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 font-semibold text-sm -mb-px transition-all ${
              activeTab === "usuarios"
                ? "border-green-600 text-green-700 bg-green-50/30 dark:bg-green-950/10 dark:text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            asChild
          >
            <Link href="/configuracoes?tab=usuarios">
              <Users className="h-4 w-4 mr-2" />
              Usuários ({users.length})
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 font-semibold text-sm -mb-px transition-all ${
              activeTab === "perfis"
                ? "border-green-600 text-green-700 bg-green-50/30 dark:bg-green-950/10 dark:text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            asChild
          >
            <Link href="/configuracoes?tab=perfis">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Perfis de Acesso
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 font-semibold text-sm -mb-px transition-all ${
              activeTab === "financeiro"
                ? "border-green-600 text-green-700 bg-green-50/30 dark:bg-green-950/10 dark:text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            asChild
          >
            <Link href="/configuracoes?tab=financeiro">
              <DollarSign className="h-4 w-4 mr-2" />
              Plano de Contas
            </Link>
          </Button>
        </div>

        {/* ─── ABA 1: ORGANIZAÇÃO & ASSINATURA ─────────────────────────────────── */}
        {activeTab === "organizacao" && (
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Dados Gerais</CardTitle>
                <CardDescription>Informações cadastrais da sua empresa ou fazenda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b pb-2 last:border-none last:pb-0">
                  <span className="text-sm text-muted-foreground">Nome da Organização</span>
                  <span className="font-semibold">{tenant.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b pb-2 last:border-none last:pb-0">
                  <span className="text-sm text-muted-foreground">Identificador (Slug)</span>
                  <span className="font-mono text-sm">{tenant.slug}</span>
                </div>
                {tenant.document && (
                  <div className="flex items-center justify-between py-1 border-b pb-2 last:border-none last:pb-0">
                    <span className="text-sm text-muted-foreground">CNPJ/CPF</span>
                    <span className="font-medium">{tenant.document}</span>
                  </div>
                )}
                {tenant.email && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">E-mail para contato</span>
                    <span className="font-medium">{tenant.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plano SaaS & Limites</CardTitle>
                <CardDescription>Status da sua assinatura e uso ativo de recursos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        Plano {subscription ? PLAN_LABELS[subscription.plan] ?? subscription.plan : "Gratuito"}
                      </span>
                      <Badge variant={subscription?.active ? "success" : "secondary"}>
                        {subscription?.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {subscription?.renewsAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Próxima renovação em {subscription.renewsAt.toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-2xl font-bold">{animalCount}</p>
                    <p className="text-xs text-muted-foreground">animais cadastrados</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-2xl font-bold">{farmCount}</p>
                    <p className="text-xs text-muted-foreground">fazendas ativas</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-xs text-muted-foreground">membros convidados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── ABA 2: USUÁRIOS E CONVITES ───────────────────────────────────────── */}
        {activeTab === "usuarios" && (
          <div className="space-y-6">
            <UserManagementClient users={activeUsers} />
          </div>
        )}

        {/* ─── ABA 3: PERFIS E MATRIZ DE PERMISSÕES ──────────────────────────────── */}
        {activeTab === "perfis" && (
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ROLES.map((role) => (
                <Card key={role}>
                  <CardHeader className="pb-2">
                    <div className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[role]}`}>
                      {ROLE_LABELS[role]}
                    </div>
                    <CardDescription className="text-xs mt-2 min-h-8">
                      {ROLE_DESCRIPTIONS[role]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {PERMISSION_GROUPS.reduce(
                        (count, group) =>
                          count +
                          group.permissions.filter((p) => hasPermission(role, p)).length,
                        0
                      )}{" "}
                      permissões associadas
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {PERMISSION_GROUPS.map((group) => (
              <Card key={group.label}>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-semibold">{group.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-52 pl-6">Funcionalidade / Ação</TableHead>
                          {ROLES.map((role) => (
                            <TableHead key={role} className="text-center text-xs">
                              <span className={`inline-flex rounded-full px-2 py-0.5 ${ROLE_COLORS[role]}`}>
                                {ROLE_LABELS[role]}
                              </span>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.permissions.map((permission) => (
                          <TableRow key={permission}>
                            <TableCell className="text-sm pl-6 font-medium">
                              {PERMISSION_LABELS[permission]}
                            </TableCell>
                            {ROLES.map((role) => (
                              <TableCell key={role} className="text-center">
                                {hasPermission(role, permission) ? (
                                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ─── ABA 4: CONFIGURAÇÃO FINANCEIRA (PLANO DE CONTAS) ─────────────────── */}
        {activeTab === "financeiro" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Estrutura de Caixa & Contabilidade</CardTitle>
                  <CardDescription>
                    O Plano de Contas serve como base para categorizar custos, compras e vendas.
                  </CardDescription>
                </div>
                <AccountDialog accounts={accounts} />
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
                <div className="border rounded-lg p-3 bg-card shadow-sm">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                    FCO (Operacional)
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Custos diários: nutrição animal, vacinas, salários, encargos, energia e fretes.
                  </span>
                </div>
                <div className="border rounded-lg p-3 bg-card shadow-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                    FCI (Investimento)
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Ativos de longo prazo: aquisição de reprodutores, cercas, tratores e terra.
                  </span>
                </div>
                <div className="border rounded-lg p-3 bg-card shadow-sm">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                    FCF (Financiamento)
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    Capital de giro e amortizações: linhas de custeio rural e juros bancários.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Árvore Contábil Ativa</CardTitle>
                <CardDescription>Estrutura hierárquica das contas cadastradas</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <div className="divide-y">
                  {accounts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Nenhuma conta cadastrada. Execute o seed do banco de dados para iniciar o Plano Contábil.
                    </div>
                  ) : (
                    accounts.map((acc) => {
                      const isParent = accounts.some((a) => a.parentId === acc.id);
                      const isRoot = !acc.parentId;
                      const indent = getIndentClass(acc.code);

                      return (
                        <div
                          key={acc.id}
                          className={`flex items-center justify-between py-3.5 pr-6 transition-colors hover:bg-muted/10 ${indent}`}
                        >
                          <div className="flex items-center gap-3">
                            {isParent || isRoot ? (
                              <Folder className="h-4.5 w-4.5 text-primary/80 fill-primary/10 shrink-0" />
                            ) : (
                              <FileText className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0" />
                            )}
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono text-xs font-semibold text-muted-foreground select-all">
                                {acc.code}
                              </span>
                              <span className={`text-sm ${isRoot ? "font-semibold" : "font-medium"}`}>
                                {acc.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={acc.type === "INFLOW" ? "success" : "secondary"}
                              className="text-[10px] uppercase font-bold"
                            >
                              {typeLabels[acc.type] ?? acc.type}
                            </Badge>
                            {acc.dfcCategory && (
                              <Badge
                                variant={
                                  acc.dfcCategory === "OPERATIONAL"
                                    ? "outline"
                                    : acc.dfcCategory === "INVESTMENT"
                                    ? "default"
                                    : "destructive"
                                }
                                className={`text-[10px] font-bold ${
                                  acc.dfcCategory === "OPERATIONAL"
                                    ? "border-emerald-600/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400"
                                    : acc.dfcCategory === "INVESTMENT"
                                    ? "bg-blue-600 text-white hover:bg-blue-600"
                                    : "bg-amber-600 text-white hover:bg-amber-600"
                                }`}
                              >
                                {dfcLabels[acc.dfcCategory] ?? acc.dfcCategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
