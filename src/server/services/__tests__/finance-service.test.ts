import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    purchase: {},
    sale: {},
    cattleLot: {},
  },
}));

import { FinanceService } from "../finance-service";

describe("FinanceService", () => {
  let mockPrisma: any;
  let service: FinanceService;

  beforeEach(() => {
    mockPrisma = {
      purchase: {
        create: vi.fn(),
      },
      sale: {
        create: vi.fn(),
      },
      cattleLot: {
        update: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };
    service = new FinanceService(mockPrisma as any);
  });

  describe("Cálculos Financeiros Puros", () => {
    it("deve calcular o custo total de compra somando todas as taxas", () => {
      const total = service.calculatePurchaseTotal(1000, 150, 50, 100);
      expect(total).toBe(1300); // 1000 + 150 + 50 + 100
    });

    it("deve usar valores padrões zerados quando taxas não forem informadas", () => {
      const total = service.calculatePurchaseTotal(1000);
      expect(total).toBe(1000);
    });

    it("deve calcular o valor líquido de venda deduzindo as taxas", () => {
      const net = service.calculateSaleNet(2000, 100, 50, 200);
      expect(net).toBe(1650); // 2000 - 100 - 50 - 200
    });

    it("deve usar valores padrões zerados na venda líquida se taxas não forem informadas", () => {
      const net = service.calculateSaleNet(2000);
      expect(net).toBe(2000);
    });
  });

  describe("registerPurchase", () => {
    it("deve registrar a compra e incrementar a quantidade do lote correspondente", async () => {
      const dataCompra = new Date("2026-05-25");
      mockPrisma.purchase.create.mockResolvedValue({ id: "purchase-1" });

      await service.registerPurchase({
        farmId: "farm-1",
        lotId: "lot-1",
        supplierName: "Agro Rurais",
        date: dataCompra,
        quantity: 50,
        totalWeight: 15000,
        animalValue: 120000,
        freightValue: 2000,
        commissionValue: 1000,
        otherCosts: 500,
        paymentMethod: "PIX",
      });

      expect(mockPrisma.purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            farmId: "farm-1",
            supplierName: "Agro Rurais",
            date: dataCompra,
            quantity: 50,
            totalWeight: 15000,
            animalValue: 120000,
            freightValue: 2000,
            commissionValue: 1000,
            otherCosts: 500,
            totalValue: 123500, // 120000 + 2000 + 1000 + 500
            paymentMethod: "PIX",
          }),
        })
      );

      expect(mockPrisma.cattleLot.update).toHaveBeenCalledWith({
        where: { id: "lot-1" },
        data: {
          currentQuantity: { increment: 50 },
          initialQuantity: { increment: 50 },
        },
      });
    });
  });

  describe("registerSale", () => {
    it("deve registrar a venda, reduzir a quantidade do lote e fechar o lote se zerado", async () => {
      const dataVenda = new Date("2026-05-25");
      mockPrisma.sale.create.mockResolvedValue({ id: "sale-1" });
      mockPrisma.cattleLot.update.mockResolvedValue({ currentQuantity: 0 }); // Simula lote zerado após a venda

      await service.registerSale({
        farmId: "farm-1",
        lotId: "lot-1",
        customerName: "Frigorífico JBS",
        date: dataVenda,
        quantity: 30,
        totalWeight: 10000,
        pricePerArroba: 300,
        animalValue: 200000,
        freightValue: 5000,
        commissionValue: 2000,
        discountValue: 1000,
      });

      expect(mockPrisma.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            farmId: "farm-1",
            customerName: "Frigorífico JBS",
            date: dataVenda,
            quantity: 30,
            totalWeight: 10000,
            pricePerArroba: 300,
            animalValue: 200000,
            freightValue: 5000,
            commissionValue: 2000,
            discountValue: 1000,
            totalValue: 200000,
            netValue: 192000, // 200000 - 5000 - 2000 - 1000
          }),
        })
      );

      expect(mockPrisma.cattleLot.update).toHaveBeenCalledWith({
        where: { id: "lot-1" },
        data: { currentQuantity: { decrement: 30 } },
        select: { currentQuantity: true },
      });

      // Lote ficou com 0 cabeças, então deve ter status alterado para SOLD
      expect(mockPrisma.cattleLot.update).toHaveBeenCalledWith({
        where: { id: "lot-1" },
        data: expect.objectContaining({
          status: "SOLD",
        }),
      });
    });
  });
});
