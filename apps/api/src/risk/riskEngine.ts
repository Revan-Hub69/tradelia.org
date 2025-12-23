import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { RiskCheck, KillTrigger } from '../oms/types'

export class RiskEngine {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Initialize risk state on startup
   */
  async initialize(): Promise<void> {
    const existing = await this.prisma.riskState.findFirst()
    if (!existing) {
      await this.prisma.riskState.create({
        data: {
          env: env.EXCHANGE_ENV,
          tradingEnabled: env.TRADING_ENABLED,
          killActive: false,
          dailyLossUsed: 0,
          dailyLossLimitPct: env.DAILY_MAX_LOSS_PCT,
          maxPositions: env.MAX_CONCURRENT_POSITIONS,
        },
      })
    }
  }

  /**
   * Get current risk state
   */
  async getRiskState(): Promise<any> {
    return this.prisma.riskState.findFirst({
      where: { env: env.EXCHANGE_ENV },
    })
  }

  /**
   * Update risk configuration
   */
  async updateConfig(updates: {
    tradingEnabled?: boolean
    maxPositions?: number
    dailyLossLimitPct?: number
  }): Promise<void> {
    await this.prisma.riskState.update({
      where: { env: env.EXCHANGE_ENV },
      data: updates,
    })
  }

  /**
   * Check if we can enter a new position
   */
  async canEnter(symbol: string, quantity: string, entryPrice: string): Promise<RiskCheck> {
    const riskState = await this.getRiskState()
    if (!riskState) {
      return { canEnter: false, reason: 'Risk state not initialized', availableSlots: 0, cooldownRemainingSec: 0 }
    }

    // Check if trading is enabled
    if (!riskState.tradingEnabled) {
      return { canEnter: false, reason: 'Trading disabled', availableSlots: 0, cooldownRemainingSec: 0 }
    }

    // Check kill switch
    if (riskState.killActive) {
      return { canEnter: false, reason: 'Kill switch active', availableSlots: 0, cooldownRemainingSec: 0 }
    }

    // Check circuit breaker
    if (riskState.circuitOpenUntilTs && riskState.circuitOpenUntilTs > new Date()) {
      const remainingSec = Math.ceil((riskState.circuitOpenUntilTs.getTime() - Date.now()) / 1000)
      return { canEnter: false, reason: 'Circuit breaker open', availableSlots: 0, cooldownRemainingSec: remainingSec }
    }

    // Check cooldown
    if (riskState.cooldownUntilTs && riskState.cooldownUntilTs > new Date()) {
      const remainingSec = Math.ceil((riskState.cooldownUntilTs.getTime() - Date.now()) / 1000)
      return { canEnter: false, reason: 'Cooldown active', availableSlots: 0, cooldownRemainingSec: remainingSec }
    }

    // Count current positions
    const positionCount = await this.prisma.positionRecord.count({
      where: {
        env: env.EXCHANGE_ENV,
        status: 'OPEN',
      },
    })

    const availableSlots = Math.max(0, riskState.maxPositions - positionCount)
    if (availableSlots <= 0) {
      return { canEnter: false, reason: 'Max positions reached', availableSlots: 0, cooldownRemainingSec: 0 }
    }

    // Check daily loss limit (if enabled)
    if (env.ENABLE_INCOME_TRACKING && riskState.dailyLossUsed >= riskState.dailyLossLimitPct) {
      return { canEnter: false, reason: 'Daily loss limit reached', availableSlots, cooldownRemainingSec: 0 }
    }

    return { canEnter: true, reason: 'OK', availableSlots, cooldownRemainingSec: 0 }
  }

  /**
   * Update risk state after position fill
   */
  async onPositionOpened(symbol: string, quantity: string, entryPrice: string, side: 'LONG' | 'SHORT'): Promise<void> {
    // Update position count is handled by reconcile
    // Could add position size tracking here if needed
    console.log(`Risk: Position opened - ${symbol} ${side} ${quantity}@${entryPrice}`)
  }

