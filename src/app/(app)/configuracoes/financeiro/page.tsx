import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Folder, FileText, Activity, ShieldAlert } from "lucide-react";
import { requireTenant } from "@/server/services/tenant";
import { getChartOfAccounts } from "@/server/queries/chart-of-accounts";
import { AccountDialog } from "./account-dialog";

export default async function ConfigFinanceiroPage() {
  const { tenant } = await requireTenant();
  const accounts = await getChartOfAccounts(tenant.id);

  // Mapeamentos visuais
  const typeLabels: Record<string, string> = {
    INFLOW: "Receita",
    OUTFLOW: "Despesa",
  };

  const dfcLabels: Record<string, string> = {
    OPERATIONAL: "Operacional (FCO)",
    INVESTMENT: "Investimento (FCI)",
    FINANCING: "Financiamento (FCF)",
  };

  // Funções de formatação de nível hierárquico baseada nos pontos do código
  const getIndentClass = (code: string) => {
    const depth = (code.match(/\./g) || []).length;
    if (depth === 1) return "pl-8";
    if (depth >= 2) return "pl-16";
    return "pl-0";
  };

  return (
    <>
      <Header
        title="Plano de Contas"
        subtitle="Gerencie a estrutura de categorias contábeis e fluxo de caixa"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/configuracoes">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <AccountDialog accounts={accounts} />
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-4xl">
        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Estrutura de Caixa & Contabilidade</CardTitle>
            <CardDescription>
              Este Plano de Contas serve como base estrutural para categorizar receitas e despesas. 
              As classificações DFC dividem os fluxos automaticamente nas três atividades básicas do mercado.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <div className="border rounded-lg p-3 bg-card">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                FCO (Operacional)
              </span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Custos recorrentes da lida: vacinas, ração, salários, energia e fretes.
              </span>
            </div>
            <div className="border rounded-lg p-3 bg-card">
              <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                FCI (Investimento)
              </span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Bens duradouros de longo prazo: aquisição de touros, tratores e terra.
              </span>
            </div>
            <div className="border rounded-lg p-3 bg-card">
              <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                FCF (Financiamento)
              </span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Linhas de crédito rural, custeio agrícola e juros de empréstimo.
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Árvore Contábil Ativa</CardTitle>
            <CardDescription>Visualização hierárquica das contas cadastradas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-t border-b">
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
    </>
  );
}
