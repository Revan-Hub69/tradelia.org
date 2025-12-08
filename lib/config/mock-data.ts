/**
 * Mock Data per sviluppo e testing
 * Usato quando API_CONFIG.DISABLE_API_CALLS è true
 */

export const MOCK_INDICATORS = {
  vix: { value: 18.5, change: -0.5, changePercent: -2.6 },
  'vix-term-structure': { contangoPercent: 2.3 },
  'put-call-ratio': { totalPutCallRatio: 0.85 },
  'yield-curve': { spread: { '10Y-2Y': 0.45 } },
  'credit-spreads': { baa10y: 2.3 },
  'fear-greed': { value: 65 },
  'bitcoin-dominance': { dominance: 52.3 },
  'crypto-market-cap': { totalMarketCap: 2.1e12 },
  spy: { currentPrice: 4850.25, change24hPercent: 0.8 },
  qqq: { currentPrice: 420.50, change24hPercent: 1.2 },
  eurusd: { currentPrice: 1.0850, change24hPercent: 0.3 },
  dxy: { value: 103.5, changePercent: -0.2 },
  gold: { currentPrice: 2050.75, change24hPercent: 0.5 },
  oil: { currentPrice: 78.50, change24hPercent: -1.2 },
};

export const MOCK_NEWS = [
  {
    title: 'Market Update: Stocks Rise on Positive Economic Data',
    description: 'Major indices gain as investors digest latest economic indicators',
    pubDate: new Date().toISOString(),
    source: 'Bloomberg',
    category: 'markets',
    sentiment: { compound: 0.5, label: 'positive' as const },
    impactScore: 7,
    credibilityScore: 95,
  },
  {
    title: 'Crypto Market Shows Resilience Amid Volatility',
    description: 'Bitcoin maintains support levels despite market uncertainty',
    pubDate: new Date().toISOString(),
    source: 'CoinDesk',
    category: 'crypto',
    sentiment: { compound: 0.3, label: 'positive' as const },
    impactScore: 6,
    credibilityScore: 85,
  },
];

export const MOCK_ECONOMIC_EVENTS = [
  {
    Date: new Date().toISOString(),
    Event: 'GDP Growth Rate',
    Country: 'USA',
    Category: 'GDP',
    Importance: 'High',
    Actual: '2.5%',
    Forecast: '2.3%',
    Previous: '2.1%',
  },
];

export const MOCK_IPOS = [
  {
    symbol: 'TEST',
    name: 'Test Company Inc.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    price: '25.00',
    numberOfShares: '10000000',
  },
];

export const MOCK_CORPORATE_EVENTS = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'earnings' as const,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    earningsSurprise: {
      estimate: 2.10,
      actual: 2.25,
      surprise: 0.15,
      surprisePercent: 7.14,
    },
  },
];
