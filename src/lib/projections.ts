export interface LotProjection {
  daysToTarget: number;
  slaughterDate: Date;
  projectedWeight: number;
  projectedArrobas: number;
  projectedRevenue: number;
  projectedProfit: number;
  projectedProfitPerHead: number;
  projectedProfitPerArroba: number;
}

export function calcLotProjection(params: {
  currentAvgWeight: number;
  currentQuantity: number;
  avgDailyGain: number;
  targetWeight: number;
  pricePerArroba: number;
  totalCost: number;
}): LotProjection {
  const {
    currentAvgWeight,
    currentQuantity,
    avgDailyGain,
    targetWeight,
    pricePerArroba,
    totalCost,
  } = params;

  const daysToTarget =
    avgDailyGain > 0
      ? Math.max(0, Math.ceil((targetWeight - currentAvgWeight) / avgDailyGain))
      : 0;

  const slaughterDate = new Date(Date.now() + daysToTarget * 86400000);

  const projectedWeight = targetWeight;
  const projectedArrobas = (targetWeight / 15) * currentQuantity;
  const projectedRevenue = projectedArrobas * pricePerArroba;
  const projectedProfit = projectedRevenue - totalCost;
  const projectedProfitPerHead =
    currentQuantity > 0 ? projectedProfit / currentQuantity : 0;
  const projectedProfitPerArroba =
    projectedArrobas > 0 ? projectedProfit / projectedArrobas : 0;

  return {
    daysToTarget,
    slaughterDate,
    projectedWeight,
    projectedArrobas,
    projectedRevenue,
    projectedProfit,
    projectedProfitPerHead,
    projectedProfitPerArroba,
  };
}
