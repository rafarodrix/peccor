"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FarmSchema, type FarmInput } from "@/lib/validations/farm";
import { createFarm, updateFarm } from "@/server/actions/farms";
import type { Farm } from "@prisma/client";

interface Props {
  farm?: Farm;
  onSuccess?: () => void;
}

const OPERATIONS = [
  { value: "CRIA", label: "Cria" },
  { value: "RECRIA", label: "Recria" },
  { value: "ENGORDA", label: "Engorda" },
  { value: "CONFINAMENTO", label: "Confinamento" },
  { value: "CICLO_COMPLETO", label: "Ciclo Completo" },
];

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function FarmForm({ farm, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FarmInput>({
    resolver: zodResolver(FarmSchema),
    defaultValues: farm
      ? {
          name: farm.name,
          document: farm.document ?? "",
          stateReg: farm.stateReg ?? "",
          state: farm.state ?? "",
          city: farm.city ?? "",
          totalArea: farm.totalArea ? Number(farm.totalArea) : undefined,
          pastureArea: farm.pastureArea ? Number(farm.pastureArea) : undefined,
          operation: farm.operation,
        }
      : { operation: "CICLO_COMPLETO" },
  });

  function onSubmit(data: FarmInput) {
    startTransition(async () => {
      const result = farm
        ? await updateFarm(farm.id, data)
        : await createFarm(data);
      if (!result.error) onSuccess?.();
      else alert(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label>Nome da fazenda *</Label>
        <Input {...register("name")} placeholder="Fazenda Santa Maria" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>CNPJ / CPF</Label>
          <Input {...register("document")} placeholder="00.000.000/0001-00" />
        </div>
        <div className="grid gap-2">
          <Label>Inscrição estadual</Label>
          <Input {...register("stateReg")} placeholder="IE" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Estado</Label>
          <Select value={watch("state") ?? ""} onValueChange={(v) => setValue("state", v)}>
            <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>
              {BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Cidade</Label>
          <Input {...register("city")} placeholder="Uberlândia" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Área total (ha)</Label>
          <Input type="number" step="0.01" {...register("totalArea")} placeholder="1200" />
        </div>
        <div className="grid gap-2">
          <Label>Área de pastagem (ha)</Label>
          <Input type="number" step="0.01" {...register("pastureArea")} placeholder="900" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Tipo de operação *</Label>
        <Select value={watch("operation")} onValueChange={(v) => setValue("operation", v as FarmInput["operation"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {OPERATIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : farm ? "Atualizar" : "Criar fazenda"}
        </Button>
      </div>
    </form>
  );
}
