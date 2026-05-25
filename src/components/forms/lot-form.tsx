"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { CattleLot, Farm, FarmArea } from "@prisma/client";
import { createLot, updateLot } from "@/server/actions/lots";
import { LotSchema, type LotInput } from "@/lib/validations/lot";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  areas: Pick<FarmArea, "id" | "name" | "farmId">[];
  lot?: CattleLot;
  onSuccess?: () => void;
}

const PHASES = [
  { value: "CRIA", label: "Cria" },
  { value: "RECRIA", label: "Recria" },
  { value: "ENGORDA", label: "Engorda" },
  { value: "TERMINACAO", label: "Terminação" },
  { value: "CONFINAMENTO", label: "Confinamento" },
];

export function LotForm({ farms, areas, lot, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LotInput>({
    resolver: zodResolver(LotSchema) as any,
    defaultValues: lot
      ? {
          farmId: lot.farmId,
          areaId: lot.areaId ?? "",
          code: lot.code,
          description: lot.description ?? "",
          phase: lot.phase,
          startDate: lot.startDate.toISOString().split("T")[0],
          initialQuantity: lot.initialQuantity,
          initialAvgWeight: lot.initialAvgWeight ? Number(lot.initialAvgWeight) : undefined,
        }
      : {
          farmId: farms[0]?.id,
          phase: "ENGORDA",
          startDate: new Date().toISOString().split("T")[0],
          initialQuantity: 0,
        },
  });

  const selectedFarmId = watch("farmId");
  const filteredAreas = areas.filter((area) => area.farmId === selectedFarmId);

  function onSubmit(data: LotInput) {
    startTransition(async () => {
      const result = lot ? await updateLot(lot.id, data) : await createLot(data);
      if (!result.error) {
        toast.success(lot ? "Lote atualizado com sucesso!" : "Lote criado com sucesso!");
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
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
              setValue("areaId", "");
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

        <FormField label="Área / Pasto" error={errors.areaId?.message}>
          <Select
            value={watch("areaId") || "none"}
            onValueChange={(value) => setValue("areaId", value === "none" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Opcional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma (sem pasto)</SelectItem>
              {filteredAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Código do lote" required error={errors.code?.message}>
          <Input {...register("code")} placeholder="ENGORDA-2026-01" />
        </FormField>

        <FormField label="Fase" required error={errors.phase?.message}>
          <Select value={watch("phase")} onValueChange={(value) => setValue("phase", value as LotInput["phase"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHASES.map((phase) => (
                <SelectItem key={phase.value} value={phase.value}>
                  {phase.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Descrição" error={errors.description?.message}>
        <Textarea {...register("description")} placeholder="Garrotes Nelore de recria" rows={3} />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Data de início" required error={errors.startDate?.message}>
          <DatePicker value={watch("startDate")} onChange={(event) => setValue("startDate", event.target.value)} />
        </FormField>

        <FormField label="Qtd. inicial" error={errors.initialQuantity?.message}>
          <Input type="number" {...register("initialQuantity")} placeholder="0" />
        </FormField>

        <FormField label="Peso médio entrada (kg)" error={errors.initialAvgWeight?.message}>
          <Input type="number" step="0.01" {...register("initialAvgWeight")} placeholder="280" />
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : lot ? "Atualizar" : "Criar lote"}
        </Button>
      </div>
    </form>
  );
}
