import { z } from "zod";
import { TenantRole } from "@prisma/client";

export const InviteUserSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.nativeEnum(TenantRole),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

export const UpdateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(TenantRole),
});

export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
