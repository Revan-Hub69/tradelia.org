'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

export interface AreaChartProps {
  data: AreaChartData[];
  areas: Array<{
    key: string;
    label: string;
    color?: string;
    fillOpacity?: number;
  }>;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
}

/**
 * Area Chart Component
 * Grafico ad area per trend e accumulazione
 * Riferimento: Tufte (2001) - Visual Display of Quantitative Information
 */
export function AreaChart({
  data,
  areas,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className,
}: AreaChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 18, 26, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
            />
          )}
          {areas.map((area, index) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.label}
              stroke={area.color || '#3b82f6'}
              fill={area.color || '#3b82f6'}
              fillOpacity={area.fillOpacity || 0.6}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

