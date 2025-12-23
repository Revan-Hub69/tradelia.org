import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { HybridDataService } from './hybridDataService'
import {
  SymbolScores,
  SymbolCandidate,
  KlineData,
  OrderBookData,
  SCORE_WEIGHTS,
  DEFAULT_THRESHOLDS,
  MtfGateResult
} from './types'
import {
  calculateATR,
  calculateAtrPercentage,
  calculateSpreadBps,
  calculateDepthUsd,
  calculateImpulseScore,
  clamp01,
  robustNormalize
} from './mathUtils'

export class ScoreCalculator {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Calculate all scores for a symbol
   */
  async calculateSymbolScores(
    symbol: string,
    candidate: SymbolCandidate,
    klinesMap: Map<string, KlineData[]>,
    orderBook: OrderBookData | null,
    spreadData: { bid: number; ask: number; spreadBps: number } | null,
    openInterest: number | null
  ): Promise<SymbolScores> {
    // Calculate individual scores
    const lqs = await this.calculateLiquidityScore(symbol, orderBook, spreadData)
    const vos = this.calculateVolatilityScore(symbol, klinesMap)
    const dfs = this.calculateDerivativesScore(symbol, klinesMap, openInterest)
    const mes = this.calculateMicrostructureScore(symbol, orderBook)

    // Calculate MTF gate
    const mtfGate = this.calculateMtfGate(symbol, klinesMap)

    // Check for veto conditions
    const vetoed = this.checkVetoConditions(spreadData, orderBook)
    const reasons = this.getReasonCodes(symbol, candidate, spreadData, orderBook, mtfGate)

    // Calculate total score (0-100, vetoed symbols get 0)
    const totalScore = vetoed ? 0 : this.calculateTotalScore(lqs, vos, dfs, mes)

    return {
      symbol,
      lqs,
      vos,
      dfs,
      mes,
      mtfGate,
      totalScore,
      vetoed,
      reasons
    }
  }

  /**
   * Calculate Liquidity Quality Score (LQS) - 0-100
   */
  private async calculateLiquidityScore(
    symbol: string,
    orderBook: OrderBookData | null,
    spreadData: { bid: number; ask: number; spreadBps: number } | null
  ): Promise<number> {
    if (!spreadData || !orderBook) {
      return 0 // Cannot calculate without data
    }

    // Spread score (lower spread = higher score)
    const spreadScore = clamp01(1 - spreadData.spreadBps / env.MAX_SPREAD_BPS) * 100

    // Depth score (higher depth = higher score)
    const depthUsd = calculateDepthUsd(orderBook.bids) + calculateDepthUsd(orderBook.asks)
    const depthScore = clamp01(depthUsd / (5 * env.MIN_DEPTH_USD_TOPN)) * 100

    // For now, skip intensity score (would need trade data)
    // In production, would calculate from recent trades
    const intensityScore = 50 // Placeholder

    // Weighted average
    return 0.45 * spreadScore + 0.40 * depthScore + 0.15 * intensityScore
  }

