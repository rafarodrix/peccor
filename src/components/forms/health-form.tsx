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
import { HealthEventSchema, type HealthEventInput } from "@/lib/validations/health";
import { createHealthEvent } from "@/server/actions/health";
import type { Animal } from "@prisma/client";

interface Props {
  animals: Pick<Animal, "id" | "tag" | "farmId">[];
  onSuccess?: () => void;
}

const EVENT_TYPES = [
  { value: "VACINA", label: "Vacina" },
  { value: "VERMIFUGO", label: "Vermífugo" },
  { value: "MEDICAMENTO", label: "Medicamento" },
  { value: "DOENCA", label: "Doença" },
  { value: "MORTE", label: "Morte" },
  { value: "OUTRO", label: "Outro" },
];

export function HealthForm({ animals, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<HealthEventInput>({
    resolver: zodResolver(HealthEventSchema) as any,
    defaultValues: {
      type: "VACINA",
      date: new Date().toISOString().split("T")[0],
      withdrawalDays: 0,
    },
  });

  function onSubmit(data: HealthEventInput) {
    startTransition(async () => {
      const result = await createHealthEvent(data);
      if (!result.error) onSuccess?.();
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Animal *</Label>
          <Select value={watch("animalId") ?? ""} onValueChange={(v) => setValue("animalId", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {animals.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.tag ?? a.id.slice(-8)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.animalId && <p className="text-xs text-destructive">{errors.animalId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Tipo *</Label>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as HealthEventInput["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Data *</Label>
          <Input type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Responsável</Label>
          <Input {...register("responsible")} placeholder="Dr. Carlos Vet" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descrição *</Label>
        <Input {...register("description")} placeholder="Vacinação antiaftosa" />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>Produto</Label>
          <Input {...register("productName")} placeholder="Aftovax" />
        </div>
        <div className="grid gap-2">
          <Label>Dose</Label>
          <Input {...register("dosage")} placeholder="2ml" />
        </div>
        <div className="grid gap-2">
          <Label>Carência (dias)</Label>
          <Input type="number" {...register("withdrawalDays")} placeholder="0" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar evento"}
        </Button>
      </div>
    </form>
  );
}
