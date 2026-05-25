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
      if (!result.error) {
        toast.success("Manejo sanitário registrado com sucesso!");
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Animal" required error={errors.animalId?.message}>
          <Select value={watch("animalId") ?? ""} onValueChange={(v) => setValue("animalId", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {animals.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.tag ?? a.id.slice(-8)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Tipo de Evento" required error={errors.type?.message}>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as HealthEventInput["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Data do Evento" required error={errors.date?.message}>
          <DatePicker value={watch("date")} onChange={(e) => setValue("date", e.target.value)} />
        </FormField>

        <FormField label="Responsável" error={errors.responsible?.message}>
          <Input {...register("responsible")} placeholder="Dr. Carlos Vet" />
        </FormField>
      </div>

      <FormField label="Descrição" required error={errors.description?.message}>
        <Input {...register("description")} placeholder="ex: Vacinação antiaftosa da recria" />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Produto" error={errors.productName?.message}>
          <Input {...register("productName")} placeholder="Aftovax" />
        </FormField>
        <FormField label="Dose" error={errors.dosage?.message}>
          <Input {...register("dosage")} placeholder="2ml" />
        </FormField>
        <FormField label="Carência (dias)" error={errors.withdrawalDays?.message}>
          <Input type="number" {...register("withdrawalDays")} placeholder="0" />
        </FormField>
      </div>

      <FormField label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={2} placeholder="Sintomas, reações ou anotações..." />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar evento"}
        </Button>
      </div>
    </form>
  );
}
