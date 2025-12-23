import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { OMSService } from '../oms/omsService'
import { BinanceRestClient } from '../exchange/binance/restClient'

export class KillSwitch {
  private prisma: PrismaClient
  private oms: OMSService
  private binanceClient: BinanceRestClient

  constructor(prisma: PrismaClient, oms: OMSService, binanceClient: BinanceRestClient) {
    this.prisma = prisma
    this.oms = oms
    this.binanceClient = binanceClient
  }

  /**
   * Emergency kill - cancel all orders and flatten all positions
   */
  async emergencyKill(reason: string, apiKey: string, apiSecret: string): Promise<void> {
    console.error(`🚨 EMERGENCY KILL ACTIVATED: ${reason}`)

    try {
      // 1. Cancel all open orders for all tracked symbols
      const trackedSymbols = await this.prisma.trackedSymbol.findMany({
        where: { env: env.EXCHANGE_ENV, enabled: true },
      })

      for (const symbol of trackedSymbols) {
        try {
          await this.oms.cancelAllOrders(symbol.symbol, apiKey, apiSecret)
          console.log(`✅ Canceled all orders for ${symbol.symbol}`)
        } catch (error) {
          console.error(`❌ Failed to cancel orders for ${symbol.symbol}:`, error)
        }
      }

      // 2. Flatten all positions
      const positions = await this.binanceClient.getPositionRisk(apiKey, apiSecret)

      for (const position of positions) {
        if (parseFloat(position.positionAmt) !== 0) {
          try {
            const positionSide = env.POSITION_MODE === 'hedge' ? position.positionSide : undefined
            await this.oms.flattenPosition(position.symbol, positionSide, apiKey, apiSecret)
            console.log(`✅ Flattened position for ${position.symbol}`)
          } catch (error) {
            console.error(`❌ Failed to flatten position for ${position.symbol}:`, error)
          }
        }
      }

      // 3. Update risk state
      await this.prisma.riskState.update({
        where: { env: env.EXCHANGE_ENV },
        data: {
          killActive: true,
          killReason: reason,
          tradingEnabled: false,
        },
      })

      // 4. Log the kill event
      await this.prisma.killEvent.create({
        data: {
          env: env.EXCHANGE_ENV,
          reason: 'EMERGENCY_KILL',
          details: {
            reason,
            ordersCanceled: true,
            positionsFlattened: true,
            timestamp: new Date().toISOString(),
          },
        },
      })

      console.error(`✅ EMERGENCY KILL COMPLETED: All orders canceled, all positions flattened`)

    } catch (error) {
      console.error(`❌ EMERGENCY KILL FAILED:`, error)
      throw error
    }
  }

  /**
   * Check and trigger kill conditions
   */
  async checkKillConditions(apiKey?: string, apiSecret?: string): Promise<boolean> {
    // Check error storm
    const recentErrors = await this.prisma.killEvent.count({
      where: {
        env: env.EXCHANGE_ENV,
        ts: {
          gte: new Date(Date.now() - 30000), // Last 30 seconds
        },
      },
    })

    if (recentErrors >= env.ERROR_STORM_FAIL) {
      console.error(`🚨 ERROR STORM DETECTED: ${recentErrors} errors in 30s`)
      if (apiKey && apiSecret) {
        await this.emergencyKill('ERROR_STORM', apiKey, apiSecret)
      }
      return true
    }

    // Check daily loss limit
    if (env.ENABLE_INCOME_TRACKING) {
      const riskState = await this.prisma.riskState.findFirst({
        where: { env: env.EXCHANGE_ENV },
      })

      if (riskState && riskState.dailyLossUsed >= riskState.dailyLossLimitPct) {
        console.error(`🚨 DAILY LOSS LIMIT EXCEEDED: ${riskState.dailyLossUsed}%`)
        if (apiKey && apiSecret) {
          await this.emergencyKill('DAILY_LOSS_LIMIT', apiKey, apiSecret)
        }
        return true
      }
    }

    return false
  }

  /**
   * Reset kill switch (admin action)
   */
  async resetKillSwitch(): Promise<void> {
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

    console.log('✅ Kill switch reset by admin')
  }

  /**
   * Get kill status
   */
  async getKillStatus(): Promise<any> {
    const riskState = await this.prisma.riskState.findFirst({
      where: { env: env.EXCHANGE_ENV },
    })

    const recentEvents = await this.prisma.killEvent.findMany({
      where: {
        env: env.EXCHANGE_ENV,
        ts: {
          gte: new Date(Date.now() - 3600000), // Last hour
        },
      },
      orderBy: { ts: 'desc' },
      take: 10,
    })

    return {
      killActive: riskState?.killActive || false,
      killReason: riskState?.killReason || null,
      circuitOpenUntil: riskState?.circuitOpenUntilTs || null,
      circuitOpen: riskState?.circuitOpenUntilTs ? riskState.circuitOpenUntilTs > new Date() : false,
      recentEvents,
    }
  }

  /**
   * Circuit breaker activation
   */
  async activateCircuitBreaker(): Promise<void> {
    const openUntil = new Date(Date.now() + env.BINANCE_CB_OPEN_SEC * 1000)

    await this.prisma.riskState.update({
      where: { env: env.EXCHANGE_ENV },
      data: {
        circuitOpenUntilTs: openUntil,
      },
    })

    await this.prisma.killEvent.create({
      data: {
        env: env.EXCHANGE_ENV,
        reason: 'CIRCUIT_BREAKER',
        details: {
          openForSeconds: env.BINANCE_CB_OPEN_SEC,
          openUntil: openUntil.toISOString(),
        },
      },
    })

    console.log(`🔌 Circuit breaker activated for ${env.BINANCE_CB_OPEN_SEC}s`)
  }

  /**
   * Check if circuit breaker is open
   */
  async isCircuitBreakerOpen(): Promise<boolean> {
    const riskState = await this.prisma.riskState.findFirst({
      where: { env: env.EXCHANGE_ENV },
    })

    return !!(riskState?.circuitOpenUntilTs && riskState.circuitOpenUntilTs > new Date())
  }

  /**
   * Handle rate limit errors
   */
  async onRateLimit(apiKey: string, apiSecret: string): Promise<void> {
    console.warn('⚠️ Rate limit hit, activating circuit breaker')
    await this.activateCircuitBreaker()

    // If persistent rate limits, trigger emergency kill
    const recentRateLimits = await this.prisma.killEvent.count({
      where: {
        env: env.EXCHANGE_ENV,
        reason: 'RATE_LIMIT',
        ts: {
          gte: new Date(Date.now() - 300000), // Last 5 minutes
        },
      },
    })

    if (recentRateLimits >= 5) {
      console.error('🚨 PERSISTENT RATE LIMITS, TRIGGERING EMERGENCY KILL')
      await this.emergencyKill('PERSISTENT_RATE_LIMITS', apiKey, apiSecret)
    }
  }

  /**
   * Handle API ban (418 error)
   */
  async onApiBan(apiKey: string, apiSecret: string): Promise<void> {
    console.error('🚨 API BAN DETECTED (418), IMMEDIATE EMERGENCY KILL')
    await this.emergencyKill('API_BAN_418', apiKey, apiSecret)
  }
}