  /**
   * Calculate Volatility Opportunity Score (VOS) - 0-100
   */
  private calculateVolatilityScore(symbol: string, klinesMap: Map<string, KlineData[]>): number {
    const kline1m = klinesMap.get('1m') || []
    const kline5m = klinesMap.get('5m') || []

    if (kline1m.length < 20 || kline5m.length < 20) {
      return 0 // Insufficient data
    }

    try {
      // Calculate ATR for 5m timeframe
      const closes5m = kline5m.map(k => k.close)
      const highs5m = kline5m.map(k => k.high)
      const lows5m = kline5m.map(k => k.low)

      const atr5m = calculateATR(highs5m, lows5m, closes5m, 14)
      const currentPrice = closes5m[closes5m.length - 1]

      // ATR percentage score
      const atrPct5m = calculateAtrPercentage(atr5m.atr, currentPrice)
      const atrScore = clamp01(atrPct5m / DEFAULT_THRESHOLDS.targetAtrPct) * 100

      // Volatility expansion score (ATR_1m_now / ATR_1m_baseline)
      const closes1m = kline1m.map(k => k.close)
      const highs1m = kline1m.map(k => k.high)
      const lows1m = kline1m.map(k => k.low)

      const atr1m = calculateATR(highs1m, lows1m, closes1m, 14)
      const baselineStart = Math.max(0, closes1m.length - 200) // Last 200 periods
      const baselineCloses = closes1m.slice(baselineStart, -50) // Exclude last 50 for current
      const baselineHighs = highs1m.slice(baselineStart, -50)
      const baselineLows = lows1m.slice(baselineStart, -50)

      let expansionScore: number
      if (baselineCloses.length >= 14) {
        const baselineAtr = calculateATR(baselineHighs, baselineLows, baselineCloses, 14)
        const expansionRatio = atr1m.atr / baselineAtr.atr
        expansionScore = clamp01((expansionRatio - 1) / 1.5) * 100
      } else {
        expansionScore = 50 // Neutral if insufficient baseline
      }

      // Chop penalty (avoid ranging markets)
      const range5m = this.calculateAverageRange(kline5m.slice(-20)) // Last 20 periods
      const rangeScore = range5m / atrPct5m // Higher ratio = more trending
      const chopPenalty = Math.max(0, 50 - rangeScore * 10) // Penalty for choppy markets

      return 0.45 * atrScore + 0.35 * expansionScore + 0.20 * Math.max(0, 100 - chopPenalty)

    } catch (error) {
      console.warn(`Failed to calculate volatility score for ${symbol}:`, error)
      return 0
    }
  }

  /**
   * Calculate Derivatives Flow Score (DFS) - 0-100
   */
  private calculateDerivativesScore(
    symbol: string,
    klinesMap: Map<string, KlineData[]>,
    openInterest: number | null
  ): number {
    const kline1m = klinesMap.get('1m') || []

    if (kline1m.length < 50) {
      return 0 // Insufficient data
    }

    try {
      // For now, use impulse score as proxy (since OI data may not be available)
      // In production with OI data, would combine OI changes + dislocation + impulse
      const closes = kline1m.map(k => k.close)
      const volumes = kline1m.map(k => k.volume)
      const impulseScore = calculateImpulseScore(closes, volumes)

      // If OI is available, could add OI change component
      if (openInterest !== null && openInterest > 0) {
        // Add OI stability factor (placeholder)
        return Math.min(100, impulseScore + 10)
      }

      return impulseScore

    } catch (error) {
      console.warn(`Failed to calculate derivatives score for ${symbol}:`, error)
      return 0
    }
  }

  /**
   * Calculate Microstructure Edge Score (MES) - 0-100
   */
  private calculateMicrostructureScore(symbol: string, orderBook: OrderBookData | null): number {
    if (!orderBook || orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      return 0
    }

    try {
      // Calculate imbalance
      const bidDepth = calculateDepthUsd(orderBook.bids.slice(0, 10)) // Top 10 levels
      const askDepth = calculateDepthUsd(orderBook.asks.slice(0, 10))
      const totalDepth = bidDepth + askDepth

      if (totalDepth === 0) return 0

      const imbalance = (bidDepth - askDepth) / totalDepth
      const imbalanceScore = clamp01(Math.abs(imbalance) / 0.25) * 100

      // Stability score (placeholder - would need time series of imbalance)
      // For now, use a neutral score
      const stabilityScore = 60

      // Sweep rate proxy (placeholder - would need trade data)
      const sweepScore = 50

      return 0.40 * imbalanceScore + 0.35 * stabilityScore + 0.25 * sweepScore

    } catch (error) {
      console.warn(`Failed to calculate microstructure score for ${symbol}:`, error)
      return 0
    }
  }

