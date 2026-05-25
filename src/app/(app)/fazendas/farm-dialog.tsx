"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FarmForm } from "@/components/forms/farm-form";

export function FarmDialog({ label = "Nova Fazenda" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Fazenda</DialogTitle>
        </DialogHeader>
        <FarmForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
