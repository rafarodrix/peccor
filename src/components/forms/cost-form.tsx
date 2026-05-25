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
import { Checkbox } from "@/components/ui/checkbox";
import { CostSchema, type CostInput } from "@/lib/validations/cost";
import { createCost } from "@/server/actions/costs";
import type { CattleLot, Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: "FUNCIONARIO", label: "Funcionário" },
  { value: "ENERGIA", label: "Energia" },
  { value: "ARRENDAMENTO", label: "Arrendamento" },
  { value: "RACAO", label: "Ração" },
  { value: "SAL_MINERAL", label: "Sal Mineral" },
  { value: "VACINA", label: "Vacina" },
  { value: "MEDICAMENTO", label: "Medicamento" },
  { value: "FRETE", label: "Frete" },
  { value: "MANUTENCAO", label: "Manutenção" },
  { value: "COMISSAO", label: "Comissão" },
  { value: "COMBUSTIVEL", label: "Combustível" },
  { value: "VETERINARIO", label: "Veterinário" },
  { value: "OUTROS", label: "Outros" },
];

export function CostForm({ farms, lots, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CostInput>({
    resolver: zodResolver(CostSchema) as any,
    defaultValues: {
      farmId: farms[0]?.id,
      type: "VARIABLE",
      category: "OUTROS",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
    },
  });

  const selectedFarmId = watch("farmId");
  const filteredLots = lots.filter((l) => l.farmId === selectedFarmId);

  function onSubmit(data: CostInput) {
    startTransition(async () => {
      const result = await createCost(data);
      if (!result.error) onSuccess?.();
      else toast.error(result.error);
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
            <SelectTrigger><SelectValue placeholder="Nenhum (fazenda)" /></SelectTrigger>
            <SelectContent>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Tipo *</Label>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as CostInput["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">Fixo</SelectItem>
              <SelectItem value="VARIABLE">Variável</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Categoria *</Label>
          <Select value={watch("category")} onValueChange={(v) => setValue("category", v as CostInput["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descrição *</Label>
        <Input {...register("description")} placeholder="Salário - João Silva" />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>Valor (R$) *</Label>
          <Input type="number" step="0.01" {...register("amount")} placeholder="0,00" />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Data *</Label>
          <Input type="date" {...register("date")} />
        </div>
        <div className="grid gap-2">
          <Label>Vencimento</Label>
          <Input type="date" {...register("dueDate")} />
        </div>
      </div>

      <Checkbox
        id="recurring"
        label="Custo recorrente (mensal)"
        checked={watch("isRecurring")}
        onChange={(e) => setValue("isRecurring", e.target.checked)}
      />

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Lançar custo"}
        </Button>
      </div>
    </form>
  );
}
