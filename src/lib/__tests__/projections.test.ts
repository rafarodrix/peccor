import { describe, it, expect } from "vitest";
import { calcLotProjection } from "../projections";

describe("calcLotProjection", () => {
  const baseParams = {
    currentAvgWeight: 350,
    currentQuantity: 50,
    avgDailyGain: 1.2,
    targetWeight: 480,
    pricePerArroba: 300,
    totalCost: 150000,
  };

  it("calculates days to target correctly", () => {
    // (480 - 350) / 1.2 = 108.33... → ceil = 109
    const result = calcLotProjection(baseParams);
    expect(result.daysToTarget).toBe(109);
  });

  it("sets projectedWeight to targetWeight", () => {
    const result = calcLotProjection(baseParams);
    expect(result.projectedWeight).toBe(480);
  });

  it("calculates projected arrobas (targetWeight / 15 * quantity)", () => {
    // 480 / 15 * 50 = 1600 arrobas
    const result = calcLotProjection(baseParams);
    expect(result.projectedArrobas).toBeCloseTo(1600);
  });

  it("calculates projected revenue (arrobas * pricePerArroba)", () => {
    // 1600 * 300 = 480000
    const result = calcLotProjection(baseParams);
    expect(result.projectedRevenue).toBeCloseTo(480000);
  });

  it("calculates projected profit (revenue - totalCost)", () => {
    // 480000 - 150000 = 330000
    const result = calcLotProjection(baseParams);
    expect(result.projectedProfit).toBeCloseTo(330000);
  });

  it("calculates profit per head", () => {
    // 330000 / 50 = 6600
    const result = calcLotProjection(baseParams);
    expect(result.projectedProfitPerHead).toBeCloseTo(6600);
  });

  it("calculates profit per arroba", () => {
    // 330000 / 1600 = 206.25
    const result = calcLotProjection(baseParams);
    expect(result.projectedProfitPerArroba).toBeCloseTo(206.25);
  });

  it("sets slaughterDate approximately daysToTarget days from now", () => {
    const before = Date.now();
    const result = calcLotProjection(baseParams);
    const after = Date.now();
    const minExpected = before + result.daysToTarget * 86400000;
    const maxExpected = after + result.daysToTarget * 86400000;
    expect(result.slaughterDate.getTime()).toBeGreaterThanOrEqual(minExpected);
    expect(result.slaughterDate.getTime()).toBeLessThanOrEqual(maxExpected);
  });

  describe("edge cases", () => {
    it("returns 0 daysToTarget when avgDailyGain is 0", () => {
      const result = calcLotProjection({ ...baseParams, avgDailyGain: 0 });
      expect(result.daysToTarget).toBe(0);
    });

    it("returns 0 daysToTarget when animal already reached target weight", () => {
      const result = calcLotProjection({ ...baseParams, currentAvgWeight: 500 });
      expect(result.daysToTarget).toBe(0);
    });

    it("returns 0 profitPerHead when quantity is 0", () => {
      const result = calcLotProjection({ ...baseParams, currentQuantity: 0 });
      expect(result.projectedProfitPerHead).toBe(0);
    });

    it("returns 0 profitPerArroba when projectedArrobas is 0", () => {
      const result = calcLotProjection({ ...baseParams, currentQuantity: 0, targetWeight: 0 });
      expect(result.projectedProfitPerArroba).toBe(0);
    });

    it("handles negative profit (loss scenario)", () => {
      const result = calcLotProjection({ ...baseParams, totalCost: 600000 });
      expect(result.projectedProfit).toBeLessThan(0);
      expect(result.projectedProfitPerHead).toBeLessThan(0);
    });
  });
});
