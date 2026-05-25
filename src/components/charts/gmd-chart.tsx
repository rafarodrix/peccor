"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

interface GmdDataPoint {
  date: string;
  dailyGain: number;
}

interface Props {
  data: GmdDataPoint[];
  target?: number;
}

export function GmdChart({ data, target = 1.2 }: Props) {
  if (data.length < 1) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Nenhum dado de GMD disponível ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit=" kg/d" width={64} />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(3)} kg/d`, "GMD"]}
          labelStyle={{ fontWeight: 600 }}
        />
        <ReferenceLine y={target} stroke="hsl(47.9 95.8% 53.1%)" strokeDasharray="4 4" label={{ value: `Meta ${target}`, fontSize: 11 }} />
        <Bar dataKey="dailyGain" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.dailyGain >= target
                  ? "hsl(142.1 76.2% 36.3%)"
                  : entry.dailyGain >= 0.8
                  ? "hsl(47.9 95.8% 53.1%)"
                  : "hsl(0 84.2% 60.2%)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
