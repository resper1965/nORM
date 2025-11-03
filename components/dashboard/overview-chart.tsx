"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", total: 4000, revenue: 2400 },
  { name: "Feb", total: 3000, revenue: 1398 },
  { name: "Mar", total: 2000, revenue: 9800 },
  { name: "Apr", total: 2780, revenue: 3908 },
  { name: "May", total: 1890, revenue: 4800 },
  { name: "Jun", total: 2390, revenue: 3800 },
  { name: "Jul", total: 3490, revenue: 4300 },
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          className="text-xs"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--chart-1))"
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--chart-2))"
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

