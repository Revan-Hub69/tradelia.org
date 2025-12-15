/**
 * Heatmap Chart Component
 * 
 * Visualizzazione heatmap per correlazioni, market cap, performance
 * 
 * Riferimenti Accademici:
 * - Wilkinson & Friendly (2009) - "The History of the Cluster Heat Map"
 * - Few (2006) - "Information Dashboard Design"
 * - Bostock et al. (2011) - "D3.js: Data-Driven Documents"
 */

'use client';

import { useMemo } from 'react';

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
  label?: string;
}

export interface HeatmapChartProps {
  data: HeatmapData[];
  xLabels?: string[];
  yLabels?: string[];
  colorScale?: 'sequential' | 'diverging' | 'categorical';
  height?: number;
  showLegend?: boolean;
  className?: string;
}

/**
 * Heatmap Chart - Tradelia Style
 * 
 * Supporta:
 * - Correlation matrices
 * - Market cap heatmaps
 * - Performance heatmaps
 * - Custom color scales
 */
export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  colorScale = 'sequential',
  height = 400,
  showLegend = true,
  className = '',
}: HeatmapChartProps) {
  // Estrai labels se non forniti
  const finalXLabels = useMemo(() => {
    if (xLabels) return xLabels;
    const unique = [...new Set(data.map((d) => d.x))];
    return unique.sort();
  }, [data, xLabels]);

  const finalYLabels = useMemo(() => {
    if (yLabels) return yLabels;
    const unique = [...new Set(data.map((d) => d.y))];
    return unique.sort();
  }, [data, yLabels]);

  // Crea matrice dati
  const dataMatrix = useMemo(() => {
    const matrix: Map<string, number> = new Map();
    data.forEach((d) => {
      matrix.set(`${d.x}-${d.y}`, d.value);
    });
    return matrix;
  }, [data]);

  // Calcola min/max per color scale
  const { min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data]);

  // Funzione per ottenere colore
  const getColor = (value: number): string => {
    const normalized = (value - min) / (max - min);

    if (colorScale === 'diverging') {
      // Diverging: rosso (negativo) -> bianco -> verde (positivo)
      if (value < 0) {
        const intensity = Math.min(1, Math.abs(value) / Math.abs(min));
        return `rgb(${255}, ${255 - intensity * 200}, ${255 - intensity * 200})`;
      } else {
        const intensity = Math.min(1, value / max);
        return `rgb(${255 - intensity * 200}, ${255}, ${255 - intensity * 200})`;
      }
    } else if (colorScale === 'categorical') {
      // Categorical: colori distinti
      const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // purple
        '#ec4899', // pink
      ];
      const index = Math.floor(normalized * (colors.length - 1));
      return colors[index];
    } else {
      // Sequential: blu chiaro -> blu scuro
      const intensity = Math.floor(normalized * 255);
      return `rgb(${intensity}, ${intensity + 50}, 255)`;
    }
  };

  // Calcola dimensioni celle
  const cellWidth = useMemo(() => {
    return Math.max(40, Math.floor(600 / finalXLabels.length));
  }, [finalXLabels.length]);

  const cellHeight = useMemo(() => {
    return Math.max(30, Math.floor(height / finalYLabels.length));
  }, [finalYLabels.length, height]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      {showLegend && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Min: {min.toFixed(2)}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => {
                const value = min + (max - min) * (i / 9);
                return (
                  <div
                    key={i}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getColor(value) }}
                    title={value.toFixed(2)}
                  />
                );
              })}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Max: {max.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Y-axis labels */}
          <div className="flex">
            <div className="w-24 flex-shrink-0" />
            <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${finalXLabels.length}, minmax(${cellWidth}px, 1fr))` }}>
              {finalXLabels.map((label) => (
                <div
                  key={label}
                  className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap cells */}
          <div className="flex gap-1 mt-2">
            {/* Y-axis labels */}
            <div className="w-24 flex-shrink-0 flex flex-col gap-1">
              {finalYLabels.map((label) => (
                <div
                  key={label}
                  className="text-xs text-right text-gray-600 dark:text-gray-400 font-medium h-full flex items-center justify-end pr-2"
                  style={{ height: `${cellHeight}px` }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cells grid */}
            <div
              className="flex-1 grid gap-1"
              style={{ gridTemplateColumns: `repeat(${finalXLabels.length}, minmax(${cellWidth}px, 1fr))` }}
            >
              {finalYLabels.map((yLabel) =>
                finalXLabels.map((xLabel) => {
                  const value = dataMatrix.get(`${xLabel}-${yLabel}`) ?? 0;
                  const cellData = data.find((d) => d.x === xLabel && d.y === yLabel);

                  return (
                    <div
                      key={`${xLabel}-${yLabel}`}
                      className="rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: getColor(value),
                        minHeight: `${cellHeight}px`,
                      }}
                      title={cellData?.label || `${xLabel} × ${yLabel}: ${value.toFixed(2)}`}
                      role="img"
                      aria-label={`${xLabel} × ${yLabel}: ${value.toFixed(2)}`}
                    >
                      {value !== 0 && (
                        <span className="text-xs font-semibold">
                          {Math.abs(value) < 0.01 ? value.toExponential(1) : value.toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

