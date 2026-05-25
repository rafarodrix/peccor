"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OnboardingStep = "no_farm" | "no_lot" | "no_weighing" | null;

interface OnboardingBannerProps {
  step: OnboardingStep;
}

interface StepConfig {
  label: string;
  completed: boolean;
}

function StepIndicator({ steps }: { steps: StepConfig[] }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
              s.completed
                ? "bg-green-600 text-white"
                : "border-2 border-muted-foreground text-muted-foreground"
            )}
          >
            {s.completed ? "✓" : i + 1}
          </div>
          <span
            className={cn(
              "text-sm",
              s.completed ? "text-green-600 font-medium" : "text-muted-foreground"
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-8",
                s.completed ? "bg-green-600" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function OnboardingBanner({ step }: OnboardingBannerProps) {
  if (step === null) return null;

  const steps: StepConfig[] = [
    { label: "Fazenda", completed: step !== "no_farm" },
    {
      label: "Lote",
      completed: step !== "no_farm" && step !== "no_lot",
    },
    {
      label: "Pesagem",
      completed: step !== "no_farm" && step !== "no_lot" && step !== "no_weighing",
    },
  ];

  const content: Record<
    Exclude<OnboardingStep, null>,
    { message: string; href: string; cta: string }
  > = {
    no_farm: {
      message: "Comece cadastrando sua primeira fazenda.",
      href: "/fazendas",
      cta: "Cadastrar Fazenda",
    },
    no_lot: {
      message: "Fazenda criada! Agora crie um lote de gado.",
      href: "/lotes",
      cta: "Criar Lote",
    },
    no_weighing: {
      message:
        "Lote criado! Registre a primeira pesagem para começar a rastrear o GMD.",
      href: "/pesagens",
      cta: "Registrar Pesagem",
    },
  };

  const { message, href, cta } = content[step];

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Bem-vindo ao Peccor! 👋</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            <StepIndicator steps={steps} />
          </div>
          <div className="shrink-0">
            <Button asChild>
              <Link href={href}>{cta}</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