  /**
   * Update risk state after position close
   */
  async onPositionClosed(symbol: string, realizedPnl: string): Promise<void> {
    const pnl = parseFloat(realizedPnl)

    if (env.ENABLE_INCOME_TRACKING && pnl < 0) {
      // Update daily loss tracking
      await this.prisma.riskState.update({
        where: { env: env.EXCHANGE_ENV },
        data: {
          dailyLossUsed: {
            increment: Math.abs(pnl),
          },
        },
      })

      // Check if we hit loss limits
      const riskState = await this.getRiskState()
      if (riskState && riskState.dailyLossUsed >= riskState.dailyLossLimitPct) {
        await this.activateKill('DAILY_LOSS_LIMIT', `Daily loss limit reached: ${riskState.dailyLossUsed}`)
      }
    }

    console.log(`Risk: Position closed - ${symbol} PnL: ${realizedPnl}`)
  }

  /**
   * Record error for storm detection
   */
  async recordError(errorType: string, details?: any): Promise<void> {
    // Get recent errors for storm detection
    const recentErrors = await this.prisma.killEvent.count({
      where: {
        env: env.EXCHANGE_ENV,
        reason: errorType,
        ts: {
          gte: new Date(Date.now() - 30000), // Last 30 seconds
        },
      },
    })

    if (recentErrors >= env.ERROR_STORM_FAIL) {
      await this.activateKill('ERROR_STORM', `Error storm detected: ${recentErrors} ${errorType} errors in 30s`)
    }

    // Record the error
    await this.prisma.killEvent.create({
      data: {
        env: env.EXCHANGE_ENV,
        reason: errorType,
        details: details || {},
      },
    })
  }

  /**
   * Handle rate limiting
   */
  async onRateLimit(): Promise<void> {
    await this.recordError('RATE_LIMIT', { httpCode: 429 })
  }

  /**
   * Handle network/API errors
   */
  async onApiError(error: any): Promise<void> {
    const errorType = error.code === 418 ? 'IP_BANNED' : 'API_ERROR'
    await this.recordError(errorType, { error: error.message, code: error.code })
  }

  /**
   * Check if system should flatten everything
   */
  async shouldFlatten(): Promise<KillTrigger> {
    const riskState = await this.getRiskState()
    if (!riskState) {
      return { active: false, reason: '', triggeredAt: new Date(), actionsTaken: [] }
    }

    if (riskState.killActive) {
      return {
        active: true,
        reason: riskState.killReason || 'Kill switch active',
        triggeredAt: riskState.updatedAt,
        actionsTaken: ['Kill switch activated'],
      }
    }

    // Check circuit breaker
    if (riskState.circuitOpenUntilTs && riskState.circuitOpenUntilTs > new Date()) {
      return {
        active: true,
        reason: 'Circuit breaker open',
        triggeredAt: riskState.updatedAt,
        actionsTaken: ['Circuit breaker open'],
      }
    }

    return { active: false, reason: '', triggeredAt: new Date(), actionsTaken: [] }
  }

  /**
   * Activate kill switch
   */
  private async activateKill(reason: string, details: string): Promise<void> {
    await this.prisma.riskState.update({
      where: { env: env.EXCHANGE_ENV },
      data: {
        killActive: true,
        killReason: reason,
        tradingEnabled: false,
      },
    })

    await this.prisma.killEvent.create({
      data: {
        env: env.EXCHANGE_ENV,
        reason: 'KILL_ACTIVATED',
        details: { reason, details },
      },
    })

    console.error(`🚨 KILL SWITCH ACTIVATED: ${reason} - ${details}`)
  }

  /**
   * Reset kill switch (manual)
   */
  async resetKill(): Promise<void> {
    await this.prisma.riskState.update({
      where: { env: env.EXCHANGE_ENV },
      data: {
        killActive: false,
        killReason: null,
        circuitOpenUntilTs: null,
      },
    })

    await this.prisma.killEvent.create({
      data: {
        env: env.EXCHANGE_ENV,
        reason: 'KILL_RESET',
        details: { manual: true },
      },
    })

    console.log('✅ Kill switch reset')
  }

  /**
   * Activate circuit breaker
   */
  async activateCircuitBreaker(): Promise<void> {
    const openUntil = new Date(Date.now() + env.BINANCE_CB_OPEN_SEC * 1000)

    await this.prisma.riskState.update({
      where: { env: env.EXCHANGE_ENV },
      data: {
        circuitOpenUntilTs: openUntil,
      },
    })

    console.log(`🔌 Circuit breaker activated for ${env.BINANCE_CB_OPEN_SEC}s`)
  }
}
