"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InviteUserSchema, type InviteUserInput } from "@/lib/validations/user";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/permissions";
import { inviteUser } from "@/server/actions/users";
import type { TenantRole } from "@prisma/client";

const ROLES: TenantRole[] = ["OWNER", "ADMIN", "MANAGER", "FINANCE", "VETERINARY", "OPERATOR", "VIEWER"];

interface Props {
  onSuccess?: () => void;
}

export function UserInviteForm({ onSuccess }: Props) {
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InviteUserInput>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: { role: "OPERATOR" },
  });

  const selectedRole = watch("role");

  function onSubmit(data: InviteUserInput) {
    startTransition(async () => {
      const result = await inviteUser(data);
      if (!result.error) onSuccess?.();
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label>Nome completo *</Label>
        <Input {...register("name")} placeholder="Maria Souza" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Email *</Label>
        <Input type="email" {...register("email")} placeholder="maria@fazenda.com.br" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Senha temporária *</Label>
        <Input type="password" {...register("password")} placeholder="Mínimo 8 caracteres" />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Perfil de acesso *</Label>
        <Select value={selectedRole} onValueChange={(v) => setValue("role", v as TenantRole)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRole && (
          <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[selectedRole]}</p>
        )}
        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Convidando..." : "Adicionar usuário"}
        </Button>
      </div>
    </form>
  );
}
