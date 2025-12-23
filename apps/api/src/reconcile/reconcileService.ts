import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { OMSService } from '../oms/omsService'
import { RiskEngine } from '../risk/riskEngine'
import { KillSwitch } from '../kill/killSwitch'
import { BinanceRestClient } from '../exchange/binance/restClient'
import { ReconcileResult } from '../oms/types'

export class ReconcileService {
  private prisma: PrismaClient
  private oms: OMSService
  private riskEngine: RiskEngine
  private killSwitch: KillSwitch
  private binanceClient: BinanceRestClient
  private isRunning: boolean = false
  private reconcileInterval?: NodeJS.Timeout

  constructor(
    prisma: PrismaClient,
    oms: OMSService,
    riskEngine: RiskEngine,
    killSwitch: KillSwitch,
    binanceClient: BinanceRestClient
  ) {
    this.prisma = prisma
    this.oms = oms
    this.riskEngine = riskEngine
    this.killSwitch = killSwitch
    this.binanceClient = binanceClient
  }

  /**
   * Start reconcile loop
   */
  start(intervalMs: number = 2000): void {
    if (this.isRunning) {
      console.warn('Reconcile service already running')
      return
    }

    this.isRunning = true
    console.log(`🔄 Starting reconcile service (interval: ${intervalMs}ms)`)

    this.reconcileInterval = setInterval(async () => {
      try {
        await this.reconcile()
      } catch (error) {
        console.error('Reconcile error:', error)
        await this.riskEngine.recordError('RECONCILE_ERROR', { error: (error as Error).message })
      }
    }, intervalMs)
  }

  /**
   * Stop reconcile loop
   */
  stop(): void {
    if (this.reconcileInterval) {
      clearInterval(this.reconcileInterval)
      this.reconcileInterval = undefined
    }
    this.isRunning = false
    console.log('🛑 Reconcile service stopped')
  }

