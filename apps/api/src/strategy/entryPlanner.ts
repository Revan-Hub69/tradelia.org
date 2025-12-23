import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { RiskEngine } from '../risk/riskEngine'
import {
  TradeSetup,
  OrderIntent,
  StrategyConfig
} from './types'
import {
  calculateATR,
  calculateAtrPercentage,
  clamp01
} from '../screener/mathUtils'

export class EntryPlanner {
  private prisma: PrismaClient
  private riskEngine: RiskEngine
  private config: StrategyConfig

  constructor(prisma: PrismaClient, riskEngine: RiskEngine, config: StrategyConfig) {
    this.prisma = prisma
    this.riskEngine = riskEngine
    this.config = config
  }

  /**
   * Convert trade setup to executable order intent
   */
  async planEntry(setup: TradeSetup): Promise<OrderIntent | null> {
    try {
      // Get current market data
      const symbol = setup.symbol
      const ticker = await this.getCurrentPrice(symbol)
      if (!ticker) return null

      const currentPrice = ticker.bid

      // Check if setup is still valid
      if (!this.isSetupValid(setup, currentPrice)) {
        console.log(`Setup invalidated for ${symbol}`)
        return null
      }

      // Calculate position sizing based on risk
      const riskAmount = this.calculateRiskAmount()
      const stopLoss = this.calculateStopLoss(setup, currentPrice)

      if (!stopLoss) return null

      const takeProfit = this.calculateTakeProfit(setup, currentPrice, stopLoss)

      if (!takeProfit) return null

      // Calculate position size
      const riskPerTrade = Math.abs(currentPrice - stopLoss.price) / currentPrice
      const positionSize = (riskAmount / riskPerTrade) / currentPrice

      // Ensure position size is reasonable
      const maxPositionSize = this.getMaxPositionSize(symbol)
      const finalSize = Math.min(positionSize, maxPositionSize)

      if (finalSize < 0.001) { // Minimum position size
        console.log(`Position size too small for ${symbol}: ${finalSize}`)
        return null
      }

      // Create order intent
      const intent: OrderIntent = {
        symbol,
        planId: `STRATEGY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        side: setup.direction,
        quantity: finalSize.toFixed(3),
        slPrice: stopLoss.price.toFixed(4),
        tpPrice: takeProfit.price.toFixed(4),
        entryType: 'MARKET',
        metadata: {
          setupType: setup.setupType,
          setupConfidence: setup.confidence,
          riskAmount,
          riskPerTrade: riskPerTrade * 100,
          stopReason: stopLoss.reason,
          tpReason: takeProfit.reason,
          entryZone: setup.entryZone,
          invalidation: setup.invalidation
        }
      }

      // Final risk check
      const riskCheck = await this.riskEngine.canEnter(
        symbol,
        finalSize.toFixed(3),
        stopLoss.price.toString()
      )

      if (!riskCheck.canEnter) {
        console.log(`Risk check failed for ${symbol}: ${riskCheck.reason}`)
        return null
      }

      return intent

    } catch (error) {
      console.error(`Entry planning failed for ${setup.symbol}:`, error)
      return null
    }
  }

  /**
   * Get current market price
   */
  private async getCurrentPrice(symbol: string): Promise<{ bid: number; ask: number } | null> {
    try {
      // This would use the market data service
      // For now, return mock data
      return {
        bid: 50000, // Mock BTC price
        ask: 50001
      }
    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Check if setup is still valid
   */
  private isSetupValid(setup: TradeSetup, currentPrice: number): boolean {
    const { entryZone, invalidation } = setup

    // Check if price is still in entry zone
    if (currentPrice < entryZone.min || currentPrice > entryZone.max) {
      return false
    }

    // Check invalidation level
    if (setup.direction === 'LONG' && currentPrice <= invalidation) {
      return false
    }
    if (setup.direction === 'SHORT' && currentPrice >= invalidation) {
      return false
    }

    // Check setup age (not older than 5 minutes)
    const setupAge = Date.now() - setup.timestamp.getTime()
    if (setupAge > 5 * 60 * 1000) {
      return false
    }

    return true
  }

  /**
   * Calculate risk amount per trade
   */
  private calculateRiskAmount(): number {
    // Use configured risk per trade percentage
    // In production, this would come from account balance
    const accountBalance = 10000 // Mock account balance
    return accountBalance * (this.config.riskPerTrade / 100)
  }

  /**
   * Calculate stop loss price and reason
   */
  private calculateStopLoss(
    setup: TradeSetup,
    currentPrice: number
  ): { price: number; reason: string } | null {
    const bufferBps = this.config.slBufferBps

    switch (setup.setupType) {
      case 'SQUEEZE':
        // Stop loss based on invalidation level
        return {
          price: setup.invalidation,
          reason: 'squeeze_invalidation'
        }

      case 'VWAP':
        // Stop loss based on VWAP with buffer
        const vwap = setup.metadata?.vwap || currentPrice
        const slBuffer = currentPrice * (bufferBps / 10000)

        if (setup.direction === 'LONG') {
          return {
            price: Math.min(setup.invalidation, vwap - slBuffer),
            reason: 'vwap_break'
          }
        } else {
          return {
            price: Math.max(setup.invalidation, vwap + slBuffer),
            reason: 'vwap_break'
          }
        }

      case 'BREAKOUT':
        // Stop loss based on range breakout failure
        const rangeLow = setup.metadata?.rangeLow || setup.invalidation
        const rangeHigh = setup.metadata?.recentHigh || setup.invalidation

        if (setup.direction === 'LONG') {
          return {
            price: rangeLow,
            reason: 'breakout_failure'
          }
        } else {
          return {
            price: rangeHigh,
            reason: 'breakout_failure'
          }
        }

      default:
        // Default ATR-based stop loss
        const atrMultiplier = 1.5
        const buffer = currentPrice * (bufferBps / 10000)

        if (setup.direction === 'LONG') {
          return {
            price: currentPrice - (currentPrice * 0.02) - buffer, // 2% + buffer
            reason: 'default_atr'
          }
        } else {
          return {
            price: currentPrice + (currentPrice * 0.02) + buffer, // 2% + buffer
            reason: 'default_atr'
          }
        }
    }
  }

  /**
   * Calculate take profit price and reason
   */
  private calculateTakeProfit(
    setup: TradeSetup,
    currentPrice: number,
    stopLoss: { price: number; reason: string }
  ): { price: number; reason: string } | null {
    const riskAmount = Math.abs(currentPrice - stopLoss.price)
    const tpMultiplier = this.config.tpMultiplier

    // Target profit based on risk multiple
    const targetProfit = riskAmount * tpMultiplier

    let tpPrice: number
    let reason: string

    switch (setup.setupType) {
      case 'SQUEEZE':
        // Take profit at R-multiple from entry
        if (setup.direction === 'LONG') {
          tpPrice = currentPrice + targetProfit
          reason = 'squeeze_expansion_target'
        } else {
          tpPrice = currentPrice - targetProfit
          reason = 'squeeze_expansion_target'
        }
        break

      case 'VWAP':
        // Take profit at next resistance/support
        const vwap = setup.metadata?.vwap || currentPrice
        const range = setup.metadata?.priceDeviation ? currentPrice * (setup.metadata.priceDeviation / 100) : currentPrice * 0.01

        if (setup.direction === 'LONG') {
          tpPrice = Math.max(currentPrice + targetProfit, vwap + range)
          reason = 'vwap_resistance'
        } else {
          tpPrice = Math.min(currentPrice - targetProfit, vwap - range)
          reason = 'vwap_support'
        }
        break

      case 'BREAKOUT':
        // Take profit at measured move (range * multiplier)
        const rangeSize = setup.metadata?.range || riskAmount * 2

        if (setup.direction === 'LONG') {
          tpPrice = currentPrice + (rangeSize * 1.5)
          reason = 'breakout_measured_move'
        } else {
          tpPrice = currentPrice - (rangeSize * 1.5)
          reason = 'breakout_measured_move'
        }
        break

      default:
        // Default R-multiple target
        if (setup.direction === 'LONG') {
          tpPrice = currentPrice + targetProfit
          reason = 'default_r_multiple'
        } else {
          tpPrice = currentPrice - targetProfit
          reason = 'default_r_multiple'
        }
    }

    // Ensure take profit is reasonable (not too close to entry)
    const minProfit = riskAmount * 0.5 // Minimum 0.5R
    if (Math.abs(tpPrice - currentPrice) < minProfit) {
      if (setup.direction === 'LONG') {
        tpPrice = currentPrice + minProfit
      } else {
        tpPrice = currentPrice - minProfit
      }
      reason = 'minimum_profit_adjusted'
    }

    return { price: tpPrice, reason }
  }

  /**
   * Get maximum position size for symbol
   */
  private getMaxPositionSize(symbol: string): number {
    // In production, this would consider:
    // - Account balance
    // - Symbol-specific limits
    // - Leverage constraints
    // - Existing positions

    const maxRiskAmount = 1000 // Max $1000 risk per position
    const currentPrice = 50000 // Mock price
    const riskPct = 0.02 // 2% risk

    return (maxRiskAmount / (currentPrice * riskPct))
  }

  /**
   * Update strategy configuration
   */
  updateConfig(newConfig: Partial<StrategyConfig>): void {
    Object.assign(this.config, newConfig)
  }

  /**
   * Get current configuration
   */
  getConfig(): StrategyConfig {
    return { ...this.config }
  }
}
