/**
 * Scatter Chart Component
 * 
 * Visualizzazione scatter plot per correlazioni, regressioni, distribuzioni
 * 
 * Riferimenti Accademici:
 * - Tufte (2001) - "The Visual Display of Quantitative Information"
 * - Cleveland (1993) - "Visualizing Data"
 * - Wickham (2016) - "ggplot2: Elegant Graphics for Data Analysis"
 */

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { LineChart, LineChartData } from './LineChart';

export interface ScatterDataPoint {
  x: number;
  y: number;
  label?: string;
  category?: string;
  size?: number;
  color?: string;
}

export interface ScatterChartProps {
  data: ScatterDataPoint[];
  xLabel?: string;
  yLabel?: string;
  showTrendLine?: boolean;
  showGrid?: boolean;
  height?: number;
  className?: string;
}

/**
 * Scatter Chart - Tradelia Style
 * 
 * Supporta:
 * - Correlation analysis
 * - Regression visualization
 * - Multi-category scatter
 * - Trend line overlay
 */
export function ScatterChart({
  data,
  xLabel = 'X',
  yLabel = 'Y',
  showTrendLine = false,
  showGrid = true,
  height = 400,
  className = '',
}: ScatterChartProps) {
  const { t } = useTranslations();

  // Calcola bounds
  const bounds = useMemo(() => {
    if (data.length === 0) {
      return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
    }

    const xValues = data.map((d) => d.x);
    const yValues = data.map((d) => d.y);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Aggiungi padding
    const xPadding = (xMax - xMin) * 0.1;
    const yPadding = (yMax - yMin) * 0.1;

    return {
      xMin: xMin - xPadding,
      xMax: xMax + xPadding,
      yMin: yMin - yPadding,
      yMax: yMax + yPadding,
    };
  }, [data]);

  // Calcola trend line (linear regression)
  const trendLine = useMemo(() => {
    if (!showTrendLine || data.length < 2) return null;

    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Genera punti per trend line
    const trendPoints: LineChartData[] = [
      {
        name: bounds.xMin.toString(),
        value: slope * bounds.xMin + intercept,
      },
      {
        name: bounds.xMax.toString(),
        value: slope * bounds.xMax + intercept,
      },
    ];

    return { slope, intercept, points: trendPoints };
  }, [data, showTrendLine, bounds]);

  // Raggruppa per categoria
  const categories = useMemo(() => {
    const cats = new Set(data.map((d) => d.category).filter(Boolean));
    return Array.from(cats);
  }, [data]);

  // Colori per categoria
  const categoryColors = useMemo(() => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];

    const colorMap: Record<string, string> = {};
    categories.forEach((cat, index) => {
      colorMap[cat] = colors[index % colors.length];
    });

    return colorMap;
  }, [categories]);

  // Normalizza coordinate per rendering
  const normalizeX = (x: number): number => {
    return ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * 100;
  };

  const normalizeY = (y: number): number => {
    return 100 - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * 100;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Grid */}
        {showGrid && (
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            {/* Vertical grid lines */}
            {Array.from({ length: 5 }).map((_, i) => {
              const x = (i / 4) * 100;
              return (
                <line
                  key={`v-${i}`}
                  x1={`${x}%`}
                  y1="0%"
                  x2={`${x}%`}
                  y2="100%"
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth={1}
                />
              );
            })}

            {/* Horizontal grid lines */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = (i / 4) * 100;
              return (
                <line
                  key={`h-${i}`}
                  x1="0%"
                  y1={`${y}%`}
                  x2="100%"
                  y2={`${y}%`}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        )}

        {/* Trend line */}
        {trendLine && (
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <line
              x1={`${normalizeX(bounds.xMin)}%`}
              y1={`${normalizeY(trendLine.slope * bounds.xMin + trendLine.intercept)}%`}
              x2={`${normalizeX(bounds.xMax)}%`}
              y2={`${normalizeY(trendLine.slope * bounds.xMax + trendLine.intercept)}%`}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
            />
          </svg>
        )}

        {/* Scatter points */}
        <svg className="absolute inset-0 w-full h-full">
          {data.map((point, index) => {
            const x = normalizeX(point.x);
            const y = normalizeY(point.y);
            const size = point.size || 6;
            const color = point.color || point.category ? categoryColors[point.category || ''] : '#3b82f6';

            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r={size}
                fill={color}
                opacity={0.7}
                className="cursor-pointer hover:opacity-100 transition-opacity"
                title={point.label || `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`}
              />
            );
          })}
        </svg>

        {/* Axes labels */}
        <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-gray-600 dark:text-gray-400">
          {xLabel}
        </div>
        <div
          className="absolute top-0 bottom-0 left-0 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {yLabel}
        </div>
      </div>

      {/* Legend */}
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: categoryColors[cat] }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{cat}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

