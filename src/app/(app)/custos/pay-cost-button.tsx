"use client";

import { useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { payCost } from "@/server/actions/costs";

export function PayCostButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(async () => { await payCost(id); })}
    >
      <CheckCircle className="h-4 w-4 mr-1" />
      {pending ? "..." : "Pagar"}
    </Button>
  );
}
