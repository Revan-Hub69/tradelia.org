import { AtrResult, ZScoreResult, DEFAULT_THRESHOLDS } from './types'

/**
 * Calculate True Range for ATR computation
 */
export function calculateTrueRange(high: number, low: number, prevClose: number): number {
  const range1 = high - low
  const range2 = Math.abs(high - prevClose)
  const range3 = Math.abs(low - prevClose)
  return Math.max(range1, range2, range3)
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): AtrResult {
  if (highs.length < period + 1 || lows.length < period + 1 || closes.length < period + 1) {
    throw new Error(`Insufficient data for ATR calculation. Need at least ${period + 1} periods, got ${highs.length}`)
  }

  const tr: number[] = []

  // Calculate True Range for each period
  for (let i = 1; i < highs.length; i++) {
    const trValue = calculateTrueRange(highs[i], lows[i], closes[i - 1])
    tr.push(trValue)
  }

  // Calculate ATR using EMA
  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // First ATR value (SMA)
  const firstAtr = tr.slice(0, period).reduce((sum, val) => sum + val, 0) / period
  ema.push(firstAtr)

  // Subsequent ATR values (EMA)
  for (let i = period; i < tr.length; i++) {
    const atrValue = (tr[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
    ema.push(atrValue)
  }

  return {
    atr: ema[ema.length - 1],
    tr,
    ema
  }
}

/**
 * Calculate ATR as percentage of price
 */
export function calculateAtrPercentage(atr: number, currentPrice: number): number {
  return atr / currentPrice
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) {
    throw new Error(`Insufficient data for EMA. Need at least ${period} values, got ${values.length}`)
  }

  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // First EMA value (SMA)
  const firstEma = values.slice(0, period).reduce((sum, val) => sum + val, 0) / period
  ema.push(firstEma)

  // Subsequent EMA values
  for (let i = period; i < values.length; i++) {
    const emaValue = (values[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
    ema.push(emaValue)
  }

  return ema
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(values: number[], period: number): number[] {
  if (values.length < period) {
    throw new Error(`Insufficient data for SMA. Need at least ${period} values, got ${values.length}`)
  }

  const sma: number[] = []

  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0)
    sma.push(sum / period)
  }

  return sma
}

/**
 * Calculate Z-Score and percentile
 */
export function calculateZScore(value: number, values: number[]): ZScoreResult {
  if (values.length < 2) {
    return { value, zscore: 0, percentile: 50 }
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)

  const zscore = std === 0 ? 0 : (value - mean) / std

  // Calculate percentile using normal distribution approximation
  const percentile = 50 + 50 * (1 + erf(zscore / Math.sqrt(2)))

  return { value, zscore, percentile }
}

/**
 * Error function (erf) approximation for percentile calculation
 */
function erf(x: number): number {
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Clamp value between 0 and 1
 */
export function clamp01(value: number): number {
  return clamp(value, 0, 1)
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Calculate returns from price series
 */
export function calculateReturns(prices: number[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    const ret = calculatePercentChange(prices[i], prices[i - 1])
    returns.push(ret)
  }
  return returns
}

/**
 * Calculate volatility (standard deviation of returns)
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0

  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length

  return Math.sqrt(variance)
}

/**
 * Calculate spread in basis points
 */
export function calculateSpreadBps(bid: number, ask: number): number {
  if (bid <= 0 || ask <= 0) return 0
  const mid = (bid + ask) / 2
  return ((ask - bid) / mid) * 10000
}

/**
 * Calculate order book depth in USD
 */
export function calculateDepthUsd(orderBookLevels: Array<{ price: number; quantity: number }>, maxLevels: number = 50): number {
  const levels = orderBookLevels.slice(0, maxLevels)
  return levels.reduce((sum, level) => sum + (level.price * level.quantity), 0)
}

/**
 * Robust normalization with clipping
 */
export function robustNormalize(value: number, target: number, maxDeviation: number = 1.5): number {
  const ratio = value / target
  const clippedRatio = clamp(ratio, 1 - maxDeviation, 1 + maxDeviation)
  return (clippedRatio - (1 - maxDeviation)) / (2 * maxDeviation)
}

/**
 * Calculate impulse score from returns and volume
 */
export function calculateImpulseScore(returns: number[], volumes: number[]): number {
  if (returns.length !== volumes.length || returns.length < 10) {
    return 0
  }

  // Calculate z-scores for returns and volume
  const returnZ = calculateZScore(returns[returns.length - 1], returns.slice(-50))
  const volumeZ = calculateZScore(volumes[volumes.length - 1], volumes.slice(-50))

  // Combined impulse score
  const impulseZ = (returnZ.zscore + volumeZ.zscore) / 2

  // Clamp between -3 and 3, then normalize to 0-100
  const clampedZ = clamp(impulseZ, -3, 3)
  return ((clampedZ + 3) / 6) * 100
}
