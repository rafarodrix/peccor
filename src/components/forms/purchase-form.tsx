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
import { PurchaseSchema, type PurchaseInput } from "@/lib/validations/purchase";
import { createPurchase } from "@/server/actions/purchases";
import type { CattleLot, Farm } from "@prisma/client";

interface Props {
  farms: Pick<Farm, "id" | "name">[];
  lots: Pick<CattleLot, "id" | "code" | "farmId">[];
  onSuccess?: () => void;
}

export function PurchaseForm({ farms, lots, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PurchaseInput>({
    resolver: zodResolver(PurchaseSchema),
    defaultValues: {
      farmId: farms[0]?.id,
      date: new Date().toISOString().split("T")[0],
      freightValue: 0,
      commissionValue: 0,
      otherCosts: 0,
    },
  });

  const selectedFarmId = watch("farmId");
  const filteredLots = lots.filter((l) => l.farmId === selectedFarmId);

  function onSubmit(data: PurchaseInput) {
    startTransition(async () => {
      const result = await createPurchase(data);
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
            <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
            <SelectContent>
              {filteredLots.map((l) => <SelectItem key={l.id} value={l.id}>{l.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Fornecedor *</Label>
          <Input {...register("supplierName")} placeholder="Agro Rodrigues" />
          {errors.supplierName && <p className="text-xs text-destructive">{errors.supplierName.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Data *</Label>
          <Input type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Quantidade (cabeças) *</Label>
          <Input type="number" {...register("quantity")} placeholder="80" />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Peso total (kg)</Label>
          <Input type="number" step="0.1" {...register("totalWeight")} placeholder="22400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Valor dos animais (R$) *</Label>
          <Input type="number" step="0.01" {...register("animalValue")} placeholder="280000" />
          {errors.animalValue && <p className="text-xs text-destructive">{errors.animalValue.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Frete (R$)</Label>
          <Input type="number" step="0.01" {...register("freightValue")} placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Comissão (R$)</Label>
          <Input type="number" step="0.01" {...register("commissionValue")} placeholder="0" />
        </div>
        <div className="grid gap-2">
          <Label>Outros custos (R$)</Label>
          <Input type="number" step="0.01" {...register("otherCosts")} placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Forma de pagamento</Label>
          <Select value={watch("paymentMethod") ?? ""} onValueChange={(v) => setValue("paymentMethod", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
              <SelectItem value="BOLETO">Boleto</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Vencimento</Label>
          <Input type="date" {...register("dueDate")} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar compra"}
        </Button>
      </div>
    </form>
  );
}
