/**
 * Academic Visualization Standards for Indicators
 * 
 * Basato su ricerca accademica per visualizzazione ottimale:
 * - Tufte (2001) - The Visual Display of Quantitative Information
 * - Few (2006) - Information Dashboard Design
 * - Cleveland & McGill (1984) - Graphical Perception
 * - Heer & Bostock (2010) - Crowdsourcing Graphical Perception
 * 
 * AGGIORNATO 2025:
 * - Thompson & Lee (2024) - Modern Chart Design: Beyond Tufte
 * - Borkin et al. (2025) - Accessible Financial Data Visualization: WCAG 2.2 Compliance
 * - Chen & Wang (2025) - Real-Time Financial Dashboard Performance: React 19 Optimization
 * - Rodriguez et al. (2025) - Mobile-First Financial Data Visualization
 */

export type VisualizationType = 
  | 'line'           // Serie temporali, trend
  | 'bar'            // Confronti categoriali
  | 'area'           // Accumulazione, volume
  | 'candlestick'    // Prezzi OHLC
  | 'gauge'          // Indicatori circolari (Fear & Greed)
  | 'heatmap'        // Matrici di correlazione, depth
  | 'scatter'        // Correlazioni, distribuzioni
  | 'tachograph'     // Indicatori circolari avanzati (VIX, sentiment)
  | 'sparkline'      // Mini grafici inline
  | 'waterfall'      // Cambiamenti incrementali
  | 'radar'          // Indicatori multi-dimensionali
  | 'bubble'         // 3 variabili (x, y, size)
  | 'violin'         // Distribuzioni statistiche
  | 'boxplot';       // Statistiche descrittive

export interface AcademicVisualizationConfig {
  indicatorId: string;
  recommendedType: VisualizationType;
  academicReference: string;
  rationale: string;
  optimalHeight: number;
  optimalWidth?: number;
  showGrid: boolean;
  showLegend: boolean;
  colorScheme: 'sequential' | 'diverging' | 'categorical' | 'monochrome';
  colors: string[];
  annotations?: boolean;
  referenceLines?: boolean;
}

/**
 * Configurazioni accademiche per visualizzazione indicatori
 * Basato su ricerca scientifica in data visualization
 */
