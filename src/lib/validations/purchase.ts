import { z } from "zod";

export const PurchaseSchema = z.object({
  farmId: z.string().min(1, "Fazenda obrigatória"),
  lotId: z.string().optional().nullable(),
  supplierName: z.string().min(2, "Fornecedor obrigatório"),
  date: z.string().min(1, "Data obrigatória"),
  quantity: z.coerce.number().int().positive("Quantidade obrigatória"),
  totalWeight: z.coerce.number().positive().optional().nullable(),
  animalValue: z.coerce.number().positive("Valor dos animais obrigatório"),
  freightValue: z.coerce.number().min(0).default(0),
  commissionValue: z.coerce.number().min(0).default(0),
  otherCosts: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type PurchaseInput = z.infer<typeof PurchaseSchema>;
