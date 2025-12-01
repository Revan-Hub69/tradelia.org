'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from '@/lib/i18n/use-translations';

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface LineChartProps {
  data: LineChartData[];
  lines: Array<{
    key: string;
    label: string;
    color?: string;
    strokeWidth?: number;
  }>;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

/**
 * Line Chart Component
 * Grafico a linee per trend e serie temporali
 * Riferimento: Tufte (2001) - Visual Display of Quantitative Information
 */
export function LineChart({
  data,
  lines,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}: LineChartProps) {
  const { t } = useTranslations();

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color || '#3b82f6'}
              strokeWidth={line.strokeWidth || 2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

