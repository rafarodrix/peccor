import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, ShieldCheck, DollarSign } from "lucide-react";
import { requireTenant } from "@/server/services/tenant";
import { getSettingsPageData } from "@/server/queries/settings";

type TenantUserRow = Awaited<ReturnType<typeof getSettingsPageData>>["users"][number];

const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratuito", STARTER: "Starter", PRO: "Pro", ENTERPRISE: "Enterprise",
};
const ROLE_LABELS: Record<string, string> = {
  OWNER: "Proprietário", ADMIN: "Administrador", MANAGER: "Gerente",
  FINANCE: "Financeiro", VETERINARY: "Veterinário", OPERATOR: "Operador", VIEWER: "Visualizador",
};

export default async function ConfiguracoesPage() {
  const { tenant } = await requireTenant();
  const { subscription, users, farmCount, animalCount } = await getSettingsPageData(tenant.id);

  return (
    <>
      <Header title="Configurações" subtitle="Gerencie sua conta e preferências" />
      <div className="p-6 space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Organização</CardTitle>
            <CardDescription>Dados da sua organização no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">Nome</span>
              <span className="font-medium">{tenant.name}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">Identificador</span>
              <span className="font-mono text-sm">{tenant.slug}</span>
            </div>
            {tenant.document && (
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">CNPJ/CPF</span>
                <span className="font-medium">{tenant.document}</span>
              </div>
            )}
            {tenant.email && (
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">E-mail</span>
                <span className="font-medium">{tenant.email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plano SaaS</CardTitle>
            <CardDescription>Seu plano atual e uso do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    Plano {subscription ? PLAN_LABELS[subscription.plan] ?? subscription.plan : "Gratuito"}
                  </span>
                  <Badge variant={subscription?.active ? "success" : "secondary"}>
                    {subscription?.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {subscription?.renewsAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Renovação em {subscription.renewsAt.toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-2xl font-bold">{animalCount}</p>
                <p className="text-xs text-muted-foreground">animais ativos</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-2xl font-bold">{farmCount}</p>
                <p className="text-xs text-muted-foreground">fazendas ativas</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuração Financeira</CardTitle>
              <CardDescription>Gerencie o Plano de Contas e categorias contábeis</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/configuracoes/financeiro">
                  <DollarSign className="h-4 w-4" />
                  Plano de Contas
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estruture a árvore contábil e a classificação para DFC (Demonstrativo de Fluxo de Caixa) da sua organização agropecuária.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Usuários e Acessos</CardTitle>
              <CardDescription>Membros com acesso ao sistema</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/configuracoes/perfis">
                  <ShieldCheck className="h-4 w-4" />
                  Perfis
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/configuracoes/usuarios">
                  <Users className="h-4 w-4" />
                  Gerenciar
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {users.map((tu: TenantUserRow) => (
                <div key={tu.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{tu.user.name}</p>
                    <p className="text-xs text-muted-foreground">{tu.user.email}</p>
                  </div>
                  <Badge variant="outline">{ROLE_LABELS[tu.role] ?? tu.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
