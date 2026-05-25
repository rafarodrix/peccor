"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Nao foi possivel carregar esta tela</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro inesperado durante a leitura dos dados.
        </p>
        <Button className="mt-4" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
