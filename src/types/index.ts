export type {
  User,
  Tenant,
  TenantUser,
  Farm,
  FarmArea,
  CattleLot,
  Animal,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  Weighing,
  Cost,
  HealthEvent,
  AnimalMovement,
  Subscription,
  TenantRole,
  SaaSPlan,
  FarmOperation,
  FarmAreaType,
  CattlePhase,
  LotStatus,
  AnimalSex,
  AnimalCategory,
  AnimalStatus,
  CostType,
  CostCategory,
  CostStatus,
  HealthEventType,
} from "@prisma/client";

export interface DashboardStats {
  activeAnimals: number;
  soldAnimals: number;
  deadAnimals: number;
  activeLots: number;
  avgWeight: number;
  avgDailyGain: number;
  monthlyCost: number;
  costPerHeadDay: number;
  monthlyRevenue: number;
  projectedProfit: number;
}

export interface LotSummary {
  id: string;
  code: string;
  description: string | null;
  phase: string;
  farmName: string;
  areaName: string | null;
  currentQuantity: number;
  currentAvgWeight: number | null;
  totalCost: number;
  avgDailyGain: number | null;
  status: string;
}
