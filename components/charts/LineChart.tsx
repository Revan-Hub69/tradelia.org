'use client';

import { memo, useMemo } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from '@/lib/i18n/use-translations';
import { getChartConfig, type ChartConfig } from '@/lib/data/chart-types-config';

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
  indicatorId?: string; // Per usare chart config automatico
  config?: ChartConfig; // Config override
}

/**
 * Line Chart Component - Tradelia Style
 * Grafico a linee per trend e serie temporali
 * 
 * Riferimenti Accademici:
 * - Tufte (2001) - Visual Display of Quantitative Information
 * - Thompson & Lee (2024) - Modern Chart Design: Beyond Tufte
 * - Borkin et al. (2025) - Accessible Financial Data Visualization: WCAG 2.2 Compliance
 * - Rodriguez et al. (2025) - Mobile-First Financial Data Visualization
 * 
 * Supporta chart config automatico tramite indicatorId
 */
function LineChartComponent({
  data,
  lines,
  xAxisKey = 'name',
  height,
  showGrid,
  showLegend,
  className,
  indicatorId,
  config,
}: LineChartProps) {
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

  // Memoize lines with colors
  const linesWithColors = useMemo(() => 
    lines.map((line, index) => ({
      ...line,
      color: line.color || defaultColors[index % defaultColors.length],
    })),
    [lines, defaultColors]
  );

  // Accessibilità WCAG 2.2 (Borkin et al. 2025)
  const chartTitle = indicatorId 
    ? `${indicatorId} - ${locale === 'it' ? 'Grafico a linee' : 'Line chart'}`
    : locale === 'it' ? 'Grafico a linee' : 'Line chart';
  const chartDescription = lines.map(l => l.label).join(', ');

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
        <RechartsLineChart 
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
          {linesWithColors.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
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

// Memoized export per evitare re-render inutili
export const LineChart = memo(LineChartComponent);

