'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReputationTrendChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
  isLoading?: boolean;
}

export function ReputationTrendChart({ data, isLoading }: ReputationTrendChartProps) {
  const chartColor = 'hsl(var(--primary))';
  const gridColor = 'hsl(var(--border))';
  const tickColor = 'hsl(var(--muted-foreground))';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reputation Trend</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="animate-pulse h-64 rounded bg-muted/30"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reputation Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No trend data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reputation Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
              tick={{ fill: tickColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
              formatter={(value: number) => [value.toFixed(1), 'Score']}
              contentStyle={{ backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', borderRadius: 12, borderColor: 'hsl(var(--border))' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={chartColor}
              strokeWidth={2}
              dot={{ r: 4, fill: chartColor }}
              activeDot={{ r: 6, fill: chartColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