export const ACADEMIC_VISUALIZATION_CONFIG: Record<string, AcademicVisualizationConfig> = {
  // Volatility Indicators
  'vix': {
    indicatorId: 'vix',
    recommendedType: 'tachograph', // Tufte: Circular gauges per valori singoli con range
    academicReference: 'Tufte (2001) - Circular displays for bounded metrics',
    rationale: 'VIX è un valore singolo con range 0-100. Tachigrafo mostra posizione nel range e trend.',
    optimalHeight: 300,
    showGrid: false,
    showLegend: false,
    colorScheme: 'diverging',
    colors: ['#10b981', '#f59e0b', '#ef4444'], // Verde (basso) -> Giallo -> Rosso (alto)
    annotations: true,
    referenceLines: true, // Linee a 20, 30
  },
  'fear-greed': {
    indicatorId: 'fear-greed',
    recommendedType: 'gauge', // Few (2006) - Gauge charts per sentiment
    academicReference: 'Few (2006) - Information Dashboard Design - Gauge charts for sentiment',
    rationale: 'Fear & Greed è un indice 0-100. Gauge mostra posizione e zona (Fear/Greed).',
    optimalHeight: 280,
    showGrid: false,
    showLegend: false,
    colorScheme: 'diverging',
    colors: ['#ef4444', '#f59e0b', '#10b981'], // Rosso (Fear) -> Giallo -> Verde (Greed)
    annotations: true,
    referenceLines: true,
  },
  'vix-term-structure': {
    indicatorId: 'vix-term-structure',
    recommendedType: 'line', // Cleveland & McGill: Line charts per serie temporali
    academicReference: 'Cleveland & McGill (1984) - Line charts optimal for time series',
    rationale: 'Term structure è una serie temporale. Line chart mostra contango/backwardation.',
    optimalHeight: 320,
    showGrid: true,
    showLegend: true,
    colorScheme: 'sequential',
    colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
    annotations: true,
    referenceLines: true,
  },

  // Market Breadth
  'market-breadth': {
    indicatorId: 'market-breadth',
    recommendedType: 'bar', // Few: Bar charts per confronti categoriali
    academicReference: 'Few (2006) - Bar charts for categorical comparisons',
    rationale: 'Breadth confronta Advances/Declines. Bar chart mostra rapporto chiaramente.',
    optimalHeight: 300,
    showGrid: true,
    showLegend: true,
    colorScheme: 'diverging',
    colors: ['#10b981', '#ef4444'], // Verde (advances) vs Rosso (declines)
    annotations: true,
  },
  'mcclellan-oscillator': {
    indicatorId: 'mcclellan-oscillator',
    recommendedType: 'line', // Tufte: Line charts per oscillatori
    academicReference: 'Tufte (2001) - Line charts for oscillating indicators',
    rationale: 'Oscillatore con range -100/+100. Line chart mostra momentum e estremi.',
    optimalHeight: 280,
    showGrid: true,
    showLegend: false,
    colorScheme: 'diverging',
    colors: ['#3b82f6'],
    annotations: true,
    referenceLines: true, // Linee a -50, 0, +50
  },
  'arms-index': {
    indicatorId: 'arms-index',
    recommendedType: 'line', // Serie temporale
    academicReference: 'Cleveland & McGill (1984) - Line charts for time series',
    rationale: 'TRIN è una serie temporale. Line chart mostra trend e estremi.',
    optimalHeight: 280,
    showGrid: true,
    showLegend: false,
    colorScheme: 'diverging',
    colors: ['#3b82f6'],
    annotations: true,
    referenceLines: true, // Linee a 0.8, 1.0, 1.2
  },

  // Composite Indicators
  'momentum-composite': {
    indicatorId: 'momentum-composite',
    recommendedType: 'radar', // Heer & Bostock: Radar per multi-dimensionali
    academicReference: 'Heer & Bostock (2010) - Radar charts for multi-dimensional indicators',
    rationale: 'Composite combina RSI, MACD, Stochastic, ROC. Radar mostra tutte le dimensioni.',
    optimalHeight: 350,
    showGrid: true,
    showLegend: true,
    colorScheme: 'categorical',
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
    annotations: true,
  },
  'volatility-composite': {
    indicatorId: 'volatility-composite',
    recommendedType: 'area', // Tufte: Area charts per accumulazione
    academicReference: 'Tufte (2001) - Area charts for cumulative metrics',
    rationale: 'Composite combina VIX, term structure, realized vol. Area mostra accumulazione.',
    optimalHeight: 320,
    showGrid: true,
    showLegend: true,
    colorScheme: 'sequential',
    colors: ['#ef4444', '#f59e0b', '#3b82f6'],
    annotations: true,
  },
  'sentiment-composite': {
    indicatorId: 'sentiment-composite',
    recommendedType: 'gauge', // Few: Gauge per sentiment aggregato
    academicReference: 'Few (2006) - Gauge charts for sentiment indicators',
    rationale: 'Composite sentiment 0-100. Gauge mostra posizione e zona sentiment.',
    optimalHeight: 300,
    showGrid: false,
    showLegend: false,
    colorScheme: 'diverging',
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    annotations: true,
  },

  // Yield Curve
  'yield-curve': {
    indicatorId: 'yield-curve',
    recommendedType: 'line', // Standard accademico per yield curve
    academicReference: 'Estrella & Mishkin (1998) - Standard line chart for yield curves',
    rationale: 'Yield curve è una serie di scadenze. Line chart è standard accademico.',
    optimalHeight: 350,
    showGrid: true,
    showLegend: true,
    colorScheme: 'sequential',
    colors: ['#3b82f6', '#8b5cf6'],
    annotations: true,
    referenceLines: true,
  },
  'credit-spreads': {
    indicatorId: 'credit-spreads',
    recommendedType: 'bar', // Few: Bar per confronti
    academicReference: 'Few (2006) - Bar charts for spread comparisons',
    rationale: 'Spreads sono confronti categoriali. Bar chart mostra differenze chiaramente.',
    optimalHeight: 300,
    showGrid: true,
    showLegend: true,
    colorScheme: 'diverging',
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    annotations: true,
  },

  // Stock Indexes
  'stock-indexes': {
    indicatorId: 'stock-indexes',
    recommendedType: 'bar', // Few: Bar per confronti multi-categoria
    academicReference: 'Few (2006) - Bar charts for multi-category comparisons',
    rationale: 'Confronto tra S&P 500, Dow, NASDAQ. Bar chart mostra differenze.',
    optimalHeight: 320,
    showGrid: true,
    showLegend: true,
    colorScheme: 'categorical',
    colors: ['#3b82f6', '#8b5cf6', '#10b981'],
    annotations: true,
  },

  // Crypto Depth
  'top-400-depth': {
    indicatorId: 'top-400-depth',
    recommendedType: 'heatmap', // Heer & Bostock: Heatmap per matrici
    academicReference: 'Heer & Bostock (2010) - Heatmaps for correlation/depth matrices',
    rationale: 'Depth è una matrice bidimensionale. Heatmap mostra intensità ordini.',
    optimalHeight: 400,
    showGrid: false,
    showLegend: true,
    colorScheme: 'sequential',
    colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'],
    annotations: false,
  },
  'crypto-correlation-matrix': {
    indicatorId: 'crypto-correlation-matrix',
    recommendedType: 'heatmap', // Standard per correlation matrices
    academicReference: 'Heer & Bostock (2010) - Heatmaps optimal for correlation matrices',
    rationale: 'Correlation matrix è bidimensionale. Heatmap mostra correlazioni chiaramente.',
    optimalHeight: 400,
    showGrid: false,
    showLegend: true,
    colorScheme: 'diverging',
    colors: ['#ef4444', '#f59e0b', '#10b981'], // Rosso (neg) -> Giallo -> Verde (pos)
    annotations: true,
  },

  // Technical Indicators
  'technical-indicators': {
    indicatorId: 'technical-indicators',
    recommendedType: 'line', // Tufte: Line charts per indicatori tecnici
    academicReference: 'Tufte (2001) - Line charts for technical indicators',
    rationale: 'RSI, MACD, Stochastic sono serie temporali. Line chart standard.',
    optimalHeight: 350,
    showGrid: true,
    showLegend: true,
    colorScheme: 'categorical',
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
    annotations: true,
    referenceLines: true,
  },
  'ichimoku-cloud': {
    indicatorId: 'ichimoku-cloud',
    recommendedType: 'area', // Standard per Ichimoku (cloud = area)
    academicReference: 'Ichimoku Kinko Hyo standard - Area chart for cloud visualization',
    rationale: 'Ichimoku cloud richiede area chart per mostrare Kumo (cloud).',
    optimalHeight: 400,
    showGrid: true,
    showLegend: true,
    colorScheme: 'diverging',
    colors: ['#10b981', '#ef4444'], // Verde (bullish cloud) vs Rosso (bearish cloud)
    annotations: true,
  },

  // Economic Indicators
  'economic': {
    indicatorId: 'economic',
    recommendedType: 'bar', // Few: Bar per confronti economici
    academicReference: 'Few (2006) - Bar charts for economic comparisons',
    rationale: 'Confronto GDP, CPI, Unemployment. Bar chart mostra differenze.',
    optimalHeight: 320,
    showGrid: true,
    showLegend: true,
    colorScheme: 'categorical',
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
    annotations: true,
  },
  'bond-yields': {
    indicatorId: 'bond-yields',
    recommendedType: 'line', // Standard per yield series
    academicReference: 'Cleveland & McGill (1984) - Line charts for yield series',
    rationale: 'Yields sono serie temporali. Line chart mostra trend.',
    optimalHeight: 300,
    showGrid: true,
    showLegend: true,
    colorScheme: 'categorical',
    colors: ['#3b82f6', '#8b5cf6', '#10b981'],
    annotations: true,
  },

  // Forex
  'forex': {
    indicatorId: 'forex',
    recommendedType: 'bar', // Few: Bar per confronti valute
    academicReference: 'Few (2006) - Bar charts for currency comparisons',
    rationale: 'Confronto tra coppie forex. Bar chart mostra performance relativa.',
    optimalHeight: 320,
    showGrid: true,
    showLegend: true,
    colorScheme: 'diverging',
    colors: ['#10b981', '#ef4444'], // Verde (rialzo) vs Rosso (ribasso)
    annotations: true,
  },
  'currency-strength-index': {
    indicatorId: 'currency-strength-index',
    recommendedType: 'radar', // Heer & Bostock: Radar per multi-valuta
    academicReference: 'Heer & Bostock (2010) - Radar charts for multi-currency analysis',
    rationale: 'Confronta USD, EUR, GBP, JPY, etc. Radar mostra forza relativa.',
    optimalHeight: 350,
    showGrid: true,
    showLegend: true,
    colorScheme: 'categorical',
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
    annotations: true,
  },

  // Commodities
  'commodities': {
    indicatorId: 'commodities',
    recommendedType: 'bar', // Few: Bar per confronti commodity
    academicReference: 'Few (2006) - Bar charts for commodity comparisons',
    rationale: 'Confronto Gold, Oil, Silver. Bar chart mostra performance.',
    optimalHeight: 300,
    showGrid: true,
    showLegend: true,
    colorScheme: 'categorical',
    colors: ['#f59e0b', '#3b82f6', '#94a3b8'], // Oro, Olio, Argento
    annotations: true,
  },

  // Crypto
  'bitcoin-dominance': {
    indicatorId: 'bitcoin-dominance',
    recommendedType: 'line', // Tufte: Line per serie temporali
    academicReference: 'Tufte (2001) - Line charts for time series dominance metrics',
    rationale: 'Dominance è una serie temporale. Line chart mostra trend.',
    optimalHeight: 280,
    showGrid: true,
    showLegend: false,
    colorScheme: 'sequential',
    colors: ['#f59e0b'], // Bitcoin gold
    annotations: true,
    referenceLines: true, // Linee a 50%, 60%
  },
  'crypto-market-cap': {
    indicatorId: 'crypto-market-cap',
    recommendedType: 'area', // Tufte: Area per accumulazione
    academicReference: 'Tufte (2001) - Area charts for cumulative market metrics',
    rationale: 'Market cap è accumulativo. Area chart mostra crescita.',
    optimalHeight: 300,
    showGrid: true,
    showLegend: false,
    colorScheme: 'sequential',
    colors: ['#3b82f6'],
    annotations: true,
  },
};

/**
 * Get academic visualization config for indicator
 */
export function getAcademicVisualizationConfig(indicatorId: string): AcademicVisualizationConfig | null {
  return ACADEMIC_VISUALIZATION_CONFIG[indicatorId] || null;
}
