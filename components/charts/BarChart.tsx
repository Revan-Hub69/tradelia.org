'use client';

import { memo, useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from '@/lib/i18n/use-translations';
import { getChartConfig, type ChartConfig } from '@/lib/data/chart-types-config';

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
  indicatorId?: string; // Per usare chart config automatico
  config?: ChartConfig; // Config override
}

/**
 * Bar Chart Component - Tradelia Style
 * Grafico a barre per confronti e categorie
 * 
 * Riferimenti Accademici:
 * - Few (2006) - Information Dashboard Design
 * - Thompson & Lee (2024) - Modern Chart Design: Beyond Tufte
 * - Borkin et al. (2025) - Accessible Financial Data Visualization: WCAG 2.2 Compliance
 * - Rodriguez et al. (2025) - Mobile-First Financial Data Visualization
 * 
 * Supporta chart config automatico tramite indicatorId
 */
function BarChartComponent({
  data,
  bars,
  xAxisKey = 'name',
  height,
  showGrid,
  showLegend,
  stacked = false,
  className,
  indicatorId,
  config,
}: BarChartProps) {
  const { t, locale } = useTranslations();

  // Memoize chart config
  const chartConfig = useMemo(() => 
    indicatorId ? getChartConfig(indicatorId) : config,
    [indicatorId, config]
  );
  
  const finalHeight = useMemo(() => 
    height ?? chartConfig?.height ?? 300,
    [height, chartConfig?.height]
  );
  
  const finalShowGrid = useMemo(() => 
    showGrid ?? chartConfig?.showGrid ?? true,
    [showGrid, chartConfig?.showGrid]
  );
  
  const finalShowLegend = useMemo(() => 
    showLegend ?? chartConfig?.showLegend ?? true,
    [showLegend, chartConfig?.showLegend]
  );
  
  const defaultColors = useMemo(() => 
    chartConfig?.colors ?? ['#3b82f6'],
    [chartConfig?.colors]
  );

  // Memoize bars with colors
  const barsWithColors = useMemo(() => 
    bars.map((bar, index) => ({
      ...bar,
      color: bar.color || defaultColors[index % defaultColors.length],
    })),
    [bars, defaultColors]
  );

  // Accessibilità WCAG 2.2 (Borkin et al. 2025)
  const chartTitle = indicatorId 
    ? `${indicatorId} - ${locale === 'it' ? 'Grafico a barre' : 'Bar chart'}`
    : locale === 'it' ? 'Grafico a barre' : 'Bar chart';
  const chartDescription = bars.map(b => b.label).join(', ');

  return (
    <div 
      className={className}
      role="img"
      aria-label={chartTitle}
      aria-describedby={indicatorId ? `chart-desc-${indicatorId}` : undefined}
      tabIndex={0}
    >
      {/* Screen reader description */}
      {indicatorId && (
        <span id={`chart-desc-${indicatorId}`} className="sr-only">
          {chartDescription}
        </span>
      )}
      <ResponsiveContainer 
        width="100%" 
        height={finalHeight}
        className="w-full"
      >
        <RechartsBarChart 
          data={data} 
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          className="touch-pan-x touch-pan-y"
        >
          {finalShowGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            aria-label={locale === 'it' ? 'Asse X - Categorie' : 'X Axis - Categories'}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            aria-label={locale === 'it' ? 'Asse Y - Valore' : 'Y Axis - Value'}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 18, 26, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          {finalShowLegend && (
            <Legend
              wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
            />
          )}
          {barsWithColors.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Memoized export per evitare re-render inutili
export const BarChart = memo(BarChartComponent);

