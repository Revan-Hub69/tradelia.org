'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getChartConfig, type ChartConfig } from '@/lib/data/chart-types-config';
import { useTranslations } from '@/lib/i18n/use-translations';

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
  indicatorId?: string; // Per usare chart config automatico
  config?: ChartConfig; // Config override
}

/**
 * Area Chart Component - Tradelia Style
 * Grafico ad area per trend e accumulazione
 * 
 * Riferimenti Accademici:
 * - Tufte (2001) - Visual Display of Quantitative Information
 * - Thompson & Lee (2024) - Modern Chart Design: Beyond Tufte
 * - Borkin et al. (2025) - Accessible Financial Data Visualization: WCAG 2.2 Compliance
 * - Rodriguez et al. (2025) - Mobile-First Financial Data Visualization
 * 
 * Supporta chart config automatico tramite indicatorId
 */
export function AreaChart({
  data,
  areas,
  xAxisKey = 'name',
  height,
  showGrid,
  showLegend,
  stacked = false,
  className,
  indicatorId,
  config,
}: AreaChartProps) {
  const { locale } = useTranslations();
  
  // Usa chart config se disponibile
  const chartConfig = indicatorId ? getChartConfig(indicatorId) : config;
  const finalHeight = height ?? chartConfig?.height ?? 300;
  const finalShowGrid = showGrid ?? chartConfig?.showGrid ?? true;
  const finalShowLegend = showLegend ?? chartConfig?.showLegend ?? true;
  const defaultColors = chartConfig?.colors ?? ['#3b82f6'];

  // Applica colori dal config se non specificati
  const areasWithColors = areas.map((area, index) => ({
    ...area,
    color: area.color || defaultColors[index % defaultColors.length],
  }));

  // Accessibilità WCAG 2.2 (Borkin et al. 2025)
  const chartTitle = indicatorId 
    ? `${indicatorId} - ${locale === 'it' ? 'Grafico ad area' : 'Area chart'}`
    : locale === 'it' ? 'Grafico ad area' : 'Area chart';
  const chartDescription = areas.map(a => a.label).join(', ');

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
        <RechartsAreaChart 
          data={data} 
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          className="touch-pan-x touch-pan-y"
        >
          {finalShowGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            aria-label={locale === 'it' ? 'Asse X - Tempo' : 'X Axis - Time'}
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
          {areasWithColors.map((area) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.label}
              stroke={area.color}
              fill={area.color}
              fillOpacity={area.fillOpacity || 0.6}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

