/**
 * Technical Indicators Library
 * 
 * Implementazione completa indicatori tecnici per trading crypto
 * 
 * Riferimenti Accademici:
 * - Wilder (1978) - "New Concepts in Technical Trading Systems" (RSI, ADX, Parabolic SAR)
 * - Appel (2005) - "Technical Analysis: Power Tools for Active Investors" (MACD)
 * - Bollinger (2002) - "Bollinger on Bollinger Bands" (Bollinger Bands)
 * - Kaufman (2013) - "Trading Systems and Methods" (ATR, Stochastic)
 * - Nison (2001) - "Japanese Candlestick Charting Techniques" (Ichimoku)
 */

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * RSI (Relative Strength Index)
 * Momentum oscillator che misura velocità e magnitudine dei cambiamenti di prezzo
 * Range: 0-100
 * 
 * Formula: RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss (su 14 periodi)
 * 
 * Interpretazione:
 * - RSI > 70: Overbought (possibile correzione)
 * - RSI < 30: Oversold (possibile rimbalzo)
 * - Divergenze: Segnali di inversione
 */
export function calculateRSI(
  prices: PriceData[],
  period = 14
): { rsi: number; signal: 'overbought' | 'oversold' | 'neutral' } {
  if (prices.length < period + 1) {
    return { rsi: 50, signal: 'neutral' };
  }

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i].close - prices[i - 1].close);
  }

  let avgGain = 0;
  let avgLoss = 0;

  // Calcola media iniziale
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Calcola RSI con Wilder's smoothing
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  let signal: 'overbought' | 'oversold' | 'neutral';
  if (rsi > 70) signal = 'overbought';
  else if (rsi < 30) signal = 'oversold';
  else signal = 'neutral';

  return { rsi, signal };
}

/**
 * MACD (Moving Average Convergence Divergence)
 * Trend-following momentum indicator
 * 
 * Formula:
 * - MACD Line = 12 EMA - 26 EMA
 * - Signal Line = 9 EMA of MACD Line
 * - Histogram = MACD Line - Signal Line
 * 
 * Interpretazione:
 * - Crossover: MACD sopra Signal = Bullish, sotto = Bearish
 * - Divergenze: Segnali di inversione trend
 * - Histogram: Momentum del trend
 */
export function calculateMACD(
  prices: PriceData[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
} {
  if (prices.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0, trend: 'neutral' };
  }

  const closes = prices.map((p) => p.close);

  // Calcola EMA
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // MACD Line
  const macdLine: number[] = [];
  for (let i = slowPeriod - fastPeriod; i < fastEMA.length; i++) {
    macdLine.push(fastEMA[i] - slowEMA[i]);
  }

  // Signal Line (EMA of MACD)
  const signalLine = calculateEMA(macdLine, signalPeriod);

  const macd = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  const histogram = macd - signal;

  let trend: 'bullish' | 'bearish' | 'neutral';
  if (macd > signal && histogram > 0) trend = 'bullish';
  else if (macd < signal && histogram < 0) trend = 'bearish';
  else trend = 'neutral';

  return { macd, signal, histogram, trend };
}

/**
 * Bollinger Bands
 * Volatility bands attorno a moving average
 * 
 * Formula:
 * - Middle Band = 20 SMA
 * - Upper Band = Middle + (2 * StdDev)
 * - Lower Band = Middle - (2 * StdDev)
 * 
 * Interpretazione:
 * - Prezzo tocca upper band: Possibile overbought
 * - Prezzo tocca lower band: Possibile oversold
 * - Bands si espandono: Aumento volatilità
 * - Bands si contraggono: Diminuzione volatilità (possibile breakout)
 */
export function calculateBollingerBands(
  prices: PriceData[],
  period = 20,
  stdDevMultiplier = 2
): {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  position: number; // 0-1: posizione prezzo nelle bands
} {
  if (prices.length < period) {
    const currentPrice = prices[prices.length - 1].close;
    return {
      upper: currentPrice,
      middle: currentPrice,
      lower: currentPrice,
      bandwidth: 0,
      position: 0.5,
    };
  }

  const closes = prices.slice(-period).map((p) => p.close);
  const sma = closes.reduce((a, b) => a + b, 0) / period;

  // Calcola standard deviation
  const variance =
    closes.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = sma + stdDevMultiplier * stdDev;
  const lower = sma - stdDevMultiplier * stdDev;
  const bandwidth = (upper - lower) / sma;

  const currentPrice = prices[prices.length - 1].close;
  const position =
    upper === lower ? 0.5 : (currentPrice - lower) / (upper - lower);

  return { upper, middle: sma, lower, bandwidth, position };
}

