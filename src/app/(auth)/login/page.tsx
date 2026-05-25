import Link from "next/link";
import { Beef } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 mb-3">
            <Beef className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Peccor</h1>
          <p className="text-sm text-muted-foreground">Gestão pecuária inteligente</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Acesse sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                Criar conta gratuita
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
