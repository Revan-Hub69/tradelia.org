/**
 * Pattern Recognition
 * 
 * Riconoscimento pattern per trading
 * - Support/Resistance breaks
 * - Divergences (RSI, MACD, Price)
 * - Chart patterns (triangles, flags, etc.)
 * - Candlestick patterns
 * 
 * Riferimenti:
 * - Bulkowski (2005) - "Encyclopedia of Chart Patterns"
 * - Nison (2001) - "Japanese Candlestick Charting Techniques"
 */

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Pattern {
  type: string;
  name: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  entry?: number;
  target?: number;
  stopLoss?: number;
}

/**
 * Rileva divergenze RSI
 */
export function detectRSIDivergence(
  prices: PriceData[],
  rsiValues: number[]
): Pattern | null {
  if (prices.length < 20 || rsiValues.length < 20) return null;

  const recentPrices = prices.slice(-20);
  const recentRSI = rsiValues.slice(-20);

  // Trova massimi e minimi
  const priceMax = Math.max(...recentPrices.map((p) => p.high));
  const priceMaxIndex = recentPrices.findIndex((p) => p.high === priceMax);
  const rsiAtPriceMax = recentRSI[priceMaxIndex];

  const priceMin = Math.min(...recentPrices.map((p) => p.low));
  const priceMinIndex = recentPrices.findIndex((p) => p.low === priceMin);
  const rsiAtPriceMin = recentRSI[priceMinIndex];

  // Bearish divergence: Price makes higher high, RSI makes lower high
  if (priceMaxIndex > priceMinIndex) {
    const earlierRSI = recentRSI[priceMaxIndex - 5];
    if (earlierRSI && rsiAtPriceMax < earlierRSI && priceMax > recentPrices[priceMaxIndex - 5].high) {
      return {
        type: 'divergence',
        name: 'RSI Bearish Divergence',
        signal: 'bearish',
        confidence: 70,
        description: 'Price makes higher high but RSI makes lower high - potential reversal',
        entry: recentPrices[recentPrices.length - 1].close,
        target: priceMin * 0.98,
        stopLoss: priceMax * 1.02,
      };
    }
  }

  // Bullish divergence: Price makes lower low, RSI makes higher low
  if (priceMinIndex > priceMaxIndex) {
    const earlierRSI = recentRSI[priceMinIndex - 5];
    if (earlierRSI && rsiAtPriceMin > earlierRSI && priceMin < recentPrices[priceMinIndex - 5].low) {
      return {
        type: 'divergence',
        name: 'RSI Bullish Divergence',
        signal: 'bullish',
        confidence: 70,
        description: 'Price makes lower low but RSI makes higher low - potential reversal',
        entry: recentPrices[recentPrices.length - 1].close,
        target: priceMax * 1.02,
        stopLoss: priceMin * 0.98,
      };
    }
  }

  return null;
}

/**
 * Rileva support/resistance breaks
 */
export function detectSupportResistanceBreak(
  prices: PriceData[],
  supportLevels: number[],
  resistanceLevels: number[]
): Pattern[] {
  const patterns: Pattern[] = [];
  const currentPrice = prices[prices.length - 1].close;

  // Check resistance breaks (bullish)
  for (const resistance of resistanceLevels) {
    if (currentPrice > resistance && prices[prices.length - 2].close <= resistance) {
      patterns.push({
        type: 'breakout',
        name: 'Resistance Break',
        signal: 'bullish',
        confidence: 75,
        description: `Price broke above resistance at $${resistance.toFixed(2)}`,
        entry: currentPrice,
        target: resistance * 1.05, // 5% above resistance
        stopLoss: resistance * 0.98, // 2% below resistance
      });
    }
  }

  // Check support breaks (bearish)
  for (const support of supportLevels) {
    if (currentPrice < support && prices[prices.length - 2].close >= support) {
      patterns.push({
        type: 'breakdown',
        name: 'Support Break',
        signal: 'bearish',
        confidence: 75,
        description: `Price broke below support at $${support.toFixed(2)}`,
        entry: currentPrice,
        target: support * 0.95, // 5% below support
        stopLoss: support * 1.02, // 2% above support
      });
    }
  }

  return patterns;
}

/**
 * Rileva candlestick patterns
 */
export function detectCandlestickPatterns(prices: PriceData[]): Pattern[] {
  const patterns: Pattern[] = [];
  if (prices.length < 3) return patterns;

  const current = prices[prices.length - 1];
  const prev = prices[prices.length - 2];
  const prev2 = prices[prices.length - 3];

  // Hammer (bullish reversal)
  const body = Math.abs(current.close - current.open);
  const lowerShadow = Math.min(current.open, current.close) - current.low;
  const upperShadow = current.high - Math.max(current.open, current.close);

  if (lowerShadow > body * 2 && upperShadow < body * 0.5 && current.close > current.open) {
    patterns.push({
      type: 'candlestick',
      name: 'Hammer',
      signal: 'bullish',
      confidence: 65,
      description: 'Hammer pattern - potential bullish reversal',
      entry: current.close,
      target: current.close * 1.03,
      stopLoss: current.low * 0.99,
    });
  }

  // Shooting Star (bearish reversal)
  if (upperShadow > body * 2 && lowerShadow < body * 0.5 && current.close < current.open) {
    patterns.push({
      type: 'candlestick',
      name: 'Shooting Star',
      signal: 'bearish',
      confidence: 65,
      description: 'Shooting star pattern - potential bearish reversal',
      entry: current.close,
      target: current.close * 0.97,
      stopLoss: current.high * 1.01,
    });
  }

  // Engulfing patterns
  // Bullish engulfing
  if (
    prev.close < prev.open && // Previous bearish
    current.close > current.open && // Current bullish
    current.open < prev.close && // Current opens below prev close
    current.close > prev.open // Current closes above prev open
  ) {
    patterns.push({
      type: 'candlestick',
      name: 'Bullish Engulfing',
      signal: 'bullish',
      confidence: 70,
      description: 'Bullish engulfing pattern - strong bullish reversal',
      entry: current.close,
      target: current.close * 1.04,
      stopLoss: prev.low * 0.99,
    });
  }

  // Bearish engulfing
  if (
    prev.close > prev.open && // Previous bullish
    current.close < current.open && // Current bearish
    current.open > prev.close && // Current opens above prev close
    current.close < prev.open // Current closes below prev open
  ) {
    patterns.push({
      type: 'candlestick',
      name: 'Bearish Engulfing',
      signal: 'bearish',
      confidence: 70,
      description: 'Bearish engulfing pattern - strong bearish reversal',
      entry: current.close,
      target: current.close * 0.96,
      stopLoss: prev.high * 1.01,
    });
  }

  return patterns;
}

/**
 * Rileva tutti i pattern
 */
export function detectAllPatterns(
  prices: PriceData[],
  rsiValues: number[],
  supportLevels: number[],
  resistanceLevels: number[]
): Pattern[] {
  const patterns: Pattern[] = [];

  // Divergences
  const rsiDivergence = detectRSIDivergence(prices, rsiValues);
  if (rsiDivergence) patterns.push(rsiDivergence);

  // Support/Resistance breaks
  patterns.push(...detectSupportResistanceBreak(prices, supportLevels, resistanceLevels));

  // Candlestick patterns
  patterns.push(...detectCandlestickPatterns(prices));

  return patterns;
}