/**
 * ATR (Average True Range)
 * Misura volatilità basata su true range
 * 
 * Formula:
 * - True Range = max(High-Low, |High-PrevClose|, |Low-PrevClose|)
 * - ATR = EMA of True Range (14 periodi)
 * 
 * Interpretazione:
 * - ATR alto: Alta volatilità
 * - ATR basso: Bassa volatilità
 * - Usato per stop loss dinamici
 */
export function calculateATR(
  prices: PriceData[],
  period = 14
): { atr: number; volatility: 'low' | 'medium' | 'high' } {
  if (prices.length < period + 1) {
    return { atr: 0, volatility: 'medium' };
  }

  const trueRanges: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trueRanges.push(tr);
  }

  // Calcola ATR come EMA
  const atr = calculateEMA(trueRanges, period)[trueRanges.length - 1];

  // Classifica volatilità basata su ATR percentuale
  const currentPrice = prices[prices.length - 1].close;
  const atrPercent = (atr / currentPrice) * 100;

  let volatility: 'low' | 'medium' | 'high';
  if (atrPercent < 1) volatility = 'low';
  else if (atrPercent < 3) volatility = 'medium';
  else volatility = 'high';

  return { atr, volatility };
}

/**
 * Stochastic Oscillator
 * Momentum indicator che confronta closing price con price range
 * 
 * Formula:
 * - %K = 100 * ((Close - Lowest Low) / (Highest High - Lowest Low))
 * - %D = 3-period SMA of %K
 * 
 * Interpretazione:
 * - %K > 80: Overbought
 * - %K < 20: Oversold
 * - Crossover %K e %D: Segnali di trading
 */
export function calculateStochastic(
  prices: PriceData[],
  kPeriod = 14,
  dPeriod = 3
): {
  k: number;
  d: number;
  signal: 'overbought' | 'oversold' | 'neutral';
} {
  if (prices.length < kPeriod) {
    return { k: 50, d: 50, signal: 'neutral' };
  }

  const periodPrices = prices.slice(-kPeriod);
  const highs = periodPrices.map((p) => p.high);
  const lows = periodPrices.map((p) => p.low);
  const closes = periodPrices.map((p) => p.close);

  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);
  const currentClose = closes[closes.length - 1];

  const k =
    highestHigh === lowestLow
      ? 50
      : 100 * ((currentClose - lowestLow) / (highestHigh - lowestLow));

  // Calcola %D (SMA of %K)
  const kValues: number[] = [];
  for (let i = kPeriod; i <= prices.length; i++) {
    const periodData = prices.slice(i - kPeriod, i);
    const periodHighs = periodData.map((p) => p.high);
    const periodLows = periodData.map((p) => p.low);
    const periodCloses = periodData.map((p) => p.close);

    const hh = Math.max(...periodHighs);
    const ll = Math.min(...periodLows);
    const cc = periodCloses[periodCloses.length - 1];

    const kValue =
      hh === ll ? 50 : 100 * ((cc - ll) / (hh - ll));
    kValues.push(kValue);
  }

  const d =
    kValues.length >= dPeriod
      ? kValues.slice(-dPeriod).reduce((a, b) => a + b, 0) / dPeriod
      : k;

  let signal: 'overbought' | 'oversold' | 'neutral';
  if (k > 80) signal = 'overbought';
  else if (k < 20) signal = 'oversold';
  else signal = 'neutral';

  return { k, d, signal };
}

/**
 * Helper: Calculate EMA (Exponential Moving Average)
 */
function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) return [];

  const multiplier = 2 / (period + 1);
  const ema: number[] = [];

  // Inizia con SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  ema.push(sum / period);

  // Calcola EMA
  for (let i = period; i < values.length; i++) {
    const currentEMA = (values[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(currentEMA);
  }

  return ema;
}

/**
 * Helper: Calculate SMA (Simple Moving Average)
 */
export function calculateSMA(values: number[], period: number): number {
  if (values.length < period) return 0;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

