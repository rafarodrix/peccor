import { z } from "zod";
import { FarmOperation } from "@prisma/client";

export const FarmSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  document: z.string().optional(),
  stateReg: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  totalArea: z.coerce.number().positive().optional().nullable(),
  pastureArea: z.coerce.number().positive().optional().nullable(),
  operation: z.nativeEnum(FarmOperation),
});

export const AreaSchema = z.object({
  farmId: z.string().min(1, "Fazenda obrigatória"),
  name: z.string().min(2, "Nome obrigatório"),
  type: z.enum(["PASTO", "CURRAL", "PIQUETE", "BAIA", "CONFINAMENTO", "OUTRO"]),
  capacityHead: z.coerce.number().int().positive().optional().nullable(),
});

export type FarmInput = z.infer<typeof FarmSchema>;
export type AreaInput = z.infer<typeof AreaSchema>;
