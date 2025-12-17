/**
 * Chart types configuration
 * For now we provide a minimal, extensible mapping of indicatorId -> chart config
 * so components can import `getChartConfig` and `ChartConfig` without build errors.
 */

export type ChartType = 'line' | 'bar' | 'area' | 'candlestick' | 'histogram';

export interface ChartConfig {
  type: ChartType;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

// Default per-indicator chart configs. Populate as needed.
export const CHART_CONFIGS: Record<string, ChartConfig> = {
  // examples (keep conservative defaults)
  'price': { type: 'line', height: 340, showGrid: true, showLegend: false, colors: ['#3b82f6'] },
  'volume': { type: 'bar', height: 200, showGrid: false, showLegend: false, colors: ['#6366f1'] },
};

/**
 * Return the config for a given indicator id, or undefined if not known.
 */
export function getChartConfig(indicatorId: string): ChartConfig | undefined {
  if (!indicatorId) return undefined;
  return CHART_CONFIGS[indicatorId] ?? undefined;
}

export default getChartConfig;
