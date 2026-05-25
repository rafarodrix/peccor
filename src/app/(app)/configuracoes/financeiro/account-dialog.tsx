"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createChartOfAccount } from "@/server/actions/chart-of-accounts";

const CreateAccountSchema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  name: z.string().min(1, "Nome obrigatório"),
  type: z.enum(["INFLOW", "OUTFLOW"]),
  dfcCategory: z.enum(["OPERATIONAL", "INVESTMENT", "FINANCING"]).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

type FormInput = z.infer<typeof CreateAccountSchema>;

interface Props {
  accounts: { id: string; code: string; name: string }[];
}

export function AccountDialog({ accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(CreateAccountSchema) as any,
    defaultValues: {
      type: "OUTFLOW",
      dfcCategory: "OPERATIONAL",
      parentId: "",
    },
  });

  const selectedType = watch("type");

  function onSubmit(data: FormInput) {
    startTransition(async () => {
      const result = await createChartOfAccount({
        ...data,
        parentId: data.parentId === "" ? null : data.parentId,
        dfcCategory: (data.dfcCategory as any) === "" ? null : data.dfcCategory,
      });

      if (!result.error) {
        toast.success("Conta contábil criada com sucesso!");
        reset();
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Nova Conta Contábil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Código Estrutural" required error={errors.code?.message}>
              <Input {...register("code")} placeholder="ex: 2.1.06" />
            </FormField>
            <FormField label="Tipo de Fluxo" required error={errors.type?.message}>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as "INFLOW" | "OUTFLOW")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFLOW">Receita (Entrada)</SelectItem>
                  <SelectItem value="OUTFLOW">Despesa (Saída)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Nome da Conta" required error={errors.name?.message}>
            <Input {...register("name")} placeholder="ex: Compra de Fertilizantes" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Categoria DFC" error={errors.dfcCategory?.message}>
              <Select
                value={watch("dfcCategory") ?? ""}
                onValueChange={(v) => setValue("dfcCategory", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem Categoria</SelectItem>
                  <SelectItem value="OPERATIONAL">Operacional (FCO)</SelectItem>
                  <SelectItem value="INVESTMENT">Investimento (FCI)</SelectItem>
                  <SelectItem value="FINANCING">Financiamento (FCF)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Conta Pai (Superior)" error={errors.parentId?.message}>
              <Select
                value={watch("parentId") ?? ""}
                onValueChange={(v) => setValue("parentId", v || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (Nível Raiz)</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando..." : "Criar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
