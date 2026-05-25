"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaSchema, type AreaInput } from "@/lib/validations/farm";
import { createArea, updateArea } from "@/server/actions/farms";
import type { Farm, FarmArea } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  area?: FarmArea;
  defaultFarmId?: string;
  onSuccess?: () => void;
}

const AREA_TYPES = [
  { value: "PASTO", label: "Pasto" },
  { value: "CURRAL", label: "Curral" },
  { value: "PIQUETE", label: "Piquete" },
  { value: "BAIA", label: "Baia" },
  { value: "CONFINAMENTO", label: "Confinamento" },
  { value: "OUTRO", label: "Outro" },
];

export function AreaForm({ farms, area, defaultFarmId, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AreaInput>({
    resolver: zodResolver(AreaSchema) as any,
    defaultValues: area
      ? { farmId: area.farmId, name: area.name, type: area.type, capacityHead: area.capacityHead ?? undefined }
      : { farmId: defaultFarmId ?? farms[0]?.id, type: "PASTO" },
  });

  function onSubmit(data: AreaInput) {
    startTransition(async () => {
      const result = area ? await updateArea(area.id, data) : await createArea(data);
      if (!result.error) onSuccess?.();
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Fazenda" required error={errors.farmId?.message}>
        <Select value={watch("farmId")} onValueChange={(v) => setValue("farmId", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Nome da área" required error={errors.name?.message}>
        <Input {...register("name")} placeholder="Pasto 1" />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo" required error={errors.type?.message}>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as AreaInput["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {AREA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Capacidade (cabeças)" error={errors.capacityHead?.message}>
          <Input type="number" {...register("capacityHead")} placeholder="200" />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : area ? "Atualizar" : "Criar área"}
        </Button>
      </div>
    </form>
  );
}
