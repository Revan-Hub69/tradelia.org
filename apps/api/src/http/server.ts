import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { OMSService } from '../oms/omsService'
import { RiskEngine } from '../risk/riskEngine'
import { KillSwitch } from '../kill/killSwitch'
import { ReconcileService } from '../reconcile/reconcileService'
import { BinanceRestClient } from '../exchange/binance/restClient'
import { OrderIntentSchema, FlattenRequestSchema } from '../oms/types'

export class EngineServer {
  private prisma: PrismaClient
  private oms: OMSService
  private riskEngine: RiskEngine
  private killSwitch: KillSwitch
  private reconcileService: ReconcileService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma

    // Initialize services
    const binanceClient = new BinanceRestClient(env.EXCHANGE_ENV)
    this.oms = new OMSService(prisma, binanceClient)
    this.riskEngine = new RiskEngine(prisma)
    this.killSwitch = new KillSwitch(prisma, this.oms, binanceClient)
    this.reconcileService = new ReconcileService(
      prisma,
      this.oms,
      this.riskEngine,
      this.killSwitch,
      binanceClient
    )
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    await this.riskEngine.initialize()
    await this.reconcileService.initializeTrackedSymbols()
    console.log('✅ Engine services initialized')
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
    app.post('/oms/flatten', this.flattenAll.bind(this))
    app.post('/oms/flatten/:symbol', this.flattenSymbol.bind(this))
    app.get('/oms/orders', this.getOrders.bind(this))
    app.get('/oms/positions', this.getPositions.bind(this))
  }

  /**
   * Start engine and reconcile loop
   */
  private async startEngine(request: any, reply: any): Promise<any> {
    try {
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

      let orders
      if (symbol) {
        orders = await this.oms.getOpenOrders(symbol, apiKey, apiSecret)
      } else {
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
