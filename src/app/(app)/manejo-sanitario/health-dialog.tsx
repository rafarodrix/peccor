"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HealthForm } from "@/components/forms/health-form";
import type { Animal } from "@prisma/client";

interface Props {
  animals: Pick<Animal, "id" | "tag" | "farmId">[];
}

export function HealthDialog({ animals }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Registrar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Evento Sanitário</DialogTitle>
        </DialogHeader>
        <HealthForm animals={animals} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
