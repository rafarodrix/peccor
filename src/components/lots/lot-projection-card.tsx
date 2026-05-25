"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calcLotProjection } from "@/lib/projections";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

interface LotProjectionCardProps {
  currentAvgWeight: number;
  currentQuantity: number;
  lastDailyGain: number | null;
  totalCost: number;
}

export function LotProjectionCard({
  currentAvgWeight,
  currentQuantity,
  lastDailyGain,
  totalCost,
}: LotProjectionCardProps) {
  const [targetWeight, setTargetWeight] = useState(480);
  const [pricePerArroba, setPricePerArroba] = useState(310);
  const [dailyGain, setDailyGain] = useState(lastDailyGain ?? 1.2);

  const projection = calcLotProjection({
    currentAvgWeight,
    currentQuantity,
    avgDailyGain: dailyGain,
    targetWeight,
    pricePerArroba,
    totalCost,
  });

  const profitColor =
    projection.projectedProfit >= 0 ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção de Abate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="targetWeight">Peso alvo (kg)</Label>
            <Input
              id="targetWeight"
              type="number"
              min={0}
              step={1}
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pricePerArroba">Preço por arroba (R$)</Label>
            <Input
              id="pricePerArroba"
              type="number"
              min={0}
              step={1}
              value={pricePerArroba}
              onChange={(e) => setPricePerArroba(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dailyGain">GMD (kg/dia)</Label>
            <Input
              id="dailyGain"
              type="number"
              min={0}
              step={0.01}
              value={dailyGain}
              onChange={(e) => setDailyGain(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Results */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Abate estimado</dt>
            <dd className="font-medium">
              {formatDate(projection.slaughterDate)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Dias restantes</dt>
            <dd className="font-medium">{projection.daysToTarget} dias</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Arrobas projetadas</dt>
            <dd className="font-medium">
              {formatNumber(projection.projectedArrobas)} @
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Receita projetada</dt>
            <dd className="font-medium text-green-600">
              {formatCurrency(projection.projectedRevenue)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lucro projetado</dt>
            <dd className={`font-medium ${profitColor}`}>
              {formatCurrency(projection.projectedProfit)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lucro por cabeça</dt>
            <dd className={`font-medium ${profitColor}`}>
              {formatCurrency(projection.projectedProfitPerHead)}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-muted-foreground">Lucro por arroba</dt>
            <dd className={`font-medium ${profitColor}`}>
              {formatCurrency(projection.projectedProfitPerArroba)}/arroba
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
