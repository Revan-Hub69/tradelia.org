import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'

export class EngineServer {
  private prisma: PrismaClient | null

  constructor(prisma: PrismaClient | null) {
    this.prisma = prisma
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    console.log('✅ Engine server initialized')
  }

  /**
   * Register all routes
   */
  registerRoutes(app: FastifyInstance): void {
    // Health check routes
    app.get('/health', this.getHealthStatus.bind(this))
    app.get('/health/live', this.getHealthLive.bind(this))
    app.get('/health/ready', this.getHealthReady.bind(this))

    // Frontend API contract routes
    app.get('/runtime', this.getRuntimeStatus.bind(this))
    app.get('/symbols', this.getTrackedSymbols.bind(this))
    app.get('/market/snapshot', this.getMarketSnapshot.bind(this))
    app.get('/signals/active', this.getActiveSignals.bind(this))
    app.post('/exchange/connect', this.connectExchange.bind(this))
  }

  /**
   * Get runtime status for frontend
   */
  private async getRuntimeStatus(request: any, reply: any): Promise<any> {
    try {
      const status = {
        exchangeEnv: env.EXCHANGE_ENV,
        tradingEnabled: env.TRADING_ENABLED,
        trackedSymbols: env.TRACK_SYMBOLS.split(',').map(s => s.trim()),
        serverTime: new Date().toISOString(),
        version: '1.1.0',
        mode: this.prisma ? 'full' : 'demo'
      }

      reply.send({
        success: true,
        runtime: status
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message
      })
    }
  }

  /**
   * Get tracked symbols for frontend
   */
  private async getTrackedSymbols(request: any, reply: any): Promise<any> {
    try {
      const symbols = env.TRACK_SYMBOLS.split(',').map(s => s.trim())

      reply.send({
        success: true,
        symbols: symbols.map(symbol => ({
          symbol,
          enabled: true,
          env: env.EXCHANGE_ENV
        }))
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message
      })
    }
  }

  /**
   * Get market snapshot for frontend
   */
  private async getMarketSnapshot(request: any, reply: any): Promise<any> {
    try {
      // Return mock data for frontend development
      reply.send({
        success: true,
        snapshot: {
          candidatesCount: 25,
          topKCount: 5,
          lastUpdate: new Date().toISOString(),
          symbols: env.TRACK_SYMBOLS.split(',').slice(0, 5).map(symbol => ({
            symbol,
            score: Math.random() * 100,
            liquidity: Math.random() * 1000000,
            volatility: Math.random() * 10
          }))
        }
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message
      })
    }
  }

  /**
   * Get active signals for frontend
   */
  private async getActiveSignals(request: any, reply: any): Promise<any> {
    try {
      // Return mock data for frontend development
      reply.send({
        success: true,
        signals: [
          {
            id: 'signal_1',
            symbol: 'BTCUSDT',
            side: 'LONG',
            entryPrice: 45000,
            slPrice: 44000,
            tpPrice: 47000,
            confidence: 0.85,
            timestamp: new Date().toISOString()
          }
        ]
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message
      })
    }
  }

  /**
   * Connect exchange (placeholder for future implementation)
   */
  private async connectExchange(request: any, reply: any): Promise<any> {
    try {
      // Placeholder for future exchange connection implementation
      // This would validate and store encrypted API credentials

      reply.send({
        success: true,
        message: 'Exchange connection not yet implemented',
        status: 'pending'
      })
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: (error as Error).message
      })
    }
  }

  /**
   * Comprehensive health check
   */
  private async getHealthStatus(request: any, reply: any): Promise<any> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: this.prisma ? 'connected' : 'not_configured',
          api: 'running',
          exchange: env.EXCHANGE_ENV
        },
        uptime: process.uptime()
      }

      reply.send({
        success: true,
        health,
      })
    } catch (error) {
      reply.code(503).send({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Liveness probe - indicates if the app is running
   */
  private async getHealthLive(request: any, reply: any): Promise<any> {
    // Simple liveness check - if we can respond, we're alive
    reply.send({
      status: 'alive',
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Readiness probe - indicates if the app is ready to serve traffic
   */
  private async getHealthReady(request: any, reply: any): Promise<any> {
    try {
      // Check if critical services are available
      const criticalServices = [
        this.prisma ? 'database' : null,
        'api'
      ].filter(Boolean)

      const isReady = criticalServices.length >= 1

      const statusCode = isReady ? 200 : 503

      reply.code(statusCode).send({
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        services: criticalServices,
      })
    } catch (error) {
      reply.code(503).send({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      })
    }
  }
}
