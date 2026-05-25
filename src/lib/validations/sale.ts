import { z } from "zod";

export const SaleSchema = z.object({
  farmId: z.string().min(1, "Fazenda obrigatória"),
  lotId: z.string().optional().nullable(),
  customerName: z.string().min(2, "Comprador obrigatório"),
  date: z.string().min(1, "Data obrigatória"),
  quantity: z.coerce.number().int().positive("Quantidade obrigatória"),
  totalWeight: z.coerce.number().positive().optional().nullable(),
  pricePerArroba: z.coerce.number().positive().optional().nullable(),
  animalValue: z.coerce.number().positive("Valor obrigatório"),
  freightValue: z.coerce.number().min(0).default(0),
  commissionValue: z.coerce.number().min(0).default(0),
  discountValue: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type SaleInput = z.infer<typeof SaleSchema>;
