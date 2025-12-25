import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import WebSocket from 'ws'
import { env } from '../config/env'

// WebSocket message types
interface WSMessage {
  type: string
  payload?: any
  symbol?: string
  channel?: string
  userId?: string
}

interface WSClient {
  ws: WebSocket
  userId?: string
  subscriptions: Set<string>
}

export class EngineServer {
  private prisma: PrismaClient | null
  private wss: WebSocket.Server | null = null
  private clients: Map<WebSocket, WSClient> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  // Market data caches
  private orderBooks: Map<string, any> = new Map()
  private futuresData: Map<string, any> = new Map()
  private screenerData: any[] = []

  // Trading engine (PROMPT-3)
  private tradingEngine: any = null

  constructor(prisma: PrismaClient | null) {
    this.prisma = prisma
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    // Initialize WebSocket server
    await this.initializeWebSocket()

    // Mock data generators are disabled by default; enable only via explicit env flag
    if (env.ENABLE_MOCK_DATA) {
      console.warn('🧪 Mock data generators ENABLED via ENABLE_MOCK_DATA=true (not recommended for production)')
      this.startMockDataGenerators()
    } else {
      console.log('✅ Mock data generators disabled (real data only)')
    }

    // Initialize autonomous trading engine (PROMPT-3)
    await this.initializeTradingEngine()

    console.log('✅ Engine server initialized with WebSocket and Autonomous Trading support')
  }

  /**
   * Initialize autonomous trading engine (PROMPT-3)
   */
  private async initializeTradingEngine(): Promise<void> {
    // Skip if no database connection (development mode)
    if (!this.prisma) {
      console.log('⚠️ Skipping trading engine initialization - no database connection')
      return
    }

    try {
      // Check trading prerequisites (fail-fast approach)
      const tradingEnabled = await this.checkTradingPrerequisites()

      if (!tradingEnabled) {
        console.log('⚠️ Trading engine disabled - missing API keys or TRADING_ENABLED=false')
        console.log('🔍 Running in READ-ONLY mode (market data only)')
        return
      }

      // Import static to avoid circular dependencies issues
      const { TradingEngine } = await import('../strategy/tradingEngine')
      const { OMSService } = await import('../oms/omsService')
      const { RiskEngine } = await import('../risk/riskEngine')
      const { ScreenerService } = await import('../screener/screenerService')
      const { BinanceRestClient } = await import('../exchange/binance/restClient')

      // Initialize services
      const binanceClient = new BinanceRestClient(env.EXCHANGE_ENV)
      const oms = new OMSService(this.prisma!, binanceClient) // prisma is guaranteed to exist here
      const riskEngine = new RiskEngine(this.prisma!)
      const screener = new ScreenerService(this.prisma!)

      // Initialize trading engine with default config
      this.tradingEngine = new TradingEngine(
        this.prisma,
        oms,
        riskEngine,
        screener,
        {
          enabled: true,
          maxConcurrentPositions: 3,
          riskPerTrade: 1.0, // 1% per trade
          setupMinConfidence: 60,
          regimeThreshold: 70,
          slBufferBps: 50, // 0.5%
          tpMultiplier: 2.0, // 2R target
          trailingEnabled: true,
          trailingActivationR: 1.0,
          trailingDistanceBps: 50
        }
      )

      // Start the autonomous trading engine
      await this.tradingEngine.start()

      console.log('🚀 Autonomous Trading Engine started successfully')

    } catch (error) {
      console.error('❌ Failed to initialize trading engine:', error)
      // Don't fail the entire server for trading engine issues
    }
  }

  /**
   * Check if trading prerequisites are met (fail-fast approach)
   */
  private async checkTradingPrerequisites(): Promise<boolean> {
    try {
      // Check environment variable
      if (!env.TRADING_ENABLED) {
        console.log('TRADING_ENABLED=false in environment')
        return false
      }

      // Check API keys
      const hasApiKey = env.BINANCE_API_KEY && env.BINANCE_API_KEY.length > 10
      const hasApiSecret = env.BINANCE_API_SECRET && env.BINANCE_API_SECRET.length > 10

      if (!hasApiKey || !hasApiSecret) {
        console.log('Missing or invalid Binance API credentials')
        return false
      }

      // Check database tables exist (quick query)
      try {
        await this.prisma!.orderRecord.findFirst({ take: 1 })
        await this.prisma!.screenerRun.findFirst({ take: 1 })
      } catch (dbError: any) {
        if (dbError.code === 'P2021') {
          console.log('Database tables missing - run migrations first')
          return false
        }
        throw dbError
      }

      console.log('✅ Trading prerequisites met')
      return true

    } catch (error) {
      console.error('Error checking trading prerequisites:', error)
      return false
    }
  }

  /**
   * Initialize WebSocket server
   */
  private async initializeWebSocket(): Promise<void> {
    // Will be called after Fastify server is ready
    console.log('🌐 WebSocket server initialization deferred until server starts')
  }

