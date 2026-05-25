import { describe, it, expect } from "vitest";
import {
  kgToArrobas,
  arrobasToKg,
  calcDailyGain,
  calcCostPerHead,
  calcCostPerArroba,
  calcPurchaseTotalCost,
  calcSaleNetValue,
  slugify,
} from "../utils";

describe("kgToArrobas", () => {
  it("converts kg to arrobas (1 arroba = 15 kg)", () => {
    expect(kgToArrobas(15)).toBe(1);
    expect(kgToArrobas(480)).toBe(32);
    expect(kgToArrobas(0)).toBe(0);
  });

  it("handles fractional values", () => {
    expect(kgToArrobas(7.5)).toBe(0.5);
  });
});

describe("arrobasToKg", () => {
  it("converts arrobas to kg", () => {
    expect(arrobasToKg(1)).toBe(15);
    expect(arrobasToKg(32)).toBe(480);
  });

  it("is inverse of kgToArrobas", () => {
    expect(arrobasToKg(kgToArrobas(360))).toBe(360);
  });
});

describe("calcDailyGain", () => {
  it("calculates daily weight gain correctly", () => {
    expect(calcDailyGain(350, 320, 30)).toBeCloseTo(1.0);
    expect(calcDailyGain(386, 350, 30)).toBeCloseTo(1.2);
  });

  it("returns 0 when days is 0 or negative", () => {
    expect(calcDailyGain(350, 320, 0)).toBe(0);
    expect(calcDailyGain(350, 320, -1)).toBe(0);
  });

  it("handles weight loss (negative gain)", () => {
    expect(calcDailyGain(300, 320, 10)).toBeCloseTo(-2.0);
  });
});

describe("calcCostPerHead", () => {
  it("divides total cost by quantity", () => {
    expect(calcCostPerHead(10000, 10)).toBe(1000);
    expect(calcCostPerHead(75000, 50)).toBe(1500);
  });

  it("returns 0 when quantity is 0", () => {
    expect(calcCostPerHead(10000, 0)).toBe(0);
  });
});

describe("calcCostPerArroba", () => {
  it("calculates cost per arroba from kg", () => {
    // 150 kg = 10 arrobas; cost 1000 → R$100/@
    expect(calcCostPerArroba(1000, 150)).toBeCloseTo(100);
    // 480 kg = 32 arrobas; cost 9600 → R$300/@
    expect(calcCostPerArroba(9600, 480)).toBeCloseTo(300);
  });

  it("returns 0 when weight is 0", () => {
    expect(calcCostPerArroba(1000, 0)).toBe(0);
  });
});

describe("calcPurchaseTotalCost", () => {
  it("sums all purchase cost components", () => {
    expect(calcPurchaseTotalCost(100000, 3000, 2000, 500)).toBe(105500);
    expect(calcPurchaseTotalCost(50000, 0, 0, 0)).toBe(50000);
  });
});

describe("calcSaleNetValue", () => {
  it("subtracts deductions from animal value", () => {
    expect(calcSaleNetValue(200000, 3000, 4000, 1000)).toBe(192000);
    expect(calcSaleNetValue(100000, 0, 0, 0)).toBe(100000);
  });

  it("can result in negative value with large deductions", () => {
    expect(calcSaleNetValue(10000, 5000, 5000, 1000)).toBe(-1000);
  });
});

describe("slugify", () => {
  it("converts text to URL-safe slug", () => {
    expect(slugify("Fazenda São João")).toBe("fazenda-sao-joao");
    expect(slugify("Grupo Agro Rodrigues")).toBe("grupo-agro-rodrigues");
  });

  it("removes special characters and accents", () => {
    expect(slugify("Café & Ação")).toBe("cafe-acao");
  });

  it("collapses multiple spaces/hyphens", () => {
    expect(slugify("  test  name  ")).toBe("test-name");
  });
});
