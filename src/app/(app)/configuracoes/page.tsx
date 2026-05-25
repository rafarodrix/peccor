import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ConfiguracoesPage() {
  return (
    <>
      <Header title="Configurações" subtitle="Gerencie sua conta e preferências" />
      <div className="p-6 space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Conta / Tenant</CardTitle>
            <CardDescription>Informações da sua organização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Nome da organização</Label>
              <Input defaultValue="Grupo Agro Rodrigues" />
            </div>
            <div className="grid gap-2">
              <Label>CNPJ / CPF</Label>
              <Input defaultValue="12.345.678/0001-90" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input defaultValue="contato@agrorodrigues.com.br" type="email" />
            </div>
            <Button>Salvar alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plano SaaS</CardTitle>
            <CardDescription>Seu plano atual e limites de uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Plano PRO</span>
                  <Badge variant="success">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Renovação em 30/06/2026</p>
              </div>
              <Button variant="outline">Alterar plano</Button>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-2xl font-bold">450</p>
                <p className="text-xs text-muted-foreground">de 2.000 animais</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">fazendas ativas</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Membros com acesso ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Rafael Rodrigues", email: "rafael@agrorodrigues.com.br", role: "OWNER" },
                { name: "Maria Souza", email: "maria@agrorodrigues.com.br", role: "MANAGER" },
                { name: "Dr. Carlos Vet", email: "carlos@vet.com.br", role: "VETERINARY" },
                { name: "João Silva", email: "joao@agrorodrigues.com.br", role: "OPERATOR" },
              ].map((user) => (
                <div key={user.email} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full">
              Convidar usuário
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
