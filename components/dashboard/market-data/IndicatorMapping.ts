/**
 * Indicator Mapping - Mappa indicatori categorizzati agli endpoint API
 * 
 * Risolve discrepanze tra nomi categorizzazione e endpoint API
 */

// Mappatura da ID categorizzazione a endpoint API
export const INDICATOR_ENDPOINT_MAP: Record<string, string> = {
  // Stock & Market
  'vix': '/api/market-indicators/vix',
  'spy': '/api/market/data?symbol=SPY&assetType=stock',
  'stock-indexes': '/api/market-indicators/stock-indexes',
  'yield-curve': '/api/market-indicators/yield-curve',
  'credit-spreads': '/api/market-indicators/credit-spreads',
  'put-call-ratio': '/api/market-indicators/put-call-ratio',
  'vix-term-structure': '/api/market-indicators/vix-term-structure',
  'market-breadth': '/api/market-indicators/market-breadth',
  'mcclellan-oscillator': '/api/market-indicators/mcclellan-oscillator',
  'arms-index': '/api/market-indicators/arms-index',
  'momentum-composite': '/api/market-indicators/momentum-composite',
  'volatility-composite': '/api/market-indicators/volatility-composite',
  'sentiment-composite': '/api/market-indicators/sentiment-composite',
  'short-interest': '/api/market-indicators/short-interest',
  'dxy': '/api/market-indicators/dxy',
  
  // Economic & Macro
  'economic': '/api/market-indicators/economic',
  'bond-yields': '/api/market-indicators/bond-yields',
  'leading-economic-indicators': '/api/market-indicators/leading-economic-indicators',
  'pmi': '/api/market-indicators/pmi',
  
  // Crypto
  'bitcoin-dominance': '/api/market-indicators/bitcoin-dominance',
  'crypto-market-cap': '/api/market-indicators/crypto-market-cap',
  'fear-greed': '/api/market-indicators/fear-greed',
  'whale-analysis': '/api/crypto/whale-analysis',
  'exchange-flows': '/api/crypto/exchange-flows',
  'top-400-depth': '/api/crypto/top-400-depth',
  'top-movers': '/api/crypto/top-movers',
  'aggregated-depth': '/api/crypto/aggregated-depth',
  'multi-exchange-depth': '/api/crypto/multi-exchange-depth',
  'top-400-monitor': '/api/crypto/top-400-monitor',
  'social-sentiment': '/api/crypto/social-sentiment',
  'trending': '/api/crypto/trending',
  'developer-activity': '/api/crypto/developer-activity',
  'l400-history': '/api/crypto/l400-history',
  
  // Forex
  'forex': '/api/market-indicators/forex',
  'eurusd': '/api/market/data?symbol=EURUSD&assetType=forex',
  
  // Commodity
  'commodities': '/api/market-indicators/commodities',
  'gold': '/api/market/data?symbol=GOLD&assetType=commodity',
  'commodity-rotation': '/api/market-indicators/commodity-rotation',
  'futures-term-structure': '/api/market-indicators/futures-term-structure',
  
  // Global Markets
  'european-indexes': '/api/market-indicators/european-indexes',
  'asian-indexes': '/api/market-indicators/asian-indexes',
  'emerging-markets': '/api/market-indicators/emerging-markets',
  'etf-sectoral': '/api/market-indicators/etf-sectoral',
  'etf-geographic': '/api/market-indicators/etf-geographic',
  
  // Crypto On-Chain
  'nvt-ratio': '/api/crypto/nvt-ratio',
  'mvrv-ratio': '/api/crypto/mvrv-ratio',
  'active-addresses': '/api/crypto/active-addresses',
  
  // Market Data & Events
  'ipo-calendar': '/api/market/ipo-calendar',
  'corporate-events': '/api/market/corporate-events',
  'sentiment': '/api/market/sentiment',
  'data': '/api/market/data',
  'economic-calendar': '/api/market/economic-calendar',
  'insider-trading': '/api/market/insider-trading',
  
  // ETF Rotations
  'etf-rotations': '/api/market-indicators/etf-rotations',
  
  // COT Reports
  'cot-reports': '/api/market-indicators/cot-reports',
  
  // Technical Indicators
  'technical-indicators': '/api/market-indicators/technical-indicators',
  
  // Sentiment Indicators
  'aaii-sentiment': '/api/market-indicators/aaii-sentiment',
  
  // Market Breadth
  'high-low-index': '/api/market-indicators/high-low-index',
  
  // Technical Indicators Advanced
  'money-flow-index': '/api/market-indicators/money-flow-index',
  'on-balance-volume': '/api/market-indicators/on-balance-volume',
  'williams-r': '/api/market-indicators/williams-r',
  'commodity-channel-index': '/api/market-indicators/commodity-channel-index',
  'average-true-range': '/api/market-indicators/average-true-range',
  
  // Market Breadth Advanced
  'advance-decline-line': '/api/market-indicators/advance-decline-line',
  
  // Italian Market
  'italian-indexes': '/api/market-indicators/italian-indexes',
  
  // Crypto Advanced
  'exchange-reserves': '/api/crypto/exchange-reserves',
  
  // Economic Indicators Advanced
  'consumer-confidence': '/api/market-indicators/consumer-confidence',
  'retail-sales': '/api/market-indicators/retail-sales',
  'industrial-production': '/api/market-indicators/industrial-production',
  
  // Technical Indicators Advanced
  'parabolic-sar': '/api/market-indicators/parabolic-sar',
  'adx': '/api/market-indicators/adx',
  'rate-of-change': '/api/market-indicators/rate-of-change',
  'chaikin-money-flow': '/api/market-indicators/chaikin-money-flow',
  'accumulation-distribution': '/api/market-indicators/accumulation-distribution',
  'percentage-price-oscillator': '/api/market-indicators/percentage-price-oscillator',
  'ichimoku-cloud': '/api/market-indicators/ichimoku-cloud',
  
  // Global Indicators
  'global-pmi': '/api/market-indicators/global-pmi',
  'global-inflation': '/api/market-indicators/global-inflation',
  'global-central-bank-rates': '/api/market-indicators/global-central-bank-rates',
  'currency-strength-index': '/api/market-indicators/currency-strength-index',
  
  // Market Microstructure
  'order-flow-imbalance': '/api/market-indicators/order-flow-imbalance',
  'cumulative-delta': '/api/market-indicators/cumulative-delta',
  'volume-profile': '/api/market-indicators/volume-profile',
  
  // Technical Analysis Advanced
  'fibonacci-retracements': '/api/market-indicators/fibonacci-retracements',
  'support-resistance-levels': '/api/market-indicators/support-resistance-levels',
  
  // European Economic Indicators
  'european-economic-indicators': '/api/market-indicators/european-economic-indicators',
  
  // Crypto Advanced
  'funding-rates': '/api/crypto/funding-rates',
  'long-short-ratio': '/api/crypto/long-short-ratio',
  'stablecoin-supply-ratio': '/api/crypto/stablecoin-supply-ratio',
  'exchange-netflows': '/api/crypto/exchange-netflows',
  'crypto-correlation-matrix': '/api/crypto/crypto-correlation-matrix',
};

