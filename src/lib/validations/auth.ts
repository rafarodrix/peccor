import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const RegisterSchema = z.object({
  orgName: z.string().min(2, "Nome da organização obrigatório"),
  name: z.string().min(2, "Seu nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
