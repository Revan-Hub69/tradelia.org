/**
 * Chart Types Configuration - Ottimizzazione Chart per Indicatori
 * 
 * Definisce il tipo di chart ottimale per ogni indicatore implementato
 * Basato su ricerca accademica in data visualization (Tufte, Few, Cleveland & McGill)
 */

export type ChartType = 'line' | 'bar' | 'area' | 'candlestick' | 'gauge' | 'heatmap' | 'scatter' | 'tachograph' | 'radar' | 'waterfall' | 'sparkline';

export interface ChartConfig {
  type: ChartType;
  height: number;
  showGrid: boolean;
  showLegend: boolean;
  colors: string[];
  animation?: boolean;
  responsive?: boolean;
}

/**
 * Configurazione chart per ogni indicatore
 */
export const INDICATOR_CHART_CONFIG: Record<string, ChartConfig> = {
  // Stock & Market
  'vix': {
    type: 'tachograph', // Tufte: Circular gauge per valori singoli con range
    height: 300,
    showGrid: false,
    showLegend: false,
    colors: ['#10b981', '#f59e0b', '#ef4444'], // Verde (basso) -> Giallo -> Rosso (alto)
    animation: true,
    responsive: true,
  },
  'stock-indexes': {
    type: 'bar', // Few: Bar charts per confronti multi-categoria
    height: 320,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Blue, Purple, Green
    animation: true,
    responsive: true,
  },
  'yield-curve': {
    type: 'line', // Standard accademico per yield curve (Estrella & Mishkin 1998)
    height: 350,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6'], // Multiple lines
    animation: true,
    responsive: true,
  },
  'credit-spreads': {
    type: 'bar', // Few: Bar charts per spread comparisons
    height: 300,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#f59e0b', '#ef4444'], // Tight -> Medium -> Wide
    animation: true,
    responsive: true,
  },
  'put-call-ratio': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#ef4444', '#10b981'], // Red (Put), Green (Call)
    animation: true,
    responsive: true,
  },
  'vix-term-structure': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Multiple lines
    animation: true,
    responsive: true,
  },
  
  // Economic & Macro
  'economic': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], // Multiple indicators
    animation: true,
    responsive: true,
  },
  'bond-yields': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6'], // 10Y, 2Y
    animation: true,
    responsive: true,
  },
  
  // Crypto
  'bitcoin-dominance': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#f59e0b'], // Orange (Bitcoin)
    animation: true,
    responsive: true,
  },
  'crypto-market-cap': {
    type: 'area',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#3b82f6'], // Blue
    animation: true,
    responsive: true,
  },
  'fear-greed': {
    type: 'gauge',
    height: 280,
    showGrid: false,
    showLegend: false,
    colors: ['#ef4444', '#f59e0b', '#10b981'], // Red, Yellow, Green
    animation: true,
    responsive: true,
  },
  'whale-analysis': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#8b5cf6', '#3b82f6'], // Purple, Blue
    animation: true,
    responsive: true,
  },
  'exchange-flows': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#ef4444', '#10b981'], // Red (Outflow), Green (Inflow)
    animation: true,
    responsive: true,
  },
  'top-400-depth': { // Heer & Bostock: Heatmap per matrici depth
    type: 'heatmap',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#f59e0b', '#ef4444'], // Green, Yellow, Red
    animation: true,
    responsive: true,
  },
  'top-movers': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#10b981', '#ef4444'], // Green (Up), Red (Down)
    animation: true,
    responsive: true,
  },
  'aggregated-depth': {
    type: 'area',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6'], // Blue, Purple
    animation: true,
    responsive: true,
  },
  'multi-exchange-depth': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Multiple exchanges
    animation: true,
    responsive: true,
  },
  'top-400-monitor': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6'], // Blue, Purple
    animation: true,
    responsive: true,
  },
  'social-sentiment': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#8b5cf6'], // Purple
    animation: true,
    responsive: true,
  },
  'trending': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#f59e0b'], // Orange
    animation: true,
    responsive: true,
  },
  'developer-activity': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#10b981'], // Green
    animation: true,
    responsive: true,
  },
  'l400-history': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6'], // Blue, Purple
    animation: true,
    responsive: true,
  },
  
  // Forex
  'forex': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], // Multiple pairs
    animation: true,
    responsive: true,
  },
  
  // Commodity
  'commodities': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#f59e0b', '#ef4444', '#8b5cf6'], // Gold, Oil, Silver
    animation: true,
    responsive: true,
  },
  
  // Market Events
  'ipo-calendar': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#3b82f6'], // Blue
    animation: true,
    responsive: true,
  },
  'corporate-events': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Multiple event types
    animation: true,
    responsive: true,
  },
  'sentiment': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#8b5cf6'], // Purple
    animation: true,
    responsive: true,
  },
  'data': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // Blue
    animation: true,
    responsive: true,
  },
  // Composite Indicators
  'market-breadth': {
    type: 'bar', // Few: Bar charts per confronti categoriali
    height: 300,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // Green (Advances) vs Red (Declines)
    animation: true,
    responsive: true,
  },
  'mcclellan-oscillator': {
    type: 'line', // Tufte: Line charts per oscillatori
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6'], // Blue (Oscillator), Purple (Summation)
    animation: true,
    responsive: true,
  },
  'arms-index': {
    type: 'line', // Cleveland & McGill: Line charts per serie temporali
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#f59e0b'], // Orange
    animation: true,
    responsive: true,
  },
  'momentum-composite': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], // Multiple indicators
    animation: true,
    responsive: true,
  },
  'volatility-composite': {
    type: 'area',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#ef4444', '#f59e0b', '#3b82f6'], // Red, Yellow, Blue
    animation: true,
    responsive: true,
  },
  // Global Markets
  'european-indexes': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'], // Multiple countries
    animation: true,
    responsive: true,
  },
  'asian-indexes': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'], // Multiple countries
    animation: true,
    responsive: true,
  },
  'etf-sectoral': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#14b8a6'], // Multiple sectors
    animation: true,
    responsive: true,
  },
  'short-interest': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#ef4444'], // Red (bearish indicator)
    animation: true,
    responsive: true,
  },
  'dxy': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#3b82f6'], // Blue
    animation: true,
    responsive: true,
  },
  'sentiment-composite': {
    type: 'gauge',
    height: 280,
    showGrid: false,
    showLegend: false,
    colors: ['#ef4444', '#f59e0b', '#10b981'], // Red, Yellow, Green
    animation: true,
    responsive: true,
  },
  'emerging-markets': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Multiple countries
    animation: true,
    responsive: true,
  },
  'etf-geographic': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], // Multiple regions
    animation: true,
    responsive: true,
  },
  'nvt-ratio': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#f59e0b'], // Orange
    animation: true,
    responsive: true,
  },
  'mvrv-ratio': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#8b5cf6'], // Purple
    animation: true,
    responsive: true,
  },
  'active-addresses': {
    type: 'area',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981'], // Green
    animation: true,
    responsive: true,
  },
  'commodity-rotation': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#f59e0b', '#ef4444', '#8b5cf6'], // Gold, Oil, Silver
    animation: true,
    responsive: true,
  },
  'futures-term-structure': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Multiple futures
    animation: true,
    responsive: true,
  },
  'leading-economic-indicators': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // LEI, CEI, LAG
    animation: true,
    responsive: true,
  },
  'pmi': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Manufacturing, Services, Composite
    animation: true,
    responsive: true,
  },
  'etf-rotations': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'], // Multiple sectors/regions
    animation: true,
    responsive: true,
  },
  'cot-reports': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // Long, Short
    animation: true,
    responsive: true,
  },
  'economic-calendar': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], // Multiple event types
    animation: true,
    responsive: true,
  },
  'insider-trading': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // Buy, Sell
    animation: true,
    responsive: true,
  },
  'technical-indicators': {
    type: 'line',
    height: 320,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], // RSI, MACD, Stochastic, BB, SMA
    animation: true,
    responsive: true,
  },
  'aaii-sentiment': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444', '#6b7280'], // Bullish, Bearish, Neutral
    animation: true,
    responsive: true,
  },
  'high-low-index': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#10b981', '#ef4444'], // Index, New Highs, New Lows
    animation: true,
    responsive: true,
  },
  'money-flow-index': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // MFI
    animation: true,
    responsive: true,
  },
  'on-balance-volume': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // OBV, OBV Change
    animation: true,
    responsive: true,
  },
  'williams-r': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // Williams %R
    animation: true,
    responsive: true,
  },
  'commodity-channel-index': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#8b5cf6'], // CCI
    animation: true,
    responsive: true,
  },
  'average-true-range': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#f59e0b'], // ATR
    animation: true,
    responsive: true,
  },
  'advance-decline-line': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // A/D Line
    animation: true,
    responsive: true,
  },
  'italian-indexes': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6'], // FTSE MIB, FTSE Italia All-Share
    animation: true,
    responsive: true,
  },
  'exchange-reserves': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#f59e0b', '#8b5cf6'], // BTC, ETH
    animation: true,
    responsive: true,
  },
  'consumer-confidence': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // CCI
    animation: true,
    responsive: true,
  },
  'retail-sales': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981'], // Retail Sales
    animation: true,
    responsive: true,
  },
  'industrial-production': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#8b5cf6'], // IP
    animation: true,
    responsive: true,
  },
  'parabolic-sar': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#ef4444'], // Price, SAR
    animation: true,
    responsive: true,
  },
  'adx': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#10b981', '#ef4444'], // ADX, +DI, -DI
    animation: true,
    responsive: true,
  },
  'funding-rates': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#f59e0b', '#8b5cf6'], // BTC, ETH
    animation: true,
    responsive: true,
  },
  'long-short-ratio': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // Long, Short
    animation: true,
    responsive: true,
  },
  'rate-of-change': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // ROC
    animation: true,
    responsive: true,
  },
  'chaikin-money-flow': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#8b5cf6'], // CMF
    animation: true,
    responsive: true,
  },
  'accumulation-distribution': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // A/D Line, A/D Change
    animation: true,
    responsive: true,
  },
  'percentage-price-oscillator': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // PPO, Signal, Histogram
    animation: true,
    responsive: true,
  },
  'ichimoku-cloud': {
    type: 'line',
    height: 320,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], // Price, Tenkan, Kijun, Span A, Span B
    animation: true,
    responsive: true,
  },
  'stablecoin-supply-ratio': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // SSR
    animation: true,
    responsive: true,
  },
  'global-pmi': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981'], // Manufacturing, Services, Composite
    animation: true,
    responsive: true,
  },
  'global-inflation': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], // US, EU, China, Japan
    animation: true,
    responsive: true,
  },
  'global-central-bank-rates': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], // Fed, ECB, BOJ, BOE, PBOC
    animation: true,
    responsive: true,
  },
  'currency-strength-index': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'], // USD, EUR, GBP, JPY, CHF, CAD, AUD
    animation: true,
    responsive: true,
  },
  'order-flow-imbalance': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // Buy Volume, Sell Volume
    animation: true,
    responsive: true,
  },
  'cumulative-delta': {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6'], // Cumulative Delta
    animation: true,
    responsive: true,
  },
  'fibonacci-retracements': {
    type: 'line',
    height: 320,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'], // Multiple Fibonacci levels
    animation: true,
    responsive: true,
  },
  'exchange-netflows': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#10b981', '#ef4444'], // Inflows, Outflows
    animation: true,
    responsive: true,
  },
  'support-resistance-levels': {
    type: 'line',
    height: 320,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#10b981', '#ef4444'], // Price, Support, Resistance
    animation: true,
    responsive: true,
  },
  'crypto-correlation-matrix': { // Heer & Bostock: Heatmaps optimal per correlation matrices
    type: 'heatmap',
    height: 400,
    showGrid: false,
    showLegend: true,
    colors: ['#ef4444', '#f59e0b', '#10b981'], // Rosso (neg) -> Giallo -> Verde (pos)
    animation: true,
    responsive: true,
  },
  'european-economic-indicators': {
    type: 'bar',
    height: 280,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], // GDP, CPI, Unemployment, ECB Rate, PMI
    animation: true,
    responsive: true,
  },
  'volume-profile': {
    type: 'bar',
    height: 320,
    showGrid: true,
    showLegend: true,
    colors: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'], // Volume, POC, VAH, VAL
    animation: true,
    responsive: true,
  },
};

/**
 * Ottiene la configurazione chart per un indicatore
 */
export function getChartConfig(indicatorId: string): ChartConfig {
  return INDICATOR_CHART_CONFIG[indicatorId] || {
    type: 'line',
    height: 280,
    showGrid: true,
    showLegend: false,
    colors: ['#3b82f6'],
    animation: true,
    responsive: true,
  };
}
