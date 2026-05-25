import { prisma as defaultPrisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";
import type { PrismaTransactionClient } from "@/server/lib/prisma-types";

export interface WeighingParams {
  farmId: string;
  animalId?: string | null;
  lotId?: string | null;
  date: Date;
  weight: number;
  responsible?: string | null;
  notes?: string | null;
}

export class WeighingService {
  private prisma: PrismaClient | PrismaTransactionClient;

  constructor(prisma: PrismaClient | PrismaTransactionClient = defaultPrisma) {
    this.prisma = prisma;
  }

  /**
   * Registra uma única pesagem de animal ou lote, calculando o GMD e atualizando o peso atual.
   */
  async registerWeighing(params: WeighingParams) {
    const { farmId, animalId, lotId, date, weight, responsible, notes } = params;

    let previousWeight: number | null = null;
    let daysSinceLast: number | null = null;

    // Buscar pesagem anterior para cálculo de GMD
    if (animalId) {
      const prev = await this.prisma.weighing.findFirst({
        where: { animalId },
        orderBy: { date: "desc" },
      });
      if (prev) {
        previousWeight = Number(prev.weight);
        daysSinceLast = Math.round(
          (new Date(date).getTime() - prev.date.getTime()) / 86400000
        );
      }
    } else if (lotId) {
      const prev = await this.prisma.weighing.findFirst({
        where: { lotId, animalId: null },
        orderBy: { date: "desc" },
      });
      if (prev) {
        previousWeight = Number(prev.weight);
        daysSinceLast = Math.round(
          (new Date(date).getTime() - prev.date.getTime()) / 86400000
        );
      }
    }

    const weightGain = previousWeight !== null ? weight - previousWeight : null;
    const dailyGain =
      weightGain !== null && daysSinceLast && daysSinceLast > 0
        ? weightGain / daysSinceLast
        : null;

    // Se this.prisma já for uma transação, usamos diretamente, senão criamos uma transação
    const execute = async (tx: PrismaTransactionClient) => {
      const weighing = await tx.weighing.create({
        data: {
          farmId,
          animalId: animalId ?? null,
          lotId: lotId ?? null,
          date,
          weight,
          responsible: responsible ?? null,
          notes: notes ?? null,
          previousWeight,
          weightGain,
          daysSinceLast,
          dailyGain,
        },
      });

      if (animalId) {
        await tx.animal.update({
          where: { id: animalId },
          data: { currentWeight: weight },
        });
      } else if (lotId) {
        await tx.cattleLot.update({
          where: { id: lotId },
          data: { currentAvgWeight: weight },
        });
      }

      return weighing;
    };

    if ("$transaction" in this.prisma) {
      return this.prisma.$transaction(execute);
    } else {
      return execute(this.prisma as PrismaTransactionClient);
    }
  }

  /**
   * Processa e registra pesagens em lote de forma altamente otimizada, calculando o GMD de cada linha.
   */
  async registerBatchWeighings(farmId: string, items: Omit<WeighingParams, "farmId">[]) {
    if (items.length === 0) return { count: 0 };

    const animalIds = items.map((item) => item.animalId).filter(Boolean) as string[];
    const lotIds = items.map((item) => item.lotId).filter(Boolean) as string[];

    // Busca todas as pesagens anteriores das entidades envolvidas em apenas duas queries (evitando N+1)
    const [prevAnimalWeighings, prevLotWeighings] = await Promise.all([
      animalIds.length > 0
        ? this.prisma.weighing.findMany({
            where: { animalId: { in: animalIds } },
            orderBy: { date: "desc" },
          })
        : Promise.resolve([]),
      lotIds.length > 0
        ? this.prisma.weighing.findMany({
            where: { lotId: { in: lotIds }, animalId: null },
            orderBy: { date: "desc" },
          })
        : Promise.resolve([]),
    ]);

    // Mapeia o id de cada entidade para a sua pesagem mais recente
    const latestWeighingByAnimal = new Map<string, typeof prevAnimalWeighings[number]>();
    for (const w of prevAnimalWeighings) {
      if (w.animalId && !latestWeighingByAnimal.has(w.animalId)) {
        latestWeighingByAnimal.set(w.animalId, w);
      }
    }

    const latestWeighingByLot = new Map<string, typeof prevLotWeighings[number]>();
    for (const w of prevLotWeighings) {
      if (w.lotId && !latestWeighingByLot.has(w.lotId)) {
        latestWeighingByLot.set(w.lotId, w);
      }
    }

    const execute = async (tx: PrismaTransactionClient) => {
      let count = 0;

      for (const item of items) {
        const { animalId, lotId, date, weight, responsible, notes } = item;
        let previousWeight: number | null = null;
        let daysSinceLast: number | null = null;

        if (animalId) {
          const prev = latestWeighingByAnimal.get(animalId);
          if (prev) {
            previousWeight = Number(prev.weight);
            daysSinceLast = Math.round(
              (new Date(date).getTime() - prev.date.getTime()) / 86400000
            );
          }
        } else if (lotId) {
          const prev = latestWeighingByLot.get(lotId);
          if (prev) {
            previousWeight = Number(prev.weight);
            daysSinceLast = Math.round(
              (new Date(date).getTime() - prev.date.getTime()) / 86400000
            );
          }
        }

        const weightGain = previousWeight !== null ? weight - previousWeight : null;
        const dailyGain =
          weightGain !== null && daysSinceLast && daysSinceLast > 0
            ? weightGain / daysSinceLast
            : null;

        // Cria a pesagem com GMD calculado
        await tx.weighing.create({
          data: {
            farmId,
            animalId: animalId ?? null,
            lotId: lotId ?? null,
            date,
            weight,
            responsible: responsible ?? null,
            notes: notes ?? null,
            previousWeight,
            weightGain,
            daysSinceLast,
            dailyGain,
          },
        });

        // Atualiza a tabela da entidade
        if (animalId) {
          await tx.animal.update({
            where: { id: animalId },
            data: { currentWeight: weight },
          });
        } else if (lotId) {
          await tx.cattleLot.update({
            where: { id: lotId },
            data: { currentAvgWeight: weight },
          });
        }

        count++;
      }

      return { count };
    };

    if ("$transaction" in this.prisma) {
      return this.prisma.$transaction(execute);
    } else {
      return execute(this.prisma as PrismaTransactionClient);
    }
  }
}
