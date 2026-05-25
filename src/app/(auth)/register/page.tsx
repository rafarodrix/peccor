"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Beef } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/server/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      setError("");
      const result = await registerUser({
        orgName: form.get("orgName"),
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Auto-login after registration
      await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });

      router.push("/dashboard");
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 mb-3">
            <Beef className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Peccor</h1>
          <p className="text-sm text-muted-foreground">Comece gratuitamente</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Teste grátis por 14 dias, sem cartão</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nome da organização / fazenda</Label>
                <Input id="orgName" name="orgName" placeholder="Ex: Grupo Agro Rodrigues" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" name="name" placeholder="Rafael Rodrigues" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Criando conta..." : "Criar conta grátis"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
