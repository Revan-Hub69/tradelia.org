import { PrismaClient } from '@prisma/client'
import { OMSService } from '../oms/omsService'
import { RiskEngine } from '../risk/riskEngine'
import { MarketDataService } from '../screener/marketDataService'
import {
  PositionState,
  PositionAction,
  StrategyConfig,
  MarketRegimeResult
} from './types'
import { calculateATR, calculateAtrPercentage } from '../screener/mathUtils'

export class PositionManager {
  private prisma: PrismaClient
  private oms: OMSService
  private riskEngine: RiskEngine
  private marketDataService: MarketDataService
  private config: StrategyConfig

  constructor(
    prisma: PrismaClient,
    oms: OMSService,
    riskEngine: RiskEngine,
    config: StrategyConfig
  ) {
    this.prisma = prisma
    this.oms = oms
    this.riskEngine = riskEngine
    this.marketDataService = new MarketDataService()
    this.config = config
  }

  /**
   * Manage existing positions dynamically
   */
  async managePositions(
    positions: PositionState[],
    regime: MarketRegimeResult
  ): Promise<PositionAction[]> {
    const actions: PositionAction[] = []

    for (const position of positions) {
      try {
        const positionActions = await this.manageSinglePosition(position, regime)
        actions.push(...positionActions)
      } catch (error) {
        console.error(`Failed to manage position ${position.symbol}:`, error)
      }
    }

    return actions
  }

  /**
   * Manage a single position
   */
  private async manageSinglePosition(
    position: PositionState,
    regime: MarketRegimeResult
  ): Promise<PositionAction[]> {
    const actions: PositionAction[] = []

    // Get current price
    const ticker = await this.marketDataService.getBookTicker(position.symbol)
    if (!ticker) return actions

    const currentPrice = ticker.bid
    const pnl = this.calculatePnL(position, currentPrice)
    const pnlPct = pnl / (position.entryPrice * position.size)

    // Update position state
    position.currentPrice = currentPrice
    position.pnl = pnl
    position.pnlPct = pnlPct

    // Check for emergency exits
    const emergencyAction = this.checkEmergencyExit(position, regime)
    if (emergencyAction) {
      actions.push(emergencyAction)
      return actions // Emergency exit takes priority
    }

    // Apply position management rules
    const managementActions = await this.applyManagementRules(position, regime)
    actions.push(...managementActions)

    return actions
  }

  /**
   * Calculate position P&L
   */
  private calculatePnL(position: PositionState, currentPrice: number): number {
    const priceDiff = position.side === 'LONG'
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice

    return priceDiff * position.size
  }

  /**
   * Check for emergency exit conditions
   */
  private checkEmergencyExit(
    position: PositionState,
    regime: MarketRegimeResult
  ): PositionAction | null {
    // Regime change emergency exit
    if (regime.regime === 'DEAD') {
      return {
        type: 'CLOSE_POSITION',
        symbol: position.symbol,
        reason: 'regime_dead_emergency',
        confidence: 100 // Emergency action always high confidence
      }
    }

    // Funding rate extreme (placeholder - would check funding data)
    // OI collapse (placeholder - would check OI changes)

    // Volume divergence (placeholder - would check volume patterns)

    return null
  }

  /**
   * Apply position management rules
   */
  private async applyManagementRules(
    position: PositionState,
    regime: MarketRegimeResult
  ): Promise<PositionAction[]> {
    const actions: PositionAction[] = []

    // 1. Move SL to BE after profit threshold
    const beAction = this.checkBreakEvenMove(position)
    if (beAction) actions.push(beAction)

    // 2. Apply trailing stop loss
    if (this.config.trailingEnabled) {
      const trailAction = this.checkTrailingStop(position)
      if (trailAction) actions.push(trailAction)
    }

    // 3. Check for partial profit taking
    const partialAction = this.checkPartialProfit(position)
    if (partialAction) actions.push(partialAction)

    return actions
  }

  /**
   * Check if SL should be moved to break-even
   */
  private checkBreakEvenMove(position: PositionState): PositionAction | null {
    // Move to BE after 1R profit (configurable)
    const activationR = this.config.trailingActivationR
    const currentR = position.pnlPct / (Math.abs(position.entryPrice - (position.slPrice || position.entryPrice)) / position.entryPrice)

    if (currentR >= activationR && !position.trailingActivated) {
      const bePrice = position.side === 'LONG'
        ? position.entryPrice + (position.entryPrice * 0.001) // Small buffer above entry
        : position.entryPrice - (position.entryPrice * 0.001) // Small buffer below entry

      return {
        type: 'MOVE_SL',
        symbol: position.symbol,
        newSlPrice: bePrice,
        reason: `break_even_after_${activationR}R`,
        confidence: 90 // High confidence for risk management
      }
    }

    return null
  }

