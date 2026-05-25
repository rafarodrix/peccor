"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LotForm } from "@/components/forms/lot-form";
import type { Farm, FarmArea } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  areas: Pick<FarmArea, "id" | "name" | "farmId">[];
}

export function LotDialog({ farms, areas }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo Lote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Lote</DialogTitle>
        </DialogHeader>
        <LotForm farms={farms} areas={areas} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
