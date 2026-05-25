import { z } from "zod";
import { HealthEventType } from "@prisma/client";

export const HealthEventSchema = z.object({
  animalId: z.string().min(1, "Animal obrigatório"),
  date: z.string().min(1, "Data obrigatória"),
  type: z.nativeEnum(HealthEventType),
  description: z.string().min(2, "Descrição obrigatória"),
  productName: z.string().optional(),
  dosage: z.string().optional(),
  withdrawalDays: z.coerce.number().int().min(0).optional().nullable(),
  responsible: z.string().optional(),
  notes: z.string().optional(),
});

export type HealthEventInput = z.infer<typeof HealthEventSchema>;
