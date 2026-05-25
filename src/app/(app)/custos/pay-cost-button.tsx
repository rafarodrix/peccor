"use client";

import { useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { payCost } from "@/server/actions/costs";
import { cn } from "@/lib/utils";

export function PayCostButton({ id, className }: { id: string; className?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(className)}
      disabled={pending}
      onClick={() => startTransition(async () => { await payCost(id); })}
    >
      <CheckCircle className="h-4 w-4 mr-1" />
      {pending ? "..." : "Pagar"}
    </Button>
  );
}
