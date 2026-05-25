import { z } from "zod";
import { CattlePhase } from "@prisma/client";

export const LotSchema = z.object({
  farmId: z.string().min(1, "Fazenda obrigatória"),
  areaId: z.string().optional().nullable(),
  code: z.string().min(2, "Código obrigatório"),
  description: z.string().optional(),
  phase: z.nativeEnum(CattlePhase),
  startDate: z.string().min(1, "Data de início obrigatória"),
  initialQuantity: z.coerce.number().int().min(0),
  initialAvgWeight: z.coerce.number().positive().optional().nullable(),
});

export type LotInput = z.infer<typeof LotSchema>;
