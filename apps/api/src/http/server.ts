import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { OMSService } from '../oms/omsService'
import { RiskEngine } from '../risk/riskEngine'
import { KillSwitch } from '../kill/killSwitch'
import { ReconcileService } from '../reconcile/reconcileService'
import { BinanceRestClient } from '../exchange/binance/restClient'
import { BinanceFuturesClient } from '../exchange/binance/binanceFutures'
import { OrderIntentSchema, FlattenRequestSchema } from '../oms/types'

export class EngineServer {
  private prisma: PrismaClient | null
  private oms: OMSService
  private riskEngine: RiskEngine | null
  private killSwitch: KillSwitch | null
  private reconcileService: ReconcileService | null
  private binanceClient: BinanceFuturesClient

  constructor(prisma: PrismaClient | null) {
    this.prisma = prisma

    // Initialize services
    const binanceRestClient = new BinanceRestClient(env.EXCHANGE_ENV)
    this.binanceClient = new BinanceFuturesClient(env.EXCHANGE_ENV)

    if (prisma) {
      this.oms = new OMSService(prisma, binanceRestClient)
      this.riskEngine = new RiskEngine(prisma)
      this.killSwitch = new KillSwitch(prisma, this.oms, binanceRestClient)
      this.reconcileService = new ReconcileService(
        prisma,
        this.oms,
        this.riskEngine,
        this.killSwitch,
        binanceRestClient
      )
    } else {
      // Database-less mode - create stub implementations
      this.oms = null as any
      this.riskEngine = null
      this.killSwitch = null
      this.reconcileService = null
    }
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.prisma) {
      await this.riskEngine!.initialize()
      await this.reconcileService!.initializeTrackedSymbols()
      console.log('✅ Engine services initialized')
    } else {
      console.log('✅ Engine services initialized (database-less mode)')
    }
  }

  /**
   * Register all routes
   */
  registerRoutes(app: FastifyInstance): void {
    // Engine control
    app.post('/engine/start', this.startEngine.bind(this))
    app.post('/engine/stop', this.stopEngine.bind(this))
    app.post('/engine/reset-kill', this.resetKill.bind(this))
    app.get('/engine/state', this.getEngineState.bind(this))

    // Risk management
    app.post('/risk/config', this.updateRiskConfig.bind(this))
    app.get('/risk/state', this.getRiskState.bind(this))

    // OMS operations
    app.post('/oms/submit-intent', this.submitOrderIntent.bind(this))
    app.get('/oms/dummy-signal', this.generateDummySignal.bind(this))
    app.post('/oms/flatten', this.flattenAll.bind(this))
    app.post('/oms/flatten/:symbol', this.flattenSymbol.bind(this))
    app.get('/oms/orders', this.getOrders.bind(this))
    app.get('/oms/positions', this.getPositions.bind(this))

    // Only register database-dependent routes if we have a database
    if (this.prisma) {
      // Additional routes that require database
    }
  }

  /**
   * Start engine and reconcile loop
   */
  private async startEngine(request: any, reply: any): Promise<any> {
    try {
      if (!this.reconcileService) {
        reply.code(400).send({
          success: false,
          error: 'Engine not available in database-less mode',
        })
        return
      }

      // Start reconcile service
      this.reconcileService.start()

      reply.send({
        success: true,
        message: 'Engine started',
        reconcileInterval: 2000,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Stop engine
   */
  private async stopEngine(request: any, reply: any): Promise<any> {
    try {
      if (!this.reconcileService) {
        reply.code(400).send({
          success: false,
          error: 'Engine not available in database-less mode',
        })
        return
      }

      this.reconcileService.stop()

      reply.send({
        success: true,
        message: 'Engine stopped',
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Reset kill switch
   */
  private async resetKill(request: any, reply: any): Promise<any> {
    try {
      if (!this.killSwitch) {
        reply.code(400).send({
          success: false,
          error: 'Kill switch not available in database-less mode',
        })
        return
      }

      await this.killSwitch.resetKillSwitch()

      reply.send({
        success: true,
        message: 'Kill switch reset',
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get engine state
   */
  private async getEngineState(request: any, reply: any): Promise<any> {
    try {
      if (!this.riskEngine || !this.reconcileService || !this.killSwitch) {
        reply.send({
          success: true,
          engine: { isRunning: false, lastReconcile: null },
          risk: { tradingEnabled: false },
          kill: { killActive: false },
          note: 'Database-less mode - limited functionality'
        })
        return
      }

      const riskState = await this.riskEngine.getRiskState()
      const reconcileStatus = this.reconcileService.getStatus()
      const killStatus = await this.killSwitch.getKillStatus()

      reply.send({
        success: true,
        engine: {
          isRunning: reconcileStatus.isRunning,
          lastReconcile: reconcileStatus.lastReconcile,
        },
        risk: riskState,
        kill: killStatus,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Update risk configuration
   */
  private async updateRiskConfig(request: any, reply: any): Promise<any> {
    try {
      if (!this.riskEngine) {
        reply.code(400).send({
          success: false,
          error: 'Risk engine not available in database-less mode',
        })
        return
      }

      const updates = request.body
      await this.riskEngine.updateConfig(updates)

      reply.send({
        success: true,
        message: 'Risk config updated',
        updates,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get risk state
   */
  private async getRiskState(request: any, reply: any): Promise<any> {
    try {
      if (!this.riskEngine) {
        reply.send({
          success: true,
          risk: { tradingEnabled: false },
          note: 'Risk engine not available in database-less mode'
        })
        return
      }

      const riskState = await this.riskEngine.getRiskState()

      reply.send({
        success: true,
        risk: riskState,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Submit order intent
   */
  private async submitOrderIntent(request: any, reply: any): Promise<any> {
    try {
      // Validate request
      const intent = OrderIntentSchema.parse(request.body)

      // Get user API credentials (from request headers or auth)
      const apiKey = request.headers['x-binance-api-key'] as string
      const apiSecret = request.headers['x-binance-api-secret'] as string

      if (!apiKey || !apiSecret) {
        reply.code(400).send({
          success: false,
          error: 'Missing API credentials in headers (x-binance-api-key, x-binance-api-secret)',
        })
        return
      }

      if (!this.riskEngine || !this.oms) {
        reply.code(400).send({
          success: false,
          error: 'OMS not available in database-less mode',
        })
        return
      }

      // Check risk before submitting
      const riskCheck = await this.riskEngine.canEnter(
        intent.symbol,
        intent.quantity,
        intent.entryType === 'LIMIT' ? intent.entryPrice! : '0'
      )

      if (!riskCheck.canEnter) {
        reply.code(400).send({
          success: false,
          error: `Risk check failed: ${riskCheck.reason}`,
        })
        return
      }

      // Submit order
      const result = await this.oms.submitIntent(intent, apiKey, apiSecret)

      reply.send({
        success: true,
        result,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Generate dummy order intent for testing
   */
  private async generateDummySignal(request: any, reply: any): Promise<any> {
    try {
      const { symbol = 'BTCUSDT', side = 'LONG' } = request.query as { symbol?: string; side?: string }

      // Get current market price for SL/TP calculation
      const bookTicker = await this.binanceClient.getBookTicker(symbol)
      const currentPrice = parseFloat(bookTicker.bidPrice)

      // Generate dummy signal with realistic SL/TP
      const isLong = side === 'LONG'
      const entryPrice = currentPrice
      const slBps = 80 // 80 bps stop loss
      const tpBps = 200 // 200 bps take profit

      const slPrice = isLong
        ? entryPrice * (1 - slBps / 10000)
        : entryPrice * (1 + slBps / 10000)

      const tpPrice = isLong
        ? entryPrice * (1 + tpBps / 10000)
        : entryPrice * (1 - tpBps / 10000)

      const dummyIntent = {
        symbol,
        planId: `DUMMY_${Date.now()}`,
        side: isLong ? 'LONG' : 'SHORT',
        quantity: '0.001', // Small test quantity
        slPrice: slPrice.toFixed(2),
        tpPrice: tpPrice.toFixed(2),
        entryType: 'MARKET' as const,
      }

      reply.send({
        success: true,
        signal: dummyIntent,
        note: 'This is a dummy signal for testing. Use /oms/submit-intent to execute it.',
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Flatten all positions
   */
  private async flattenAll(request: any, reply: any): Promise<any> {
    try {
      const apiKey = request.headers['x-binance-api-key'] as string
      const apiSecret = request.headers['x-binance-api-secret'] as string

      if (!apiKey || !apiSecret) {
        reply.code(400).send({
          success: false,
          error: 'Missing API credentials in headers',
        })
        return
      }

      // Get all positions
      const positions = await this.oms.getPositions(apiKey, apiSecret)

      // Flatten each position
      const results = []
      for (const position of positions) {
        if (parseFloat(position.positionAmt) !== 0) {
          const positionSide = env.POSITION_MODE === 'hedge' ? position.positionSide : undefined
          try {
            const result = await this.oms.flattenPosition(position.symbol, positionSide, apiKey, apiSecret)
            results.push({ symbol: position.symbol, success: true, result })
          } catch (error) {
            results.push({ symbol: position.symbol, success: false, error: (error as Error).message })
          }
        }
      }

      reply.send({
        success: true,
        message: 'Flatten all completed',
        results,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Flatten specific symbol
   */
  private async flattenSymbol(request: any, reply: any): Promise<any> {
    try {
      const { symbol } = request.params
      const positionSide = request.query.positionSide

      // Validate request
      const validated = FlattenRequestSchema.parse({ symbol, positionSide })

      const apiKey = request.headers['x-binance-api-key'] as string
      const apiSecret = request.headers['x-binance-api-secret'] as string

      if (!apiKey || !apiSecret) {
        reply.code(400).send({
          success: false,
          error: 'Missing API credentials in headers',
        })
        return
      }

      const result = await this.oms.flattenPosition(validated.symbol, validated.positionSide, apiKey, apiSecret)

      reply.send({
        success: true,
        message: `Flattened ${validated.symbol}`,
        result,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get orders
   */
  private async getOrders(request: any, reply: any): Promise<any> {
    try {
      const { symbol } = request.query

      const apiKey = request.headers['x-binance-api-key'] as string
      const apiSecret = request.headers['x-binance-api-secret'] as string

      if (!apiKey || !apiSecret) {
        reply.code(400).send({
          success: false,
          error: 'Missing API credentials in headers',
        })
        return
      }

      if (!this.oms) {
        reply.code(400).send({
          success: false,
          error: 'OMS not available in database-less mode',
        })
        return
      }

      let orders
      if (symbol) {
        orders = await this.oms.getOpenOrders(symbol, apiKey, apiSecret)
      } else {
        if (!this.prisma) {
          reply.code(400).send({
            success: false,
            error: 'Database not available for multi-symbol order query',
          })
          return
        }

        // Get orders for all tracked symbols
        const trackedSymbols = await this.prisma.trackedSymbol.findMany({
          where: { env: env.EXCHANGE_ENV, enabled: true },
        })

        orders = []
        for (const sym of trackedSymbols) {
          const symOrders = await this.oms.getOpenOrders(sym.symbol, apiKey, apiSecret)
          orders.push(...symOrders)
        }
      }

      reply.send({
        success: true,
        orders,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get positions
   */
  private async getPositions(request: any, reply: any): Promise<any> {
    try {
      const { symbol } = request.query

      const apiKey = request.headers['x-binance-api-key'] as string
      const apiSecret = request.headers['x-binance-api-secret'] as string

      if (!apiKey || !apiSecret) {
        reply.code(400).send({
          success: false,
          error: 'Missing API credentials in headers',
        })
        return
      }

      if (!this.oms) {
        reply.code(400).send({
          success: false,
          error: 'OMS not available in database-less mode',
        })
        return
      }

      const positions = await this.oms.getPositions(apiKey, apiSecret)

      // Filter by symbol if specified
      const filteredPositions = symbol
        ? positions.filter((p: any) => p.symbol === symbol)
        : positions

      reply.send({
        success: true,
        positions: filteredPositions,
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }
}
