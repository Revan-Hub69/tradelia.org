'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartData[];
  height?: number;
  showLegend?: boolean;
  showLabel?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

/**
 * Pie Chart Component
 * Grafico a torta per proporzioni e allocazioni
 * Riferimento: Few (2006) - Information Dashboard Design
 */
export function PieChart({
  data,
  height = 300,
  showLegend = true,
  showLabel = false,
  className,
}: PieChartProps) {
  const colors = data.map((d, i) => d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]);

  const renderLabel = (entry: PieChartData) => {
    if (!showLabel) return null;
    const percent = ((entry.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={height / 3}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 18, 26, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => {
              const total = data.reduce((sum, d) => sum + d.value, 0);
              const percent = ((value / total) * 100).toFixed(1);
              return [`${value} (${percent}%)`, 'Valore'];
            }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

