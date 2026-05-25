"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AreaForm } from "@/components/forms/area-form";
import type { Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
}

export function AreaDialog({ farms }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nova Área
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova Área</DialogTitle>
        </DialogHeader>
        <AreaForm farms={farms} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