  /**
   * Start WebSocket server attached to Fastify HTTP server
   */
  startWebSocketServer(fastifyServer: any): void {
    // Attach WebSocket to the same HTTP server as Fastify (same port)
    this.wss = new WebSocket.Server({
      server: fastifyServer,
      path: '/ws',
    })

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔗 WebSocket client connected')
      this.clients.set(ws, { ws, subscriptions: new Set() })

      ws.on('message', (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString())
          this.handleWebSocketMessage(ws, message)
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
          this.sendError(ws, 'Invalid message format')
        }
      })

      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected')
        this.clients.delete(ws)
      })

      ws.on('error', (error) => {
        console.error('❌ WebSocket client error:', error)
        this.clients.delete(ws)
      })

      // Send welcome message
      this.sendMessage(ws, { type: 'connected', payload: { serverTime: new Date().toISOString() } })
    })

    // Start heartbeat
    this.startHeartbeat()

    console.log('🌐 WebSocket server attached on path /ws')
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const heartbeat = { type: 'heartbeat', timestamp: Date.now() }

      this.clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(heartbeat))
        }
      })
    }, 30000) // 30 seconds
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(ws: WebSocket, message: WSMessage): void {
    const client = this.clients.get(ws)
    if (!client) return

    switch (message.type) {
      case 'auth':
        client.userId = message.userId
        this.sendMessage(ws, { type: 'authenticated', userId: message.userId })
        break

      case 'subscribe':
        this.handleSubscribe(client, message)
        break

      case 'unsubscribe':
        this.handleUnsubscribe(client, message)
        break

      case 'refresh':
        this.handleRefresh(client, message)
        break

      default:
        this.sendError(ws, `Unknown message type: ${message.type}`)
    }
  }

  /**
   * Handle subscription requests
   */
  private handleSubscribe(client: WSClient, message: WSMessage): void {
    const { channel, symbol } = message
    if (!channel) {
      this.sendError(client.ws, 'Channel required for subscription')
      return
    }

    const subscriptionKey = symbol ? `${channel}:${symbol}` : channel
    client.subscriptions.add(subscriptionKey)

    // Send initial data if available
    switch (channel) {
      case 'orderbook':
        if (symbol && this.orderBooks.has(symbol)) {
          this.sendMessage(client.ws, {
            type: 'orderbook',
            symbol,
            data: this.orderBooks.get(symbol)
          })
        }
        break

      case 'futures':
        if (symbol && this.futuresData.has(symbol)) {
          this.sendMessage(client.ws, {
            type: 'futures',
            symbol,
            data: this.futuresData.get(symbol)
          })
        }
        break

      case 'screener':
        this.sendMessage(client.ws, {
          type: 'screener',
          data: this.screenerData
        })
        break
    }

    this.sendMessage(client.ws, {
      type: 'subscribed',
      channel,
      symbol
    })
  }

  /**
   * Handle unsubscription requests
   */
  private handleUnsubscribe(client: WSClient, message: WSMessage): void {
    const { channel, symbol } = message
    const subscriptionKey = symbol ? `${channel}:${symbol}` : channel
    if (subscriptionKey) {
      client.subscriptions.delete(subscriptionKey)
    }

    this.sendMessage(client.ws, {
      type: 'unsubscribed',
      channel,
      symbol
    })
  }

  /**
   * Handle refresh requests
   */
  private handleRefresh(client: WSClient, message: WSMessage): void {
    const { channel } = message

    switch (channel) {
      case 'screener':
        this.sendMessage(client.ws, {
          type: 'screener',
          data: this.screenerData
        })
        break
    }
  }

  /**
   * Send message to WebSocket client
   */
  private sendMessage(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  /**
   * Send error to WebSocket client
   */
  private sendError(ws: WebSocket, error: string): void {
    this.sendMessage(ws, { type: 'error', error })
  }

  /**
   * Broadcast message to all subscribed clients
   */
  private broadcastToSubscribed(channel: string, symbol: string | undefined, message: any): void {
    const subscriptionKey = symbol ? `${channel}:${symbol}` : channel

    this.clients.forEach((client) => {
      if (client.subscriptions.has(subscriptionKey) || client.subscriptions.has(channel)) {
        this.sendMessage(client.ws, message)
      }
    })
  }

  /**
   * Start mock data generators for development
   */
  private startMockDataGenerators(): void {
    // Generate mock orderbook data
    setInterval(() => {
      env.TRACK_SYMBOLS.split(',').slice(0, 5).forEach(symbol => {
        const trimmedSymbol = symbol.trim()
        const orderbook = this.generateMockOrderBook(trimmedSymbol)
        this.orderBooks.set(trimmedSymbol, orderbook)

        this.broadcastToSubscribed('orderbook', trimmedSymbol, {
          type: 'orderbook',
          symbol: trimmedSymbol,
          data: orderbook
        })
      })
    }, 1000) // Update every second

    // Generate mock futures data
    setInterval(() => {
      env.TRACK_SYMBOLS.split(',').slice(0, 5).forEach(symbol => {
        const trimmedSymbol = symbol.trim()
        const futures = this.generateMockFuturesData(trimmedSymbol)
        this.futuresData.set(trimmedSymbol, futures)

        this.broadcastToSubscribed('futures', trimmedSymbol, {
          type: 'futures',
          symbol: trimmedSymbol,
          data: futures
        })
      })
    }, 2000) // Update every 2 seconds

    // Generate mock screener data
    setInterval(() => {
      this.screenerData = this.generateMockScreenerData()

      this.broadcastToSubscribed('screener', undefined, {
        type: 'screener',
        data: this.screenerData
      })
    }, 5000) // Update every 5 seconds
  }

  /**
   * Generate mock orderbook data
   */
  private generateMockOrderBook(symbol: string): any {
    const basePrice = symbol.includes('BTC') ? 45000 : symbol.includes('ETH') ? 2800 : 100
    const spread = basePrice * 0.0001 // 0.01%

    return {
      symbol,
      timestamp: Date.now(),
      bids: Array.from({ length: 20 }, (_, i) => ({
        price: basePrice - spread * (i + 1) + Math.random() * spread * 0.1,
        quantity: Math.random() * 10,
        orders: Math.floor(Math.random() * 5) + 1
      })).sort((a, b) => b.price - a.price),

      asks: Array.from({ length: 20 }, (_, i) => ({
        price: basePrice + spread * (i + 1) + Math.random() * spread * 0.1,
        quantity: Math.random() * 10,
        orders: Math.floor(Math.random() * 5) + 1
      })).sort((a, b) => a.price - b.price),

      lastUpdateId: Date.now()
    }
  }

  /**
   * Generate mock futures data
   */
  private generateMockFuturesData(symbol: string): any {
    const basePrice = symbol.includes('BTC') ? 45000 : symbol.includes('ETH') ? 2800 : 100

    return {
      symbol,
      markPrice: basePrice + (Math.random() - 0.5) * basePrice * 0.001,
      indexPrice: basePrice + (Math.random() - 0.5) * basePrice * 0.0005,
      fundingRate: (Math.random() - 0.5) * 0.0002,
      nextFundingTime: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      countDownMs: 8 * 60 * 60 * 1000 - (Date.now() % (8 * 60 * 60 * 1000))
    }
  }

  /**
   * Generate mock screener data
   */
  private generateMockScreenerData(): any[] {
    return env.TRACK_SYMBOLS.split(',').slice(0, 20).map((symbol, index) => {
      const basePrice = symbol.includes('BTC') ? 45000 :
                       symbol.includes('ETH') ? 2800 : 100
      const price = basePrice + Math.random() * basePrice * 0.1
      const support = price * (0.95 - Math.random() * 0.05) // Support 5-10% below
      const resistance = price * (1.05 + Math.random() * 0.05) // Resistance 5-10% above

      return {
        symbol: symbol.trim(),
        score: Math.random() * 100,
        lqs: Math.random() * 100, // Liquidity Quality Score
        vos: Math.random() * 100, // Volatility Opportunity Score
        dfs: Math.random() * 100, // Derivatives Flow Score
        mes: Math.random() * 100, // Microstructure Edge Score
        mtfGate: ['PASS', 'REVIEW', 'FAIL'][Math.floor(Math.random() * 3)],
        imbalance: (Math.random() - 0.5) * 0.1, // Orderbook imbalance
        volume24h: Math.random() * 1000000,
        price: price,
        change24h: (Math.random() - 0.5) * 10,
        rank: index + 1,
        // Advanced metrics
        oi: Math.random() * 100000 + 10000, // Open Interest
        pressure: (Math.random() - 0.5) * 2, // Buy/Sell Pressure (-1 to 1)
        support: support,
        resistance: resistance,
        slippage: Math.random() * 0.5, // Average Slippage %
        accumulationZone: ['ACCUMULATION', 'DISTRIBUTION', 'NEUTRAL'][Math.floor(Math.random() * 3)]
      }
    }).sort((a, b) => b.score - a.score)
  }

  /**
   * Register all routes
   */
  registerRoutes(app: FastifyInstance): void {
    // Health check routes
    app.get('/health', this.getHealthStatus.bind(this))
    app.get('/health/live', this.getHealthLive.bind(this))
    app.get('/health/ready', this.getHealthReady.bind(this))

    // Frontend API contract routes (market snapshot served via baseRoutes plugin)
    app.get('/runtime', this.getRuntimeStatus.bind(this))
    app.get('/symbols', this.getTrackedSymbols.bind(this))
    app.get('/signals/active', this.getActiveSignals.bind(this))
    app.post('/exchange/connect', this.connectExchange.bind(this))

    // Exchange connections management routes
    app.register(async (exchangeApp) => {
      const { exchangeConnectionsRoutes } = await import('../routes/exchangeConnections')
      await exchangeApp.register(exchangeConnectionsRoutes)
    })
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
   * Get active signals for frontend
   */
  private async getActiveSignals(request: any, reply: any): Promise<any> {
    try {
      reply.code(503).send({
        success: false,
        error: 'Active signals not available without live engine state'
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