  /**
   * Main reconcile function
   */
  private async reconcile(): Promise<void> {
    const apiKey = env.BINANCE_API_KEY
    const apiSecret = env.BINANCE_API_SECRET

    if (!apiKey || !apiSecret) {
      console.warn('No API credentials available for reconcile')
      return
    }

    // Get tracked symbols
    const trackedSymbols = await this.prisma.trackedSymbol.findMany({
      where: { env: env.EXCHANGE_ENV, enabled: true },
    })

    if (trackedSymbols.length === 0) {
      console.warn('No tracked symbols found')
      return
    }

    // Check kill conditions first
    const shouldKill = await this.killSwitch.checkKillConditions(apiKey, apiSecret)
    if (shouldKill) {
      console.error('Kill conditions met during reconcile')
      return
    }

    // Reconcile each symbol
    const results: ReconcileResult[] = []

    for (const symbol of trackedSymbols) {
      try {
        const result = await this.reconcileSymbol(symbol.symbol, apiKey, apiSecret)
        results.push(result)
      } catch (error) {
        console.error(`Reconcile failed for ${symbol.symbol}:`, error)
        results.push({
          symbol: symbol.symbol,
          positionsUpdated: 0,
          ordersPlaced: 0,
          ordersCanceled: 0,
          errors: [(error as Error).message],
        })
      }
    }

    // Log summary
    const totalUpdated = results.reduce((sum, r) => sum + r.positionsUpdated, 0)
    const totalOrdersPlaced = results.reduce((sum, r) => sum + r.ordersPlaced, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

    if (totalUpdated > 0 || totalOrdersPlaced > 0 || totalErrors > 0) {
      console.log(`🔄 Reconcile: ${totalUpdated} positions, ${totalOrdersPlaced} orders, ${totalErrors} errors`)
    }
  }

  /**
   * Reconcile a specific symbol
   */
  private async reconcileSymbol(symbol: string, apiKey: string, apiSecret: string): Promise<ReconcileResult> {
    let positionsUpdated = 0
    let ordersPlaced = 0
    let ordersCanceled = 0
    const errors: string[] = []

    try {
      // 1. Get exchange positions
      const exchangePositions = await this.binanceClient.getPositionRisk(apiKey, apiSecret)
      const symbolPositions = exchangePositions.filter((p: any) => p.symbol === symbol)

      // 2. Get exchange orders
      const exchangeOrders = await this.binanceClient.getOpenOrders(symbol, apiKey, apiSecret)

      // 3. Process positions
      for (const exchangePos of symbolPositions) {
        try {
          const updated = await this.reconcilePosition(symbol, exchangePos, exchangeOrders, apiKey, apiSecret)
          if (updated) positionsUpdated++
        } catch (error) {
          errors.push(`Position reconcile error: ${(error as Error).message}`)
        }
      }

      // 4. Clean up zombie orders (orders in DB but not on exchange)
      const dbOrders = await this.prisma.orderRecord.findMany({
        where: {
          symbol,
          status: { in: ['PLACED', 'PENDING'] },
        },
      })

      for (const dbOrder of dbOrders) {
        const exchangeOrder = exchangeOrders.find(eo => eo.clientOrderId === dbOrder.clientOrderId)
        if (!exchangeOrder) {
          // Order exists in DB but not on exchange - mark as canceled
          await this.prisma.orderRecord.update({
            where: { id: dbOrder.id },
            data: { status: 'CANCELED' },
          })
          ordersCanceled++
        }
      }

      // 5. Check for kill conditions
      const killTrigger = await this.riskEngine.shouldFlatten()
      if (killTrigger.active) {
        await this.killSwitch.emergencyKill(killTrigger.reason, apiKey, apiSecret)
      }

    } catch (error) {
      errors.push(`Symbol reconcile error: ${(error as Error).message}`)
    }

    // Log reconcile event
    await this.prisma.reconcileEvent.create({
      data: {
        env: env.EXCHANGE_ENV,
        symbol,
        action: 'RECONCILE_COMPLETED',
        details: {
          positionsUpdated,
          ordersPlaced,
          ordersCanceled,
          errors,
        },
      },
    })

    return {
      symbol,
      positionsUpdated,
      ordersPlaced,
      ordersCanceled,
      errors,
    }
  }

  /**
   * Reconcile a single position
   */
  private async reconcilePosition(
    symbol: string,
    exchangePos: any,
    exchangeOrders: any[],
    apiKey: string,
    apiSecret: string
  ): Promise<boolean> {
    const positionAmt = parseFloat(exchangePos.positionAmt)
    const positionSide = env.POSITION_MODE === 'hedge' ? exchangePos.positionSide : undefined

    // Skip if no position
    if (positionAmt === 0) {
      // Ensure no position record exists
      await this.prisma.positionRecord.updateMany({
        where: {
          env: env.EXCHANGE_ENV,
          symbol,
          positionSide,
          status: 'OPEN',
        },
        data: { status: 'CLOSED' },
      })
      return false
    }

    // Check if position exists in DB
    let dbPosition = await this.prisma.positionRecord.findFirst({
      where: {
        env: env.EXCHANGE_ENV,
        symbol,
        positionSide,
        status: 'OPEN',
      },
    })

    if (!dbPosition) {
      // Create position record
      dbPosition = await this.prisma.positionRecord.create({
        data: {
          env: env.EXCHANGE_ENV,
          symbol,
          side: positionAmt > 0 ? 'LONG' : 'SHORT',
          quantity: Math.abs(positionAmt).toString(),
          entryPrice: exchangePos.entryPrice,
          unrealizedPnl: exchangePos.unRealizedProfit,
          positionSide,
        },
      })
      console.log(`📊 Created position record for ${symbol}`)
    } else {
      // Update existing position
      await this.prisma.positionRecord.update({
        where: { id: dbPosition.id },
        data: {
          quantity: Math.abs(positionAmt).toString(),
          unrealizedPnl: exchangePos.unRealizedProfit,
        },
      })
    }

    // Check for protective SL
    const hasSL = this.hasProtectiveSL(symbol, dbPosition, exchangeOrders)

    if (!hasSL) {
      // Place emergency SL
      await this.placeEmergencySL(symbol, exchangePos, dbPosition, apiKey, apiSecret)
      return true
    }

    return false
  }

  /**
   * Check if position has protective SL
   */
  private hasProtectiveSL(symbol: string, dbPosition: any, exchangeOrders: any[]): boolean {
    const expectedClientOrderId = `TRD|${env.EXCHANGE_ENV}|${symbol}|${dbPosition.planId || 'EMERGENCY'}|SL|1`

    const slOrder = exchangeOrders.find(order =>
      order.clientOrderId === expectedClientOrderId ||
      (order.clientOrderId.startsWith(`TRD|${env.EXCHANGE_ENV}|${symbol}|`) &&
       order.clientOrderId.includes('|SL|') &&
       order.reduceOnly === true)
    )

    return !!slOrder
  }

  /**
   * Place emergency SL for unprotected position
   */
  private async placeEmergencySL(
    symbol: string,
    exchangePos: any,
    dbPosition: any,
    apiKey: string,
    apiSecret: string
  ): Promise<void> {
    const positionAmt = parseFloat(exchangePos.positionAmt)
    const markPrice = parseFloat(exchangePos.markPrice)

    // Calculate emergency SL price (80 bps from mark)
    const bpsOffset = env.EMERGENCY_SL_BPS / 10000 // Convert bps to decimal
    const slPrice = positionAmt > 0
      ? markPrice * (1 - bpsOffset)  // Long: SL below mark
      : markPrice * (1 + bpsOffset)  // Short: SL above mark

    let planId = `EMERGENCY-${new Date().toISOString().slice(0, 10)}-${symbol}`
    if (env.POSITION_MODE === 'hedge') {
      planId += `-${exchangePos.positionSide}`
    }

    // Get next sequence number
    const existingSLs = await this.prisma.orderRecord.count({
      where: {
        env: env.EXCHANGE_ENV,
        symbol,
        planId,
        leg: 'EMERGENCY_SL',
      },
    })

    const seq = existingSLs + 1

    try {
      await this.binanceClient.placeOrder(
        symbol,
        positionAmt > 0 ? 'SELL' : 'BUY', // Opposite side for exit
        'STOP_MARKET',
        Math.abs(positionAmt).toString(),
        undefined, // price
        slPrice.toFixed(2), // stopPrice
        true, // reduceOnly
        undefined, // timeInForce
        exchangePos.positionSide, // positionSide
        apiKey,
        apiSecret
      )

      // Record the emergency SL
      await this.prisma.orderRecord.create({
        data: {
          env: env.EXCHANGE_ENV,
          clientOrderId: `TRD|${env.EXCHANGE_ENV}|${symbol}|${planId}|EMERGENCY_SL|${seq}`,
          symbol,
          planId,
          leg: 'EMERGENCY_SL',
          seq,
          side: positionAmt > 0 ? 'SELL' : 'BUY',
          type: 'STOP_MARKET',
          quantity: Math.abs(positionAmt).toString(),
          stopPrice: slPrice.toFixed(2),
          reduceOnly: true,
          positionSide: exchangePos.positionSide,
          status: 'PLACED',
        },
      })

      console.log(`🛡️ Placed emergency SL for ${symbol} at ${slPrice.toFixed(2)}`)

    } catch (error) {
      console.error(`Failed to place emergency SL for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Initialize tracked symbols on startup
   */
  async initializeTrackedSymbols(): Promise<void> {
    const symbols = env.TRACK_SYMBOLS.split(',').map(s => s.trim())

    for (const symbol of symbols) {
      await this.prisma.trackedSymbol.upsert({
        where: {
          env_symbol: {
            env: env.EXCHANGE_ENV,
            symbol,
          },
        },
        update: { enabled: true },
        create: {
          env: env.EXCHANGE_ENV,
          symbol,
          enabled: true,
        },
      })
    }

    console.log(`📋 Initialized ${symbols.length} tracked symbols`)
  }

  /**
   * Get reconcile status
   */
  getStatus(): { isRunning: boolean; lastReconcile?: Date } {
    return {
      isRunning: this.isRunning,
      // Could track last reconcile time if needed
    }
  }
}
