import { z } from "zod";

export const WeighingSchema = z.object({
  farmId: z.string().min(1, "Fazenda obrigatória"),
  lotId: z.string().optional().nullable(),
  animalId: z.string().optional().nullable(),
  date: z.string().min(1, "Data obrigatória"),
  weight: z.coerce.number().positive("Peso obrigatório"),
  responsible: z.string().optional(),
  notes: z.string().optional(),
});

export type WeighingInput = z.infer<typeof WeighingSchema>;
