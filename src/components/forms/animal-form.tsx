"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { CattleLot, Farm } from "@prisma/client";
import { createAnimal } from "@/server/actions/animals";
import { AnimalSchema, type AnimalInput } from "@/lib/validations/animal";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnimalInput>({
    resolver: zodResolver(AnimalSchema) as any,
    defaultValues: {
      farmId: farms[0]?.id,
      sex: "MALE",
      category: "BOI",
      entryDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedFarmId = watch("farmId");
  const filteredLots = lots.filter((lot) => lot.farmId === selectedFarmId);

  function onSubmit(data: AnimalInput) {
    startTransition(async () => {
      const result = await createAnimal(data);
      if (!result.error) onSuccess?.();
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Fazenda" required error={errors.farmId?.message}>
          <Select
            value={watch("farmId")}
            onValueChange={(value) => {
              setValue("farmId", value);
              setValue("lotId", null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Lote (opcional)" error={errors.lotId?.message}>
          <Select value={watch("lotId") ?? ""} onValueChange={(value) => setValue("lotId", value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Sem lote" />
            </SelectTrigger>
            <SelectContent>
              {filteredLots.map((lot) => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Sexo" required error={errors.sex?.message}>
          <Select value={watch("sex")} onValueChange={(value) => setValue("sex", value as AnimalInput["sex"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Macho</SelectItem>
              <SelectItem value="FEMALE">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Categoria" required error={errors.category?.message}>
          <Select
            value={watch("category")}
            onValueChange={(value) => setValue("category", value as AnimalInput["category"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Brinco / Tag" error={errors.tag?.message}>
          <Input {...register("tag")} placeholder="BR-0001" />
        </FormField>
        <FormField label="Raça" error={errors.breed?.message}>
          <Input {...register("breed")} placeholder="Nelore" />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Data de entrada" required error={errors.entryDate?.message}>
          <DatePicker value={watch("entryDate")} onChange={(event) => setValue("entryDate", event.target.value)} />
        </FormField>
        <FormField label="Peso entrada (kg)" error={errors.entryWeight?.message}>
          <Input type="number" step="0.1" {...register("entryWeight")} placeholder="280" />
        </FormField>
        <FormField label="Custo de compra (R$)" error={errors.purchaseCost?.message}>
          <Input type="number" step="0.01" {...register("purchaseCost")} placeholder="2800" />
        </FormField>
      </div>

      <FormField label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={3} />
      </FormField>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Cadastrar animal"}
        </Button>
      </div>
    </form>
  );
}
