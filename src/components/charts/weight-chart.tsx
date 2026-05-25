"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface WeightDataPoint {
  date: string;
  weight: number;
  dailyGain?: number | null;
}

interface Props {
  data: WeightDataPoint[];
  targetGain?: number;
}

export function WeightChart({ data, targetGain = 1.2 }: Props) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Registre ao menos 2 pesagens para visualizar a evolução.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit=" kg" width={64} />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)} kg`, "Peso"]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="hsl(142.1 76.2% 36.3%)"
          strokeWidth={2}
          dot={{ r: 4, fill: "hsl(142.1 76.2% 36.3%)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
