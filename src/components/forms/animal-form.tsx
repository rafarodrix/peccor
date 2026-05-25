"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnimalSchema, type AnimalInput } from "@/lib/validations/animal";
import { createAnimal } from "@/server/actions/animals";
import type { CattleLot, Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: "BEZERRO", label: "Bezerro" },
  { value: "BEZERRA", label: "Bezerra" },
  { value: "GARROTE", label: "Garrote" },
  { value: "NOVILHA", label: "Novilha" },
  { value: "NOVILHO", label: "Novilho" },
  { value: "VACA", label: "Vaca" },
  { value: "BOI", label: "Boi" },
  { value: "TOURO", label: "Touro" },
];

export function AnimalForm({ farms, lots, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AnimalInput>({
    resolver: zodResolver(AnimalSchema) as any,
    defaultValues: {
      farmId: farms[0]?.id,
      sex: "MALE",
      category: "BOI",
      entryDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedFarmId = watch("farmId");
  const filteredLots = lots.filter((l) => l.farmId === selectedFarmId);

  function onSubmit(data: AnimalInput) {
    startTransition(async () => {
      const result = await createAnimal(data);
      if (!result.error) onSuccess?.();
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Fazenda" required error={errors.farmId?.message}>
          <Select value={watch("farmId")} onValueChange={(v) => { setValue("farmId", v); setValue("lotId", null); }}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Lote (opcional)" error={errors.lotId?.message}>
          <Select value={watch("lotId") ?? ""} onValueChange={(v) => setValue("lotId", v || null)}>
            <SelectTrigger><SelectValue placeholder="Sem lote" /></SelectTrigger>
            <SelectContent>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Sexo" required error={errors.sex?.message}>
          <Select value={watch("sex")} onValueChange={(v) => setValue("sex", v as AnimalInput["sex"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Macho</SelectItem>
              <SelectItem value="FEMALE">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Categoria" required error={errors.category?.message}>
          <Select value={watch("category")} onValueChange={(v) => setValue("category", v as AnimalInput["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Brinco / Tag" error={errors.tag?.message}>
          <Input {...register("tag")} placeholder="BR-0001" />
        </FormField>
        <FormField label="Raça" error={errors.breed?.message}>
          <Input {...register("breed")} placeholder="Nelore" />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Data de entrada" required error={errors.entryDate?.message}>
          <DatePicker value={watch("entryDate")} onChange={(e) => setValue("entryDate", e.target.value)} />
        </FormField>
        <FormField label="Peso entrada (kg)" error={errors.entryWeight?.message}>
          <Input type="number" step="0.1" {...register("entryWeight")} placeholder="280" />
        </FormField>
        <FormField label="Custo de compra (R$)" error={errors.purchaseCost?.message}>
          <Input type="number" step="0.01" {...register("purchaseCost")} placeholder="2800" />
        </FormField>
      </div>

      <FormField label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={2} />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Cadastrar animal"}
        </Button>
      </div>
    </form>
  );
}
