"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WeighingForm } from "@/components/forms/weighing-form";
import type { Animal, CattleLot, Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
  animals: Pick<Animal, "id" | "tag" | "farmId">[];
}

export function WeighingDialog({ farms, lots, animals }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Registrar Pesagem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar Pesagem</DialogTitle>
        </DialogHeader>
        <WeighingForm farms={farms} lots={lots} animals={animals} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
