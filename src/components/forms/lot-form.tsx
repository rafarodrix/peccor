"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LotSchema, type LotInput } from "@/lib/validations/lot";
import { createLot, updateLot } from "@/server/actions/lots";
import type { CattleLot, Farm, FarmArea } from "@prisma/client";

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

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LotInput>({
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
  const filteredAreas = areas.filter((a) => a.farmId === selectedFarmId);

  function onSubmit(data: LotInput) {
    startTransition(async () => {
      const result = lot ? await updateLot(lot.id, data) : await createLot(data);
      if (!result.error) onSuccess?.();
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Fazenda *</Label>
          <Select value={watch("farmId")} onValueChange={(v) => { setValue("farmId", v); setValue("areaId", ""); }}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.farmId && <p className="text-xs text-destructive">{errors.farmId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Área / Pasto</Label>
          <Select value={watch("areaId") ?? ""} onValueChange={(v) => setValue("areaId", v || null)}>
            <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
            <SelectContent>
              {filteredAreas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Código do lote *</Label>
          <Input {...register("code")} placeholder="ENGORDA-2026-01" />
          {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Fase *</Label>
          <Select value={watch("phase")} onValueChange={(v) => setValue("phase", v as LotInput["phase"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PHASES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descrição</Label>
        <Textarea {...register("description")} placeholder="Garrotes Nelore" rows={2} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>Data de início *</Label>
          <Input type="date" {...register("startDate")} />
        </div>
        <div className="grid gap-2">
          <Label>Qtd. inicial</Label>
          <Input type="number" {...register("initialQuantity")} placeholder="0" />
        </div>
        <div className="grid gap-2">
          <Label>Peso médio entrada (kg)</Label>
          <Input type="number" step="0.01" {...register("initialAvgWeight")} placeholder="280" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : lot ? "Atualizar" : "Criar lote"}
        </Button>
      </div>
    </form>
  );
}
