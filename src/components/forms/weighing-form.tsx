"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
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
    resolver: zodResolver(WeighingSchema) as any,
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
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Fazenda" required error={errors.farmId?.message}>
        <Select value={watch("farmId")} onValueChange={(v) => { setValue("farmId", v); setValue("lotId", null); setValue("animalId", null); }}>
          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Lote (pesagem por lote)" error={errors.lotId?.message}>
          <Select value={watch("lotId") ?? ""} onValueChange={(v) => { setValue("lotId", v || null); setValue("animalId", null); }}>
            <SelectTrigger><SelectValue placeholder="Selecionar lote" /></SelectTrigger>
            <SelectContent>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Animal (pesagem individual)" error={errors.animalId?.message}>
          <Select value={watch("animalId") ?? ""} onValueChange={(v) => { setValue("animalId", v || null); setValue("lotId", null); }}>
            <SelectTrigger><SelectValue placeholder="Selecionar animal" /></SelectTrigger>
            <SelectContent>
              {filteredAnimals.map((a) => <SelectItem key={a.id} value={a.id}>{a.tag ?? a.id.slice(-6)}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Data" required error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FormField>
        <FormField label="Peso atual (kg)" required error={errors.weight?.message}>
          <Input type="number" step="0.01" {...register("weight")} placeholder="320" />
        </FormField>
        <FormField label="Responsável" error={errors.responsible?.message}>
          <Input {...register("responsible")} placeholder="João Silva" />
        </FormField>
      </div>

      <FormField label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={2} />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar pesagem"}
        </Button>
      </div>
    </form>
  );
}
