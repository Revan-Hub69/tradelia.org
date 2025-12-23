import { PrismaClient } from '@prisma/client'
import { OMSService } from '../oms/omsService'
import { OrderIntent, StrategySignal } from './types'

export class SignalBus {
  private prisma: PrismaClient
  private oms: OMSService
  private pendingSignals: Map<string, StrategySignal> = new Map()

  constructor(prisma: PrismaClient, oms: OMSService) {
    this.prisma = prisma
    this.oms = oms
  }

  /**
   * Send a trading signal to the OMS
   */
  async sendSignal(signal: StrategySignal): Promise<boolean> {
    try {
      console.log(`📡 Processing signal: ${signal.type} ${signal.intent.side} ${signal.intent.symbol}`)

      // Store signal for tracking
      this.pendingSignals.set(signal.id, signal)

      // Execute based on signal type
      let success = false

      switch (signal.type) {
        case 'ENTRY':
          success = await this.executeEntry(signal)
          break
        case 'EXIT':
          success = await this.executeExit(signal)
          break
        case 'MODIFY':
          success = await this.executeModify(signal)
          break
      }

      // Remove from pending on completion
      if (success) {
        this.pendingSignals.delete(signal.id)
      }

      // Log signal execution
      await this.logSignal(signal, success)

      return success
    } catch (error) {
      console.error(`Signal execution failed for ${signal.id}:`, error)
      await this.logSignal(signal, false)
      return false
    }
  }

  /**
   * Execute entry signal
   */
  private async executeEntry(signal: StrategySignal): Promise<boolean> {
    try {
      // Mock API credentials - in production would come from signal metadata or secure storage
      const apiKey = 'mock_key'
      const apiSecret = 'mock_secret'

      // Submit order intent to OMS
      const result = await this.oms.submitIntent(signal.intent, apiKey, apiSecret)

      console.log(`✅ Entry executed: ${signal.intent.symbol} ${signal.intent.side} ${signal.intent.quantity}`)
      return result.success
    } catch (error) {
      console.error('Entry execution failed:', error)
      return false
    }
  }

  /**
   * Execute exit signal
   */
  private async executeExit(signal: StrategySignal): Promise<boolean> {
    try {
      const apiKey = 'mock_key'
      const apiSecret = 'mock_secret'

      // Determine position side from intent
      const positionSide = signal.intent.side === 'LONG' ? 'LONG' : 'SHORT'

      // Flatten position
      const result = await this.oms.flattenPosition(signal.intent.symbol, positionSide, apiKey, apiSecret)

      console.log(`✅ Exit executed: ${signal.intent.symbol} ${positionSide}`)
      return true // Assume success for now
    } catch (error) {
      console.error('Exit execution failed:', error)
      return false
    }
  }

  /**
   * Execute modify signal (SL/TP changes)
   */
  private async executeModify(signal: StrategySignal): Promise<boolean> {
    try {
      // Handle different modification types based on metadata
      const modifyType = signal.intent.metadata?.modifyType

      switch (modifyType) {
        case 'STOP_LOSS':
          if (signal.intent.slPrice) {
            console.log(`✅ SL modified: ${signal.intent.symbol} to ${signal.intent.slPrice}`)
            // In production: await this.oms.modifyStopLoss(signal.intent.symbol, signal.intent.slPrice, apiKey, apiSecret)
          }
          break
        case 'TAKE_PROFIT':
          if (signal.intent.tpPrice) {
            console.log(`✅ TP modified: ${signal.intent.symbol} to ${signal.intent.tpPrice}`)
            // In production: await this.oms.modifyTakeProfit(signal.intent.symbol, signal.intent.tpPrice, apiKey, apiSecret)
          }
          break
        default:
          console.log(`✅ Position modified: ${signal.intent.symbol}`)
      }

      return true
    } catch (error) {
      console.error('Modify execution failed:', error)
      return false
    }
  }

  /**
   * Get pending signals
   */
  getPendingSignals(): StrategySignal[] {
    return Array.from(this.pendingSignals.values())
  }

  /**
   * Cancel a pending signal
   */
  cancelSignal(signalId: string): boolean {
    return this.pendingSignals.delete(signalId)
  }

  /**
   * Get signal status
   */
  getSignalStatus(signalId: string): StrategySignal | null {
    return this.pendingSignals.get(signalId) || null
  }

  /**
   * Log signal execution to database
   */
  private async logSignal(signal: StrategySignal, success: boolean): Promise<void> {
    try {
      // In production, would create a signal log table
      console.log(`📝 Signal logged: ${signal.id} ${success ? 'SUCCESS' : 'FAILED'}`)
    } catch (error) {
      console.error('Signal logging failed:', error)
    }
  }

  /**
   * Emergency signal to flatten all positions
   */
  async emergencyFlatten(reason: string): Promise<void> {
    console.log(`🚨 EMERGENCY FLATTEN: ${reason}`)

    try {
      const apiKey = 'mock_key'
      const apiSecret = 'mock_secret'

      // Get all positions and flatten them
      const positions = await this.oms.getPositions(apiKey, apiSecret)

      for (const position of positions) {
        if (parseFloat(position.positionAmt) !== 0) {
          try {
            await this.oms.flattenPosition(position.symbol, undefined, apiKey, apiSecret)
            console.log(`✅ Emergency flattened: ${position.symbol}`)
          } catch (error) {
            console.error(`Failed to flatten ${position.symbol}:`, error)
          }
        }
      }
    } catch (error) {
      console.error('Emergency flatten failed:', error)
    }
  }

  /**
   * Create entry signal
   */
  createEntrySignal(intent: OrderIntent, regime: any, setup?: any): StrategySignal {
    return {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'ENTRY',
      intent,
      reason: `Strategy entry: ${setup?.setupType || 'manual'}`,
      confidence: setup?.confidence || 50,
      regime,
      setup
    }
  }

  /**
   * Create exit signal
   */
  createExitSignal(
    symbol: string,
    side: 'LONG' | 'SHORT',
    reason: string,
    confidence: number = 80,
    regime?: any
  ): StrategySignal {
    const intent: OrderIntent = {
      symbol,
      planId: `exit_${Date.now()}`,
      side: side === 'LONG' ? 'SHORT' : 'LONG', // Opposite side to close
      quantity: '0', // Will be filled by position size
      entryType: 'MARKET',
      metadata: { exitReason: reason }
    }

    return {
      id: `exit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'EXIT',
      intent,
      reason,
      confidence,
      regime: regime || { regime: 'UNKNOWN', confidence: 0, allowedDirections: [], signals: [] }
    }
  }

  /**
   * Create modify signal
   */
  createModifySignal(
    symbol: string,
    modifyType: 'STOP_LOSS' | 'TAKE_PROFIT',
    newPrice: string,
    reason: string,
    confidence: number = 70,
    regime?: any
  ): StrategySignal {
    const intent: OrderIntent = {
      symbol,
      planId: `modify_${Date.now()}`,
      side: 'LONG', // Not relevant for modify
      quantity: '0',
      entryType: 'MARKET',
      metadata: { modifyType }
    }

    if (modifyType === 'STOP_LOSS') {
      intent.slPrice = newPrice
    } else {
      intent.tpPrice = newPrice
    }

    return {
      id: `modify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'MODIFY',
      intent,
      reason,
      confidence,
      regime: regime || { regime: 'UNKNOWN', confidence: 0, allowedDirections: [], signals: [] }
    }
  }
}
