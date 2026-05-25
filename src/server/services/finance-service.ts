import { prisma as defaultPrisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";
import type { PrismaTransactionClient } from "@/server/lib/prisma-types";
import { calcPurchaseTotalCost, calcSaleNetValue } from "@/lib/utils";

export interface PurchaseParams {
  farmId: string;
  lotId?: string | null;
  supplierName: string;
  date: Date;
  quantity: number;
  totalWeight?: number | null;
  animalValue: number;
  freightValue?: number;
  commissionValue?: number;
  otherCosts?: number;
  paymentMethod?: string | null;
  dueDate?: Date | null;
  notes?: string | null;
}

export interface SaleParams {
  farmId: string;
  lotId?: string | null;
  customerName: string;
  date: Date;
  quantity: number;
  totalWeight?: number | null;
  pricePerArroba?: number | null;
  animalValue: number;
  freightValue?: number;
  commissionValue?: number;
  discountValue?: number;
  paymentMethod?: string | null;
  dueDate?: Date | null;
  notes?: string | null;
}

export class FinanceService {
  private prisma: PrismaClient | PrismaTransactionClient;

  constructor(prisma: PrismaClient | PrismaTransactionClient = defaultPrisma) {
    this.prisma = prisma;
  }

  /**
   * Calcula o custo total de uma compra baseado nas taxas e valores dos animais.
   */
  calculatePurchaseTotal(
    animalValue: number,
    freightValue = 0,
    commissionValue = 0,
    otherCosts = 0
  ): number {
    return calcPurchaseTotalCost(animalValue, freightValue, commissionValue, otherCosts);
  }

  /**
   * Calcula o valor líquido de uma venda deduzindo as despesas.
   */
  calculateSaleNet(
    animalValue: number,
    freightValue = 0,
    commissionValue = 0,
    discountValue = 0
  ): number {
    return calcSaleNetValue(animalValue, freightValue, commissionValue, discountValue);
  }

  /**
   * Registra uma nova compra de animais, atualizando a quantidade do lote correspondente.
   */
  async registerPurchase(params: PurchaseParams) {
    const {
      farmId,
      lotId,
      supplierName,
      date,
      quantity,
      totalWeight,
      animalValue,
      freightValue = 0,
      commissionValue = 0,
      otherCosts = 0,
      paymentMethod,
      dueDate,
      notes,
    } = params;

    const totalValue = this.calculatePurchaseTotal(
      animalValue,
      freightValue,
      commissionValue,
      otherCosts
    );

    const execute = async (tx: PrismaTransactionClient) => {
      const createdPurchase = await tx.purchase.create({
        data: {
          farmId,
          supplierName,
          date,
          quantity,
          totalWeight: totalWeight ?? null,
          animalValue,
          freightValue,
          commissionValue,
          otherCosts,
          totalValue,
          paymentMethod: paymentMethod ?? null,
          dueDate: dueDate ?? null,
          notes: notes ?? null,
          items: lotId
            ? {
                create: {
                  lotId,
                  quantity,
                  avgWeight: totalWeight ? totalWeight / quantity : null,
                  totalValue,
                },
              }
            : undefined,
        },
        select: { id: true },
      });

      if (lotId) {
        await tx.cattleLot.update({
          where: { id: lotId },
          data: {
            currentQuantity: { increment: quantity },
            initialQuantity: { increment: quantity },
          },
        });
      }

      return createdPurchase;
    };

    if ("$transaction" in this.prisma) {
      return this.prisma.$transaction(execute);
    } else {
      return execute(this.prisma as PrismaTransactionClient);
    }
  }

  /**
   * Registra uma nova venda de animais, atualizando a quantidade e o status do lote se zerado.
   */
  async registerSale(params: SaleParams) {
    const {
      farmId,
      lotId,
      customerName,
      date,
      quantity,
      totalWeight,
      pricePerArroba,
      animalValue,
      freightValue = 0,
      commissionValue = 0,
      discountValue = 0,
      paymentMethod,
      dueDate,
      notes,
    } = params;

    const netValue = this.calculateSaleNet(
      animalValue,
      freightValue,
      commissionValue,
      discountValue
    );

    const execute = async (tx: PrismaTransactionClient) => {
      const createdSale = await tx.sale.create({
        data: {
          farmId,
          customerName,
          date,
          quantity,
          totalWeight: totalWeight ?? null,
          pricePerArroba: pricePerArroba ?? null,
          animalValue,
          freightValue,
          commissionValue,
          discountValue,
          totalValue: animalValue,
          netValue,
          paymentMethod: paymentMethod ?? null,
          dueDate: dueDate ?? null,
          notes: notes ?? null,
          items: lotId
            ? {
                create: {
                  lotId,
                  quantity,
                  avgWeight: totalWeight ? totalWeight / quantity : null,
                  totalValue: netValue,
                },
              }
            : undefined,
        },
        select: { id: true },
      });

      if (lotId) {
        const updatedLot = await tx.cattleLot.update({
          where: { id: lotId },
          data: { currentQuantity: { decrement: quantity } },
          select: { currentQuantity: true },
        });

        if (updatedLot.currentQuantity <= 0) {
          await tx.cattleLot.update({
            where: { id: lotId },
            data: { status: "SOLD", endDate: new Date() },
          });
        }
      }

      return createdSale;
    };

    if ("$transaction" in this.prisma) {
      return this.prisma.$transaction(execute);
    } else {
      return execute(this.prisma as PrismaTransactionClient);
    }
  }
}