  /**
   * Check trailing stop loss
   */
  private checkTrailingStop(position: PositionState): PositionAction | null {
    if (!position.trailingActivated) return null

    const currentPrice = position.currentPrice
    const trailDistance = position.entryPrice * (this.config.trailingDistanceBps / 10000)

    let newSlPrice: number
    let shouldUpdate = false

    if (position.side === 'LONG') {
      // For long positions, trail SL below current price
      newSlPrice = currentPrice - trailDistance

      // Only move SL up (towards profit)
      if (position.slPrice && newSlPrice > position.slPrice) {
        shouldUpdate = true
      }
    } else {
      // For short positions, trail SL above current price
      newSlPrice = currentPrice + trailDistance

      // Only move SL down (towards profit)
      if (position.slPrice && newSlPrice < position.slPrice) {
        shouldUpdate = true
      }
    }

    if (shouldUpdate) {
      return {
        type: 'TRAIL_SL',
        symbol: position.symbol,
        newSlPrice,
        reason: 'trailing_stop_update',
        confidence: 85 // Good confidence for trailing stops
      }
    }

    return null
  }

  /**
   * Check for partial profit taking (optional)
   */
  private checkPartialProfit(position: PositionState): PositionAction | null {
    // For now, no partial profit taking
    // Could implement: take 50% at 2R, remaining at 3R, etc.
    return null
  }

  /**
   * Execute position actions
   */
  async executeActions(actions: PositionAction[]): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeSingleAction(action)
      } catch (error) {
        console.error(`Failed to execute action ${action.type} for ${action.symbol}:`, error)
      }
    }
  }

  /**
   * Execute a single position action
   */
  private async executeSingleAction(action: PositionAction): Promise<void> {
    const { symbol } = action

    // Mock API credentials - in production would come from secure storage
    const apiKey = 'mock_key'
    const apiSecret = 'mock_secret'

    switch (action.type) {
      case 'MOVE_SL':
        if (action.newSlPrice) {
          // Update stop loss order
          console.log(`Moving SL for ${symbol} to ${action.newSlPrice} (${action.reason})`)
          // In production: await this.oms.modifyStopLoss(symbol, action.newSlPrice, apiKey, apiSecret)
        }
        break

      case 'TRAIL_SL':
        if (action.newSlPrice) {
          console.log(`Trailing SL for ${symbol} to ${action.newSlPrice} (${action.reason})`)
          // In production: await this.oms.modifyStopLoss(symbol, action.newSlPrice, apiKey, apiSecret)
        }
        break

      case 'CLOSE_POSITION':
        console.log(`Closing position for ${symbol} (${action.reason})`)
        // In production: await this.oms.flattenPosition(symbol, undefined, apiKey, apiSecret)
        break

      case 'ADD_TP':
        if (action.newTpPrice) {
          console.log(`Adding TP for ${symbol} at ${action.newTpPrice} (${action.reason})`)
          // In production: await this.oms.addTakeProfit(symbol, action.newTpPrice, apiKey, apiSecret)
        }
        break
    }
  }

  /**
   * Get current position states from OMS
   */
  async getPositionStates(apiKey: string, apiSecret: string): Promise<PositionState[]> {
    try {
      const positions = await this.oms.getPositions(apiKey, apiSecret)

      return positions.map((pos: any) => ({
        symbol: pos.symbol,
        side: pos.positionSide === 'SHORT' ? 'SHORT' : 'LONG',
        entryPrice: parseFloat(pos.entryPrice),
        currentPrice: parseFloat(pos.markPrice || pos.entryPrice),
        size: Math.abs(parseFloat(pos.positionAmt)),
        pnl: parseFloat(pos.unrealizedProfit),
        pnlPct: 0, // Would calculate from entry vs current
        slPrice: undefined, // Would get from open orders
        tpPrice: undefined, // Would get from open orders
        trailingActivated: false,
        metadata: {}
      }))
    } catch (error) {
      console.error('Failed to get position states:', error)
      return []
    }
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
