import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    weighing: {},
    animal: {},
    cattleLot: {},
  },
}));

import { WeighingService } from "../weighing-service";


describe("WeighingService", () => {
  let mockPrisma: any;
  let service: WeighingService;

  beforeEach(() => {
    mockPrisma = {
      weighing: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
      animal: {
        update: vi.fn(),
      },
      cattleLot: {
        update: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };
    service = new WeighingService(mockPrisma as any);
  });

  describe("registerWeighing", () => {
    it("deve calcular GMD corretamente para animal com pesagem anterior", async () => {
      const dataAnterior = new Date("2026-05-01T12:00:00Z");
      const dataAtual = new Date("2026-05-11T12:00:00Z"); // 10 dias depois

      mockPrisma.weighing.findFirst.mockResolvedValue({
        weight: 100, // 100 kg
        date: dataAnterior,
      });

      mockPrisma.weighing.create.mockImplementation((args: any) => args.data);

      await service.registerWeighing({
        farmId: "farm-1",
        animalId: "animal-1",
        date: dataAtual,
        weight: 120, // Ganho de 20 kg em 10 dias = GMD de 2.0 kg/dia
        responsible: "Dr. João",
        notes: "Pesagem de controle",
      });

      expect(mockPrisma.weighing.findFirst).toHaveBeenCalledWith({
        where: { animalId: "animal-1" },
        orderBy: { date: "desc" },
      });

      expect(mockPrisma.weighing.create).toHaveBeenCalledWith({
        data: {
          farmId: "farm-1",
          animalId: "animal-1",
          lotId: null,
          date: dataAtual,
          weight: 120,
          responsible: "Dr. João",
          notes: "Pesagem de controle",
          previousWeight: 100,
          weightGain: 20,
          daysSinceLast: 10,
          dailyGain: 2,
        },
      });

      expect(mockPrisma.animal.update).toHaveBeenCalledWith({
        where: { id: "animal-1" },
        data: { currentWeight: 120 },
      });
    });

    it("deve definir GMD e ganho como nulos na primeira pesagem do animal", async () => {
      const dataAtual = new Date("2026-05-11T12:00:00Z");
      mockPrisma.weighing.findFirst.mockResolvedValue(null); // Sem pesagem anterior
      mockPrisma.weighing.create.mockImplementation((args: any) => args.data);

      await service.registerWeighing({
        farmId: "farm-1",
        animalId: "animal-1",
        date: dataAtual,
        weight: 120,
      });

      expect(mockPrisma.weighing.create).toHaveBeenCalledWith({
        data: {
          farmId: "farm-1",
          animalId: "animal-1",
          lotId: null,
          date: dataAtual,
          weight: 120,
          responsible: null,
          notes: null,
          previousWeight: null,
          weightGain: null,
          daysSinceLast: null,
          dailyGain: null,
        },
      });

      expect(mockPrisma.animal.update).toHaveBeenCalledWith({
        where: { id: "animal-1" },
        data: { currentWeight: 120 },
      });
    });

    it("deve atualizar a média de peso do lote ao registrar pesagem de lote", async () => {
      const dataAtual = new Date("2026-05-11T12:00:00Z");
      mockPrisma.weighing.findFirst.mockResolvedValue(null);
      mockPrisma.weighing.create.mockImplementation((args: any) => args.data);

      await service.registerWeighing({
        farmId: "farm-1",
        lotId: "lot-1",
        date: dataAtual,
        weight: 450,
      });

      expect(mockPrisma.weighing.findFirst).toHaveBeenCalledWith({
        where: { lotId: "lot-1", animalId: null },
        orderBy: { date: "desc" },
      });

      expect(mockPrisma.cattleLot.update).toHaveBeenCalledWith({
        where: { id: "lot-1" },
        data: { currentAvgWeight: 450 },
      });
    });
  });

  describe("registerBatchWeighings", () => {
    it("deve processar pesagens em lote calculando GMD em memória para múltiplos animais", async () => {
      const dataAnterior = new Date("2026-05-01T12:00:00Z");
      const dataAtual = new Date("2026-05-11T12:00:00Z"); // 10 dias depois

      // Mock de pesagens anteriores em lote
      mockPrisma.weighing.findMany.mockResolvedValue([
        {
          animalId: "animal-1",
          weight: 100,
          date: dataAnterior,
        },
        {
          animalId: "animal-2",
          weight: 200,
          date: dataAnterior,
        },
      ]);

      const items = [
        {
          animalId: "animal-1",
          date: dataAtual,
          weight: 115, // Ganho de 15 kg em 10 dias = GMD 1.5
        },
        {
          animalId: "animal-2",
          date: dataAtual,
          weight: 230, // Ganho de 30 kg em 10 dias = GMD 3.0
        },
        {
          animalId: "animal-3", // Primeira pesagem deste animal (sem anterior)
          date: dataAtual,
          weight: 150,
        },
      ];

      const result = await service.registerBatchWeighings("farm-1", items);

      expect(result.count).toBe(3);
      expect(mockPrisma.weighing.findMany).toHaveBeenCalledWith({
        where: { animalId: { in: ["animal-1", "animal-2", "animal-3"] } },
        orderBy: { date: "desc" },
      });

      // Validar primeiro animal (com ganho de peso)
      expect(mockPrisma.weighing.create).toHaveBeenCalledWith({
        data: {
          farmId: "farm-1",
          animalId: "animal-1",
          lotId: null,
          date: dataAtual,
          weight: 115,
          responsible: null,
          notes: null,
          previousWeight: 100,
          weightGain: 15,
          daysSinceLast: 10,
          dailyGain: 1.5,
        },
      });

      // Validar segundo animal (com ganho de peso)
      expect(mockPrisma.weighing.create).toHaveBeenCalledWith({
        data: {
          farmId: "farm-1",
          animalId: "animal-2",
          lotId: null,
          date: dataAtual,
          weight: 230,
          responsible: null,
          notes: null,
          previousWeight: 200,
          weightGain: 30,
          daysSinceLast: 10,
          dailyGain: 3,
        },
      });

      // Validar terceiro animal (primeira pesagem, sem GMD)
      expect(mockPrisma.weighing.create).toHaveBeenCalledWith({
        data: {
          farmId: "farm-1",
          animalId: "animal-3",
          lotId: null,
          date: dataAtual,
          weight: 150,
          responsible: null,
          notes: null,
          previousWeight: null,
          weightGain: null,
          daysSinceLast: null,
          dailyGain: null,
        },
      });

      // Validar atualizações dos animais
      expect(mockPrisma.animal.update).toHaveBeenCalledWith({
        where: { id: "animal-1" },
        data: { currentWeight: 115 },
      });
      expect(mockPrisma.animal.update).toHaveBeenCalledWith({
        where: { id: "animal-2" },
        data: { currentWeight: 230 },
      });
      expect(mockPrisma.animal.update).toHaveBeenCalledWith({
        where: { id: "animal-3" },
        data: { currentWeight: 150 },
      });
    });
  });
});
