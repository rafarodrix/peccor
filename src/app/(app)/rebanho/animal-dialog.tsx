"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimalForm } from "@/components/forms/animal-form";
import type { CattleLot, Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
}

export function AnimalDialog({ farms, lots }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo Animal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar Animal</DialogTitle>
        </DialogHeader>
        <AnimalForm farms={farms} lots={lots} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
