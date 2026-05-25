"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WeighingSchema, type WeighingInput } from "@/lib/validations/weighing";
import { createWeighing } from "@/server/actions/weighings";
import type { Animal, CattleLot, Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
  animals: Pick<Animal, "id" | "tag" | "farmId">[];
  onSuccess?: () => void;
}

export function WeighingForm({ farms, lots, animals, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<WeighingInput>({
    resolver: zodResolver(WeighingSchema),
    defaultValues: {
      farmId: farms[0]?.id,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedFarmId = watch("farmId");
  const filteredLots = lots.filter((l) => l.farmId === selectedFarmId);
  const filteredAnimals = animals.filter((a) => a.farmId === selectedFarmId);

  function onSubmit(data: WeighingInput) {
    startTransition(async () => {
      const result = await createWeighing(data);
      if (!result.error) onSuccess?.();
      else alert(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label>Fazenda *</Label>
        <Select value={watch("farmId")} onValueChange={(v) => { setValue("farmId", v); setValue("lotId", null); setValue("animalId", null); }}>
          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.farmId && <p className="text-xs text-destructive">{errors.farmId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Lote (pesagem por lote)</Label>
          <Select value={watch("lotId") ?? ""} onValueChange={(v) => { setValue("lotId", v || null); setValue("animalId", null); }}>
            <SelectTrigger><SelectValue placeholder="Selecionar lote" /></SelectTrigger>
            <SelectContent>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Animal (pesagem individual)</Label>
          <Select value={watch("animalId") ?? ""} onValueChange={(v) => { setValue("animalId", v || null); setValue("lotId", null); }}>
            <SelectTrigger><SelectValue placeholder="Selecionar animal" /></SelectTrigger>
            <SelectContent>
              {filteredAnimals.map((a) => <SelectItem key={a.id} value={a.id}>{a.tag ?? a.id.slice(-6)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>Data *</Label>
          <Input type="date" {...register("date")} />
        </div>
        <div className="grid gap-2">
          <Label>Peso atual (kg) *</Label>
          <Input type="number" step="0.01" {...register("weight")} placeholder="320" />
          {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Responsável</Label>
          <Input {...register("responsible")} placeholder="João Silva" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar pesagem"}
        </Button>
      </div>
    </form>
  );
}
