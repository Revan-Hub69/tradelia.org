import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { MarketDataService } from '../screener/marketDataService'
import {
  MarketRegime,
  MarketRegimeResult,
  RegimeSignal,
  REGIME_DEFINITIONS,
  KlineData
} from './types'
import {
  calculateATR,
  calculateAtrPercentage,
  calculateReturns,
  calculateVolatility,
  calculateZScore
} from '../screener/mathUtils'

export class RegimeDetector {
  private prisma: PrismaClient
  private marketDataService: MarketDataService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.marketDataService = new MarketDataService()
  }

  /**
   * Detect current market regime using BTCUSDT + ETHUSDT
   */
  async detectRegime(): Promise<MarketRegimeResult> {
    const signals: RegimeSignal[] = []

    // Get BTC and ETH data
    const [btcSignals, ethSignals] = await Promise.all([
      this.analyzeSymbol('BTCUSDT'),
      this.analyzeSymbol('ETHUSDT')
    ])

    signals.push(...btcSignals, ...ethSignals)

    // Determine regime based on signals
    const regime = this.determineRegime(signals)
    const confidence = this.calculateConfidence(signals, regime)

    // Check for DEAD regime override
    const deadSignals = signals.filter(s => s.indicator.includes('dead'))
    const deadConfidence = deadSignals.length > 0
      ? deadSignals.reduce((sum, s) => sum + Math.abs(s.strength), 0) / deadSignals.length * 100
      : 0

    const finalRegime = deadConfidence > 60 ? 'DEAD' : regime
    const finalConfidence = finalRegime === 'DEAD' ? deadConfidence : confidence

    return {
      regime: finalRegime,
      confidence: finalConfidence,
      allowedDirections: [...REGIME_DEFINITIONS[finalRegime].allowedDirections],
      signals,
      timestamp: new Date()
    }
  }

  /**
   * Analyze a single symbol for regime signals
   */
  private async analyzeSymbol(symbol: string): Promise<RegimeSignal[]> {
    const signals: RegimeSignal[] = []

    try {
      // Get multi-timeframe klines
      const klinesMap = await this.marketDataService.getKlinesMultiTimeframe(symbol, ['5m', '15m', '1h'])

      // 1. Funding Rate Bias (if available)
      const fundingSignal = await this.analyzeFundingRate(symbol)
      if (fundingSignal) signals.push(fundingSignal)

      // 2. Open Interest Trend
      const oiSignal = await this.analyzeOpenInterest(symbol)
      if (oiSignal) signals.push(oiSignal)

      // 3. Returns Analysis (5m, 15m, 1h)
      const returnSignals = this.analyzeReturns(klinesMap)
      signals.push(...returnSignals)

      // 4. ATR Compression/Expansion
      const atrSignals = this.analyzeATR(klinesMap)
      signals.push(...atrSignals)

      // 5. Volume Expansion
      const volumeSignals = this.analyzeVolume(klinesMap)
      signals.push(...volumeSignals)

      // 6. VWAP Slope
      const vwapSignals = this.analyzeVWAP(klinesMap)
      signals.push(...vwapSignals)

      // 7. Dead Market Detection
      const deadSignals = this.detectDeadMarket(klinesMap, symbol)
      signals.push(...deadSignals)

    } catch (error) {
      console.error(`Failed to analyze ${symbol}:`, error)
      // Add error signal
      signals.push({
        indicator: 'analysis_error',
        value: 0,
        threshold: 0,
        strength: 0
      })
    }

    return signals
  }

  /**
   * Analyze funding rate bias (trend indicator)
   */
  private async analyzeFundingRate(symbol: string): Promise<RegimeSignal | null> {
    try {
      // Note: Binance futures API doesn't expose funding rate history easily
      // This would need a different data source or premium endpoint
      // For now, return neutral signal
      return {
        indicator: 'funding_bias',
        value: 0, // Neutral
        threshold: 0.01, // 0.01% threshold
        strength: 0 // Neutral strength
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Analyze open interest trend
   */
  private async analyzeOpenInterest(symbol: string): Promise<RegimeSignal | null> {
    try {
      const oi = await this.marketDataService.getOpenInterest(symbol)
      if (!oi) return null

      // Compare to recent OI levels (simplified)
      // In production, would compare to historical OI
      const oiChange = 0 // Placeholder - would calculate % change from baseline

      return {
        indicator: 'oi_trend',
        value: oiChange,
        threshold: 0.05, // 5% change threshold
        strength: Math.max(-1, Math.min(1, oiChange / 0.1)) // Normalize to -1,1
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Analyze returns across timeframes
   */
  private analyzeReturns(klinesMap: Map<string, any[]>): RegimeSignal[] {
    const signals: RegimeSignal[] = []

    // 15m returns (trend strength)
    const kline15m = klinesMap.get('15m') || []
    if (kline15m.length >= 20) {
      const closes15m = kline15m.map(k => k.close)
      const returns15m = calculateReturns(closes15m)

      // Last 4 periods (1 hour) average return
      const recentReturns = returns15m.slice(-4)
      const avgReturn = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length

      signals.push({
        indicator: 'returns_15m',
        value: avgReturn * 100, // Convert to percentage
        threshold: 0.002, // 0.2% threshold
        strength: Math.max(-1, Math.min(1, avgReturn / 0.01)) // Normalize
      })
    }

    // 1h returns (stronger trend signal)
    const kline1h = klinesMap.get('1h') || []
    if (kline1h.length >= 10) {
      const closes1h = kline1h.map(k => k.close)
      const returns1h = calculateReturns(closes1h)

      // Last 6 hours average return
      const recentReturns = returns1h.slice(-6)
      const avgReturn = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length

      signals.push({
        indicator: 'returns_1h',
        value: avgReturn * 100,
        threshold: 0.005, // 0.5% threshold
        strength: Math.max(-1, Math.min(1, avgReturn / 0.02))
      })
    }

    return signals
  }

  /**
   * Analyze ATR for compression/expansion signals
   */
  private analyzeATR(klinesMap: Map<string, any[]>): RegimeSignal[] {
    const signals: RegimeSignal[] = []

    const kline5m = klinesMap.get('5m') || []
    if (kline5m.length < 50) return signals

    try {
      const closes = kline5m.map(k => k.close)
      const highs = kline5m.map(k => k.high)
      const lows = kline5m.map(k => k.low)

      const atr = calculateATR(highs, lows, closes, 14)
      const currentAtrPct = calculateAtrPercentage(atr.atr, closes[closes.length - 1])

      // ATR vs baseline (last 200 periods)
      const baselineStart = Math.max(0, closes.length - 200)
      const baselineCloses = closes.slice(baselineStart, -20) // Exclude last 20
      const baselineHighs = highs.slice(baselineStart, -20)
      const baselineLows = lows.slice(baselineStart, -20)

      if (baselineCloses.length >= 14) {
        const baselineAtr = calculateATR(baselineHighs, baselineLows, baselineCloses, 14)
        const baselineAtrPct = calculateAtrPercentage(baselineAtr.atr, baselineCloses[baselineCloses.length - 1])

        const atrRatio = currentAtrPct / baselineAtrPct

        // ATR compression (range-bound market)
        if (atrRatio < 0.7) {
          signals.push({
            indicator: 'atr_compression',
            value: atrRatio,
            threshold: 0.7,
            strength: Math.max(-1, (0.7 - atrRatio) / 0.3) // Higher compression = stronger signal
          })
        }

        // ATR expansion (volatile breakout)
        if (atrRatio > 1.5) {
          signals.push({
            indicator: 'atr_expansion',
            value: atrRatio,
            threshold: 1.5,
            strength: Math.min(1, (atrRatio - 1.5) / 1.0)
          })
        }
      }

    } catch (error) {
      console.error('ATR analysis failed:', error)
    }

    return signals
  }

  /**
   * Analyze volume patterns
   */
  private analyzeVolume(klinesMap: Map<string, any[]>): RegimeSignal[] {
    const signals: RegimeSignal[] = []

    const kline5m = klinesMap.get('5m') || []
    if (kline5m.length < 20) return signals

    const volumes = kline5m.map(k => k.volume)

    // Volume spike detection
    const recentVolumes = volumes.slice(-10)
    const avgVolume = volumes.slice(-50, -10).reduce((sum, v) => sum + v, 0) / 40
    const maxRecentVolume = Math.max(...recentVolumes)

    if (avgVolume > 0) {
      const volumeRatio = maxRecentVolume / avgVolume

      if (volumeRatio > 2.0) { // 2x average volume
        signals.push({
          indicator: 'volume_spike',
          value: volumeRatio,
          threshold: 2.0,
          strength: Math.min(1, (volumeRatio - 2.0) / 2.0)
        })
      }
    }

    // Volume stability (for range detection)
    const volatility = calculateVolatility(calculateReturns(volumes.slice(-20)))
    if (volatility < 0.3) { // Low volume volatility = stable
      signals.push({
        indicator: 'volume_stability',
        value: volatility,
        threshold: 0.3,
        strength: Math.max(0, (0.3 - volatility) / 0.3) // Higher stability = stronger
      })
    }

    return signals
  }

  /**
   * Analyze VWAP slope (trend indicator)
   */
  private analyzeVWAP(klinesMap: Map<string, any[]>): RegimeSignal[] {
    const signals: RegimeSignal[] = []

    // Simplified VWAP slope - in practice would calculate actual VWAP
    // For now, use price slope as proxy
    const kline15m = klinesMap.get('15m') || []
    if (kline15m.length < 10) return signals

    const closes = kline15m.map(k => k.close)

    // Calculate slope over last 6 periods (1.5 hours)
    const recentCloses = closes.slice(-6)
    if (recentCloses.length >= 6) {
      // Simple linear regression slope
      const n = recentCloses.length
      const sumX = (n * (n - 1)) / 2
      const sumY = recentCloses.reduce((sum, y) => sum + y, 0)
      const sumXY = recentCloses.reduce((sum, y, i) => sum + y * i, 0)
      const sumXX = (n * (n - 1) * (2 * n - 1)) / 6

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

      // Normalize slope by average price
      const avgPrice = recentCloses.reduce((sum, p) => sum + p, 0) / recentCloses.length
      const slopePct = slope / avgPrice

      signals.push({
        indicator: 'vwap_slope',
        value: slopePct * 100, // Convert to percentage
        threshold: 0.001, // 0.1% per period threshold
        strength: Math.max(-1, Math.min(1, slopePct / 0.005)) // Normalize to -1,1
      })
    }

    return signals
  }

  /**
   * Detect dead market conditions
   */
  private detectDeadMarket(klinesMap: Map<string, any[]>, symbol: string): RegimeSignal[] {
    const signals: RegimeSignal[] = []

    const kline1m = klinesMap.get('1m') || []
    if (kline1m.length < 30) return signals

    // Low volume detection
    const volumes = kline1m.map(k => k.volume)
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length

    // Low ATR (dead volatility)
    const closes = kline1m.map(k => k.close)
    const highs = kline1m.map(k => k.high)
    const lows = kline1m.map(k => k.low)

    try {
      const atr = calculateATR(highs, lows, closes, 14)
      const atrPct = calculateAtrPercentage(atr.atr, closes[closes.length - 1])

      if (atrPct < 0.0005) { // Very low volatility (< 0.05%)
        signals.push({
          indicator: 'dead_low_atr',
          value: atrPct,
          threshold: 0.0005,
          strength: 1 // Strong dead signal
        })
      }

      // Low volume for BTC specifically
      if (symbol === 'BTCUSDT' && avgVolume < 100) { // Very low BTC volume
        signals.push({
          indicator: 'dead_low_volume',
          value: avgVolume,
          threshold: 100,
          strength: 1
        })
      }

    } catch (error) {
      console.error('Dead market detection failed:', error)
    }

    return signals
  }

  /**
   * Determine regime from signals
   */
  private determineRegime(signals: RegimeSignal[]): MarketRegime {
    // Score each regime
    const scores = {
      TREND_UP: 0,
      TREND_DOWN: 0,
      RANGE: 0,
      VOLATILE_BREAKOUT: 0,
      DEAD: 0
    }

    // Weight signals by importance
    for (const signal of signals) {
      const strength = Math.abs(signal.strength)

      switch (signal.indicator) {
        case 'funding_bias':
        case 'oi_trend':
        case 'returns_15m':
        case 'returns_1h':
        case 'vwap_slope':
          // Trend indicators
          if (signal.strength > 0.3) scores.TREND_UP += strength
          else if (signal.strength < -0.3) scores.TREND_DOWN += strength
          break

        case 'atr_compression':
        case 'volume_stability':
          // Range indicators
          if (signal.strength > 0.5) scores.RANGE += signal.strength
          break

        case 'atr_expansion':
        case 'volume_spike':
          // Breakout indicators
          if (signal.strength > 0.5) scores.VOLATILE_BREAKOUT += signal.strength
          break

        case 'dead_low_atr':
        case 'dead_low_volume':
          // Dead market indicators
          scores.DEAD += strength
          break
      }
    }

    // Find regime with highest score
    let maxScore = 0
    let bestRegime: MarketRegime = 'RANGE'

    for (const [regime, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        bestRegime = regime as MarketRegime
      }
    }

    return bestRegime
  }

  /**
   * Calculate confidence in regime determination
   */
  private calculateConfidence(signals: RegimeSignal[], regime: MarketRegime): number {
    const relevantSignals = signals.filter(signal => {
      const indicators = REGIME_DEFINITIONS[regime].indicators
      return indicators.some(ind => signal.indicator.includes(ind))
    })

    if (relevantSignals.length === 0) return 0

    // Average strength of relevant signals
    const avgStrength = relevantSignals.reduce((sum, s) => sum + Math.abs(s.strength), 0) / relevantSignals.length

    // Convert to 0-100 confidence
    return Math.min(100, avgStrength * 100)
  }
}
