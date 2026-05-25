"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    resolver: zodResolver(AnimalSchema),
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
      else alert(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Fazenda *</Label>
          <Select value={watch("farmId")} onValueChange={(v) => { setValue("farmId", v); setValue("lotId", null); }}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.farmId && <p className="text-xs text-destructive">{errors.farmId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Lote (opcional)</Label>
          <Select value={watch("lotId") ?? ""} onValueChange={(v) => setValue("lotId", v || null)}>
            <SelectTrigger><SelectValue placeholder="Sem lote" /></SelectTrigger>
            <SelectContent>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Sexo *</Label>
          <Select value={watch("sex")} onValueChange={(v) => setValue("sex", v as AnimalInput["sex"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Macho</SelectItem>
              <SelectItem value="FEMALE">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Categoria *</Label>
          <Select value={watch("category")} onValueChange={(v) => setValue("category", v as AnimalInput["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Brinco / Tag</Label>
          <Input {...register("tag")} placeholder="BR-0001" />
        </div>
        <div className="grid gap-2">
          <Label>Raça</Label>
          <Input {...register("breed")} placeholder="Nelore" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>Data de entrada *</Label>
          <Input type="date" {...register("entryDate")} />
          {errors.entryDate && <p className="text-xs text-destructive">{errors.entryDate.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Peso entrada (kg)</Label>
          <Input type="number" step="0.1" {...register("entryWeight")} placeholder="280" />
        </div>
        <div className="grid gap-2">
          <Label>Custo de compra (R$)</Label>
          <Input type="number" step="0.01" {...register("purchaseCost")} placeholder="2800" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Cadastrar animal"}
        </Button>
      </div>
    </form>
  );
}
