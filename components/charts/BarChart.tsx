'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from '@/lib/i18n/use-translations';

export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartData[];
  bars: Array<{
    key: string;
    label: string;
    color?: string;
  }>;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
}

/**
 * Bar Chart Component
 * Grafico a barre per confronti e categorie
 * Riferimento: Few (2006) - Information Dashboard Design
 */
export function BarChart({
  data,
  bars,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className,
}: BarChartProps) {
  const { t } = useTranslations();

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color || '#3b82f6'}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

