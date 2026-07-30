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

interface AnalyticsChartsProps {
  chartData: { date: string; revenue: number; orders: number }[];
  userGrowth: { date: string; users: number }[];
  topSellers: { storeName: string; itemsSold: number }[];
}

export function AnalyticsCharts({
  chartData = [],
  userGrowth = [],
  topSellers = [],
}: AnalyticsChartsProps) {
  const revenueData = (chartData ?? []).map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));
  const growthData = (userGrowth ?? []).map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));
  const sellers = topSellers ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-base">Revenue</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          {revenueData.every((d) => d.revenue === 0) ? (
            <EmptyChart message="No revenue in this period." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  contentStyle={tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="url(#adminRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-base">Orders</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          {revenueData.every((d) => d.orders === 0) ? (
            <EmptyChart message="No orders in this period." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
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
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0), "Orders"]}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="orders" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-base">User growth</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          {growthData.every((d) => d.users === 0) ? (
            <EmptyChart message="No new users in this period." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="adminUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
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
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0), "New users"]}
                  contentStyle={tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0d9488"
                  fill="url(#adminUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-base">Top sellers</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          {!sellers.length ? (
            <EmptyChart message="No seller sales yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sellers.map((s) => ({
                  name:
                    s.storeName.length > 14
                      ? `${s.storeName.slice(0, 14)}…`
                      : s.storeName,
                  qty: s.itemsSold,
                }))}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0), "Items sold"]}
                  contentStyle={tooltipStyle}
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
};
