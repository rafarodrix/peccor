import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatNumber(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

export function kgToArrobas(kg: number): number {
  return kg / 15;
}

export function arrobasToKg(arrobas: number): number {
  return arrobas * 15;
}

export function calcDailyGain(
  currentWeight: number,
  previousWeight: number,
  days: number
): number {
  if (days <= 0) return 0;
  return (currentWeight - previousWeight) / days;
}

export function calcCostPerHead(totalCost: number, quantity: number): number {
  if (quantity <= 0) return 0;
  return totalCost / quantity;
}

export function calcCostPerArroba(totalCost: number, totalWeightKg: number): number {
  if (totalWeightKg <= 0) return 0;
  return totalCost / kgToArrobas(totalWeightKg);
}

export function calcPurchaseTotalCost(
  animalValue: number,
  freightValue: number,
  commissionValue: number,
  otherCosts: number
): number {
  return animalValue + freightValue + commissionValue + otherCosts;
}

export function calcSaleNetValue(
  animalValue: number,
  freightValue: number,
  commissionValue: number,
  discountValue: number
): number {
  return animalValue - freightValue - commissionValue - discountValue;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
