import { z } from "zod";
import { AnimalSex, AnimalCategory } from "@prisma/client";

export const AnimalSchema = z.object({
  farmId: z.string().min(1, "Fazenda obrigatória"),
  lotId: z.string().optional().nullable(),
  tag: z.string().optional(),
  electronicTag: z.string().optional(),
  breed: z.string().optional(),
  sex: z.nativeEnum(AnimalSex),
  category: z.nativeEnum(AnimalCategory),
  birthDate: z.string().optional().nullable(),
  entryDate: z.string().min(1, "Data de entrada obrigatória"),
  entryWeight: z.coerce.number().positive().optional().nullable(),
  purchaseCost: z.coerce.number().positive().optional().nullable(),
  notes: z.string().optional(),
});

export type AnimalInput = z.infer<typeof AnimalSchema>;
