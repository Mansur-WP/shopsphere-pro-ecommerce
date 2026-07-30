"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface SalesChartProps {
  data: { date: string; revenue: number; orders: number }[];
  topProducts?: { name: string; quantitySold: number }[];
}

export function SalesChart({ data, topProducts = [] }: SalesChartProps) {
  const chartData = data.map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="border-border/70 lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-heading text-base">Revenue over time</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          {chartData.every((d) => d.revenue === 0) ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No sales in this period yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    "Revenue",
                  ]}
                  labelFormatter={(label) => `Day ${label}`}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="url(#revenueFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Best selling products
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          {!topProducts.length ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No product sales yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts.map((p) => ({
                  name:
                    p.name.length > 14 ? `${p.name.slice(0, 14)}…` : p.name,
                  qty: p.quantitySold,
                }))}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0), "Units sold"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="qty" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