// Mappatura inversa: da endpoint a ID categorizzazione (per retrocompatibilità)
export const ENDPOINT_INDICATOR_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(INDICATOR_ENDPOINT_MAP).map(([id, endpoint]) => [endpoint, id])
);

// Legacy mapping (vecchi nomi → nuovi nomi)
export const LEGACY_INDICATOR_MAP: Record<string, string> = {
  'spy': 'stock-indexes',           // S&P 500 è parte di stock-indexes
  'qqq': 'stock-indexes',           // NASDAQ è parte di stock-indexes
  'eurusd': 'forex',                // EUR/USD è parte di forex
  'dxy': 'forex',                   // DXY potrebbe essere parte di forex
  'gold': 'commodities',            // Gold è parte di commodities
  'oil': 'commodities',             // Oil è parte di commodities
  'whale-ratio': 'whale-analysis',  // Nome vecchio → nuovo
  'exchange-flow': 'exchange-flows',  // Nome vecchio → nuovo
  'l400-imbalance': 'top-400-depth', // Nome vecchio → nuovo
  'top-mover': 'top-movers',         // Nome vecchio → nuovo
};

/**
 * Ottiene l'endpoint API per un indicatore
 */
export function getIndicatorEndpoint(indicatorId: string): string | null {
  // Prova mapping diretto
  if (INDICATOR_ENDPOINT_MAP[indicatorId]) {
    return INDICATOR_ENDPOINT_MAP[indicatorId];
  }
  
  // Prova legacy mapping
  const mappedId = LEGACY_INDICATOR_MAP[indicatorId];
  if (mappedId && INDICATOR_ENDPOINT_MAP[mappedId]) {
    return INDICATOR_ENDPOINT_MAP[mappedId];
  }
  
  return null;
}

/**
 * Normalizza un ID indicatore (converte legacy → nuovo)
 */
export function normalizeIndicatorId(indicatorId: string): string {
  return LEGACY_INDICATOR_MAP[indicatorId] || indicatorId;
}
