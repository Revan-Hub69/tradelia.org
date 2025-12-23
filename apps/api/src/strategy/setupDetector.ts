import { PrismaClient } from '@prisma/client'
import { MarketDataService } from '../screener/marketDataService'
import { MarketRegime } from './types'
import {
  TradeSetup,
  SetupType,
  MarketRegimeResult
} from './types'
import {
  calculateATR,
  calculateAtrPercentage,
  calculateReturns,
  calculateVolatility,
  calculateZScore,
  clamp01
} from '../screener/mathUtils'

export class SetupDetector {
  private prisma: PrismaClient
  private marketDataService: MarketDataService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.marketDataService = new MarketDataService()
  }

  /**
   * Detect trade setups for screened symbols
   */
  async detectSetups(
    symbols: string[],
    regime: MarketRegimeResult
  ): Promise<TradeSetup[]> {
    const setups: TradeSetup[] = []

    // Filter symbols by regime-allowed directions
    const allowedSymbols = symbols.filter(symbol => {
      // Get symbol data to determine direction
      // For now, check both directions if allowed
      return regime.allowedDirections.length > 0
    })

    for (const symbol of allowedSymbols) {
      try {
        const symbolSetups = await this.analyzeSymbol(symbol, regime)
        setups.push(...symbolSetups)
      } catch (error) {
        console.error(`Failed to analyze setups for ${symbol}:`, error)
      }
    }

    // Sort by confidence descending
    setups.sort((a, b) => b.confidence - a.confidence)

    return setups
  }

  /**
   * Analyze a single symbol for trade setups
   */
  private async analyzeSymbol(
    symbol: string,
    regime: MarketRegimeResult
  ): Promise<TradeSetup[]> {
    const setups: TradeSetup[] = []

    try {
      // Get multi-timeframe data
      const klinesMap = await this.marketDataService.getKlinesMultiTimeframe(
        symbol,
        ['1m', '5m', '15m']
      )

      // Get current price for calculations
      const ticker = await this.marketDataService.getBookTicker(symbol)
      if (!ticker) return setups

      const currentPrice = ticker.bid

      // Detect different setup types based on regime
      if (regime.allowedDirections.includes('LONG')) {
        // LONG setups
        const squeezeSetup = this.detectVolatilitySqueeze(klinesMap, 'LONG', currentPrice)
        if (squeezeSetup) setups.push(squeezeSetup)

        const vwapSetup = this.detectVWAPReclaim(klinesMap, 'LONG', currentPrice)
        if (vwapSetup) setups.push(vwapSetup)

        const liquiditySetup = this.detectLiquiditySweep(klinesMap, 'LONG', currentPrice)
        if (liquiditySetup) setups.push(liquiditySetup)

        if (regime.regime === 'VOLATILE_BREAKOUT') {
          const breakoutSetup = this.detectRangeBreak(klinesMap, 'LONG', currentPrice)
          if (breakoutSetup) setups.push(breakoutSetup)
        }
      }

      if (regime.allowedDirections.includes('SHORT')) {
        // SHORT setups
        const squeezeSetup = this.detectVolatilitySqueeze(klinesMap, 'SHORT', currentPrice)
        if (squeezeSetup) setups.push(squeezeSetup)

        const vwapSetup = this.detectVWAPReclaim(klinesMap, 'SHORT', currentPrice)
        if (vwapSetup) setups.push(vwapSetup)

        const liquiditySetup = this.detectLiquiditySweep(klinesMap, 'SHORT', currentPrice)
        if (liquiditySetup) setups.push(liquiditySetup)

        if (regime.regime === 'VOLATILE_BREAKOUT') {
          const breakoutSetup = this.detectRangeBreak(klinesMap, 'SHORT', currentPrice)
          if (breakoutSetup) setups.push(breakoutSetup)
        }
      }

      // Funding fade setups (only if regime allows)
      if (regime.regime !== 'DEAD') {
        const fundingSetups = await this.detectFundingFade(symbol, regime, currentPrice)
        setups.push(...fundingSetups)
      }

    } catch (error) {
      console.error(`Setup detection failed for ${symbol}:`, error)
    }

    return setups
  }

  /**
   * Detect volatility squeeze setups
   */
  private detectVolatilitySqueeze(
    klinesMap: Map<string, any[]>,
    direction: 'LONG' | 'SHORT',
    currentPrice: number
  ): TradeSetup | null {
    const kline5m = klinesMap.get('5m') || []
    if (kline5m.length < 20) return null

    try {
      // Calculate ATR compression over last 10 periods
      const recentKlines = kline5m.slice(-10)
      const highs = recentKlines.map(k => k.high)
      const lows = recentKlines.map(k => k.low)
      const closes = recentKlines.map(k => k.close)

      const atr = calculateATR(highs, lows, closes, 5)
      const atrPct = calculateAtrPercentage(atr.atr, closes[closes.length - 1])

      // Look for ATR contraction (squeeze)
      const atrHistory = []
      for (let i = 5; i <= 10; i++) {
        const historicalAtr = calculateATR(highs.slice(0, i), lows.slice(0, i), closes.slice(0, i), 5)
        atrHistory.push(calculateAtrPercentage(historicalAtr.atr, closes[i - 1]))
      }

      const avgAtrPct = atrHistory.reduce((sum, atr) => sum + atr, 0) / atrHistory.length
      const atrRatio = atrPct / avgAtrPct

      // Squeeze condition: ATR significantly below average
      if (atrRatio < 0.6) { // 40% below average ATR
        const confidence = clamp01((0.6 - atrRatio) / 0.4) * 100

        // Entry zone based on recent range
        const recentRange = Math.max(...highs.slice(-5)) - Math.min(...lows.slice(-5))
        const buffer = recentRange * 0.1 // 10% buffer

        let entryMin: number
        let entryMax: number
        let invalidation: number

        if (direction === 'LONG') {
          // Long: enter on break above recent high
          entryMin = Math.max(...highs.slice(-3))
          entryMax = entryMin + buffer
          invalidation = Math.min(...lows.slice(-5)) // Break recent low = invalid
        } else {
          // Short: enter on break below recent low
          entryMax = Math.min(...lows.slice(-3))
          entryMin = entryMax - buffer
          invalidation = Math.max(...highs.slice(-5)) // Break recent high = invalid
        }

        return {
          symbol: '', // Will be set by caller
          direction,
          setupType: 'SQUEEZE',
          entryZone: { min: entryMin, max: entryMax },
          invalidation,
          confidence,
          metadata: {
            atrRatio,
            avgAtrPct,
            currentAtrPct: atrPct
          },
          timestamp: new Date()
        }
      }

    } catch (error) {
      console.error('Squeeze detection failed:', error)
    }

    return null
  }

  /**
   * Detect VWAP reclaim setups
   */
  private detectVWAPReclaim(
    klinesMap: Map<string, any[]>,
    direction: 'LONG' | 'SHORT',
    currentPrice: number
  ): TradeSetup | null {
    const kline5m = klinesMap.get('5m') || []
    if (kline5m.length < 30) return null

    try {
      // Calculate simple VWAP proxy (cumulative price * volume / cumulative volume)
      const recentKlines = kline5m.slice(-20) // Last 20 periods (100 minutes)

      let cumulativePV = 0
      let cumulativeVolume = 0

      for (const kline of recentKlines) {
        const typicalPrice = (kline.high + kline.low + kline.close) / 3
        cumulativePV += typicalPrice * kline.volume
        cumulativeVolume += kline.volume
      }

      const vwap = cumulativeVolume > 0 ? cumulativePV / cumulativeVolume : currentPrice

      // Check if price is testing VWAP
      const priceDeviation = Math.abs(currentPrice - vwap) / vwap

      if (priceDeviation < 0.005) { // Within 0.5% of VWAP
        let confidence = 0

        if (direction === 'LONG' && currentPrice < vwap) {
          // Long: reclaim above VWAP
          confidence = clamp01((vwap - currentPrice) / (vwap * 0.01)) * 100
        } else if (direction === 'SHORT' && currentPrice > vwap) {
          // Short: reclaim below VWAP
          confidence = clamp01((currentPrice - vwap) / (vwap * 0.01)) * 100
        }

        if (confidence > 30) { // Minimum confidence threshold
          const entryMin = direction === 'LONG' ? vwap * 0.999 : vwap * 0.995
          const entryMax = direction === 'LONG' ? vwap * 1.005 : vwap * 1.001

          return {
            symbol: '',
            direction,
            setupType: 'VWAP',
            entryZone: { min: entryMin, max: entryMax },
            invalidation: direction === 'LONG' ? vwap * 0.99 : vwap * 1.01,
            confidence,
            metadata: {
              vwap,
              priceDeviation: priceDeviation * 100,
              direction
            },
            timestamp: new Date()
          }
        }
      }

    } catch (error) {
      console.error('VWAP detection failed:', error)
    }

    return null
  }

  /**
   * Detect liquidity sweep setups
   */
  private detectLiquiditySweep(
    klinesMap: Map<string, any[]>,
    direction: 'LONG' | 'SHORT',
    currentPrice: number
  ): TradeSetup | null {
    const kline1m = klinesMap.get('1m') || []
    if (kline1m.length < 15) return null

    try {
      // Look for recent high volume bars that swept liquidity
      const recentKlines = kline1m.slice(-10)
      const volumes = recentKlines.map(k => k.volume)
      const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length

      // Find high volume bars
      const highVolumeBars = recentKlines.filter(kline =>
        kline.volume > avgVolume * 1.5 // 50% above average
      )

      if (highVolumeBars.length === 0) return null

      // Check if they swept recent highs/lows
      const recentHigh = Math.max(...recentKlines.map(k => k.high))
      const recentLow = Math.min(...recentKlines.map(k => k.low))

      let setupFound = false
      let confidence = 0

      if (direction === 'LONG') {
        // Long: high volume bar broke and closed above recent high
        const sweepBar = highVolumeBars.find(bar =>
          bar.high > recentHigh && bar.close > bar.open
        )
        if (sweepBar) {
          setupFound = true
          confidence = clamp01(sweepBar.volume / (avgVolume * 2)) * 100
        }
      } else {
        // Short: high volume bar broke and closed below recent low
        const sweepBar = highVolumeBars.find(bar =>
          bar.low < recentLow && bar.close < bar.open
        )
        if (sweepBar) {
          setupFound = true
          confidence = clamp01(sweepBar.volume / (avgVolume * 2)) * 100
        }
      }

      if (setupFound && confidence > 40) {
        // Entry zone slightly beyond the sweep
        const buffer = (recentHigh - recentLow) * 0.05 // 5% buffer

        const entryMin = direction === 'LONG' ? recentHigh : recentLow - buffer
        const entryMax = direction === 'LONG' ? recentHigh + buffer : recentLow

        return {
          symbol: '',
          direction,
          setupType: 'BREAKOUT',
          entryZone: { min: entryMin, max: entryMax },
          invalidation: direction === 'LONG' ? recentLow : recentHigh,
          confidence,
          metadata: {
            recentHigh,
            recentLow,
            avgVolume,
            highVolumeBars: highVolumeBars.length
          },
          timestamp: new Date()
        }
      }

    } catch (error) {
      console.error('Liquidity sweep detection failed:', error)
    }

    return null
  }

  /**
   * Detect range break setups (for breakout regime)
   */
  private detectRangeBreak(
    klinesMap: Map<string, any[]>,
    direction: 'LONG' | 'SHORT',
    currentPrice: number
  ): TradeSetup | null {
    const kline15m = klinesMap.get('15m') || []
    if (kline15m.length < 20) return null

    try {
      // Define range from last 10 periods
      const rangeKlines = kline15m.slice(-10)
      const rangeHigh = Math.max(...rangeKlines.map(k => k.high))
      const rangeLow = Math.min(...rangeKlines.map(k => k.low))
      const range = rangeHigh - rangeLow

      // Check for break with volume
      const lastKline = kline15m[kline15m.length - 1]
      const volume = lastKline.volume

      // Calculate average volume
      const volumes = kline15m.slice(-20).map(k => k.volume)
      const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length

      let confidence = 0
      let entryMin: number
      let entryMax: number

      if (direction === 'LONG' && lastKline.close > rangeHigh && volume > avgVolume * 1.2) {
        // Break above range with volume
        confidence = clamp01(volume / (avgVolume * 2)) * 100
        entryMin = rangeHigh
        entryMax = rangeHigh + (range * 0.1) // 10% above break
      } else if (direction === 'SHORT' && lastKline.close < rangeLow && volume > avgVolume * 1.2) {
        // Break below range with volume
        confidence = clamp01(volume / (avgVolume * 2)) * 100
        entryMax = rangeLow
        entryMin = rangeLow - (range * 0.1) // 10% below break
      } else {
        return null
      }

      if (confidence > 50) {
        return {
          symbol: '',
          direction,
          setupType: 'BREAKOUT',
          entryZone: { min: entryMin, max: entryMax },
          invalidation: direction === 'LONG' ? rangeLow : rangeHigh,
          confidence,
          metadata: {
            rangeHigh,
            rangeLow,
            range,
            breakVolume: volume,
            avgVolume
          },
          timestamp: new Date()
        }
      }

    } catch (error) {
      console.error('Range break detection failed:', error)
    }

    return null
  }

  /**
   * Detect funding rate fade setups
   */
  private async detectFundingFade(
    symbol: string,
    regime: MarketRegimeResult,
    currentPrice: number
  ): Promise<TradeSetup[]> {
    const setups: TradeSetup[] = []

    // Funding rate analysis would require premium data
    // This is a placeholder for future implementation
    // For now, return empty array

    return setups
  }
}
