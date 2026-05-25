import { z } from "zod";
import { CostType, CostCategory } from "@prisma/client";

export const CostSchema = z.object({
  farmId: z.string().min(1, "Fazenda obrigatória"),
  lotId: z.string().optional().nullable(),
  category: z.nativeEnum(CostCategory),
  type: z.nativeEnum(CostType),
  description: z.string().min(2, "Descrição obrigatória"),
  date: z.string().min(1, "Data obrigatória"),
  dueDate: z.string().optional().nullable(),
  amount: z.coerce.number().positive("Valor obrigatório"),
  isRecurring: z.boolean().default(false),
  recurrence: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type CostInput = z.infer<typeof CostSchema>;