  /**
   * Calculate MTF Gate (enable/disable gating)
   */
  private calculateMtfGate(symbol: string, klinesMap: Map<string, KlineData[]>): MtfGateResult {
    const kline5m = klinesMap.get('5m') || []
    const kline15m = klinesMap.get('15m') || []

    if (kline5m.length < 20 || kline15m.length < 20) {
      return 'REVIEW' // Insufficient data
    }

    try {
      // Calculate ATR for 15m
      const closes15m = kline15m.map(k => k.close)
      const highs15m = kline15m.map(k => k.high)
      const lows15m = kline15m.map(k => k.low)

      const atr15m = calculateATR(highs15m, lows15m, closes15m, 14)
      const currentPrice = closes15m[closes15m.length - 1]
      const atrPct15m = calculateAtrPercentage(atr15m.atr, currentPrice)

      // Check ATR threshold
      if (atrPct15m < DEFAULT_THRESHOLDS.minAtrPct1m) {
        return 'FAIL' // Dead market
      }

      // Check range threshold for 15m
      const range15m = this.calculateAverageRange(kline15m.slice(-5)) // Last 5 periods
      if (range15m < DEFAULT_THRESHOLDS.minAtrPct1m * currentPrice) {
        return 'FAIL' // Insufficient range
      }

      // EMA slope check for 5m (placeholder - would calculate slope)
      // For now, pass if we have sufficient data
      return 'PASS'

    } catch (error) {
      console.warn(`Failed to calculate MTF gate for ${symbol}:`, error)
      return 'REVIEW'
    }
  }

  /**
   * Check veto conditions
   */
  private checkVetoConditions(
    spreadData: { bid: number; ask: number; spreadBps: number } | null,
    orderBook: OrderBookData | null
  ): boolean {
    // Spread veto
    if (!spreadData || spreadData.spreadBps > env.MAX_SPREAD_BPS) {
      return true
    }

    // Depth veto
    if (orderBook) {
      const depthUsd = calculateDepthUsd(orderBook.bids) + calculateDepthUsd(orderBook.asks)
      if (depthUsd < env.MIN_DEPTH_USD_TOPN) {
        return true
      }
    }

    return false
  }

  /**
   * Generate reason codes for filtering decisions
   */
  private getReasonCodes(
    symbol: string,
    candidate: SymbolCandidate,
    spreadData: { bid: number; ask: number; spreadBps: number } | null,
    orderBook: OrderBookData | null,
    mtfGate: MtfGateResult
  ): string[] {
    const reasons: string[] = []

    // Volume check
    if (!candidate.isTradable) {
      reasons.push(`volume_too_low_${candidate.quoteVolume24h}`)
    }

    // Spread check
    if (spreadData && spreadData.spreadBps > env.MAX_SPREAD_BPS) {
      reasons.push(`spread_too_high_${spreadData.spreadBps.toFixed(2)}`)
    }

    // Depth check
    if (orderBook) {
      const depthUsd = calculateDepthUsd(orderBook.bids) + calculateDepthUsd(orderBook.asks)
      if (depthUsd < env.MIN_DEPTH_USD_TOPN) {
        reasons.push(`depth_insufficient_${depthUsd.toFixed(0)}`)
      }
    }

    // MTF gate
    if (mtfGate === 'FAIL') {
      reasons.push('mtf_gate_fail')
    } else if (mtfGate === 'REVIEW') {
      reasons.push('mtf_gate_review')
    }

    return reasons
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(lqs: number, vos: number, dfs: number, mes: number): number {
    return clamp01(
      (lqs * SCORE_WEIGHTS.LQS +
       vos * SCORE_WEIGHTS.VOS +
       dfs * SCORE_WEIGHTS.DFS +
       mes * SCORE_WEIGHTS.MES) / 100
    ) * 100
  }

  /**
   * Calculate average true range over recent periods
   */
  private calculateAverageRange(klines: KlineData[]): number {
    if (klines.length < 2) return 0

    const ranges = klines.map(kline => kline.high - kline.low)
    return ranges.reduce((sum, range) => sum + range, 0) / ranges.length
  }
}
