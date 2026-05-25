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
import { Checkbox } from "@/components/ui/checkbox";
import { CostSchema, type CostInput } from "@/lib/validations/cost";
import { createCost } from "@/server/actions/costs";
import type { CattleLot, Farm, ChartOfAccount } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
  chartOfAccounts: Pick<ChartOfAccount, "id" | "code" | "name" | "type">[];
  onSuccess?: () => void;
}

// Mapeador inteligente de Plano de Contas para categoria legada CostCategory
const mapAccountToCategory = (name: string, code: string): string => {
  const norm = name.toLowerCase();
  if (norm.includes("ração") || norm.includes("nutrição")) return "RACAO";
  if (norm.includes("mineral") || norm.includes("sal")) return "SAL_MINERAL";
  if (norm.includes("vacina") || norm.includes("saúde")) return "VACINA";
  if (norm.includes("medic")) return "MEDICAMENTO";
  if (norm.includes("salário") || norm.includes("mão") || norm.includes("encargo") || norm.includes("funcionário")) return "FUNCIONARIO";
  if (norm.includes("energia") || norm.includes("luz") || norm.includes("água") || norm.includes("internet")) return "ENERGIA";
  if (norm.includes("frete")) return "FRETE";
  if (norm.includes("manuten") || norm.includes("reforma")) return "MANUTENCAO";
  if (norm.includes("comissão")) return "COMISSAO";
  if (norm.includes("combust")) return "COMBUSTIVEL";
  if (norm.includes("veterin")) return "VETERINARIO";
  if (norm.includes("arrenda")) return "ARRENDAMENTO";
  return "OUTROS";
};

export function CostForm({ farms, lots, chartOfAccounts, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  // Filtra as contas do plano de contas que são saídas (despesas)
  const outflowAccounts = chartOfAccounts.filter((acc) => acc.type === "OUTFLOW");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CostInput>({
    resolver: zodResolver(CostSchema) as any,
    defaultValues: {
      farmId: farms[0]?.id,
      type: "VARIABLE",
      category: "OUTROS",
      chartOfAccountId: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
    },
  });

  const selectedFarmId = watch("farmId");
  const filteredLots = lots.filter((l) => l.farmId === selectedFarmId);

  function handleAccountChange(accId: string) {
    setValue("chartOfAccountId", accId || null);
    
    // Mapeia automaticamente para a categoria compatível com base no nome
    const acc = outflowAccounts.find((a) => a.id === accId);
    if (acc) {
      const mappedCategory = mapAccountToCategory(acc.name, acc.code);
      setValue("category", mappedCategory as any);
    }
  }

  function onSubmit(data: CostInput) {
    startTransition(async () => {
      const result = await createCost(data);
      if (!result.error) {
        toast.success("Custo lançado com sucesso!");
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Fazenda" required error={errors.farmId?.message}>
          <Select 
            value={watch("farmId")} 
            onValueChange={(v) => { setValue("farmId", v); setValue("lotId", null); }}
          >
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Lote (opcional)" error={errors.lotId?.message}>
          <Select value={watch("lotId") ?? ""} onValueChange={(v) => setValue("lotId", v || null)}>
            <SelectTrigger><SelectValue placeholder="Nenhum (fazenda)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum (custo geral da fazenda)</SelectItem>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Conta Contábil (Plano de Contas)" required error={errors.chartOfAccountId?.message}>
          <Select 
            value={watch("chartOfAccountId") ?? ""} 
            onValueChange={handleAccountChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta..." />
            </SelectTrigger>
            <SelectContent>
              {outflowAccounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Tipo de Custo" required error={errors.type?.message}>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as CostInput["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">Custo Fixo</SelectItem>
              <SelectItem value="VARIABLE">Custo Variável</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Descrição" required error={errors.description?.message}>
        <Input {...register("description")} placeholder="ex: Compra de ração de recria - 50 sacos" />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Valor (R$)" required error={errors.amount?.message}>
          <Input type="number" step="0.01" {...register("amount")} placeholder="0,00" />
        </FormField>

        <FormField label="Data do Lançamento" required error={errors.date?.message}>
          <DatePicker value={watch("date")} onChange={(e) => setValue("date", e.target.value)} />
        </FormField>

        <FormField label="Data de Vencimento" error={errors.dueDate?.message}>
          <DatePicker 
            value={watch("dueDate") ?? ""} 
            onChange={(e) => setValue("dueDate", e.target.value || null)} 
          />
        </FormField>
      </div>

      <div className="pt-1">
        <Checkbox
          id="recurring"
          label="Custo recorrente (mensal)"
          checked={watch("isRecurring")}
          onChange={(e) => setValue("isRecurring", e.target.checked)}
        />
      </div>

      <FormField label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={2} placeholder="Detalhes adicionais..." />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Lançar custo"}
        </Button>
      </div>
    </form>
  );
}
