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
import { SaleSchema, type SaleInput } from "@/lib/validations/sale";
import { createSale } from "@/server/actions/sales";
import type { CattleLot, Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
  onSuccess?: () => void;
}

export function SaleForm({ farms, lots, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SaleInput>({
    resolver: zodResolver(SaleSchema) as any,
    defaultValues: {
      farmId: farms[0]?.id,
      date: new Date().toISOString().split("T")[0],
      freightValue: 0,
      commissionValue: 0,
      discountValue: 0,
    },
  });

  const selectedFarmId = watch("farmId");
  const filteredLots = lots.filter((l) => l.farmId === selectedFarmId);

  function onSubmit(data: SaleInput) {
    startTransition(async () => {
      const result = await createSale(data);
      if (!result.error) {
        toast.success("Venda registrada com sucesso!");
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

        <FormField label="Lote Origem" error={errors.lotId?.message}>
          <Select value={watch("lotId") ?? ""} onValueChange={(v) => setValue("lotId", v || null)}>
            <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum (avulso)</SelectItem>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Comprador" required error={errors.customerName?.message}>
          <Input {...register("customerName")} placeholder="Frigorífico Mineiro" />
        </FormField>

        <FormField label="Data da Venda" required error={errors.date?.message}>
          <DatePicker value={watch("date")} onChange={(e) => setValue("date", e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Quantidade (cabeças)" required error={errors.quantity?.message}>
          <Input type="number" {...register("quantity")} placeholder="40" />
        </FormField>

        <FormField label="Peso total (kg)" error={errors.totalWeight?.message}>
          <Input type="number" step="0.1" {...register("totalWeight")} placeholder="18000" />
        </FormField>

        <FormField label="Preço por arroba (@)" error={errors.pricePerArroba?.message}>
          <Input type="number" step="0.01" {...register("pricePerArroba")} placeholder="310,00" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor dos animais (R$)" required error={errors.animalValue?.message}>
          <Input type="number" step="0.01" {...register("animalValue")} placeholder="372.000,00" />
        </FormField>

        <FormField label="Frete (R$)" error={errors.freightValue?.message}>
          <Input type="number" step="0.01" {...register("freightValue")} placeholder="0,00" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Comissão (R$)" error={errors.commissionValue?.message}>
          <Input type="number" step="0.01" {...register("commissionValue")} placeholder="0,00" />
        </FormField>

        <FormField label="Desconto (R$)" error={errors.discountValue?.message}>
          <Input type="number" step="0.01" {...register("discountValue")} placeholder="0,00" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Forma de pagamento" error={errors.paymentMethod?.message}>
          <Select value={watch("paymentMethod") ?? ""} onValueChange={(v) => setValue("paymentMethod", v || undefined)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
              <SelectItem value="BOLETO">Boleto</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Vencimento" error={errors.dueDate?.message}>
          <DatePicker 
            value={watch("dueDate") ?? ""} 
            onChange={(e) => setValue("dueDate", e.target.value || null)} 
          />
        </FormField>
      </div>

      <FormField label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={2} placeholder="Detalhes do contrato..." />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar venda"}
        </Button>
      </div>
    </form>
  );
}
