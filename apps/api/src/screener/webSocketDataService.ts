import WebSocket from 'ws'
import { EventEmitter } from 'events'
import { env } from '../config/env'

interface WSStreamData {
  stream?: string
  data?: any
  id?: number
}

interface OrderBookUpdate {
  lastUpdateId: number
  bids: [string, string][]
  asks: [string, string][]
}

interface TradeUpdate {
  eventType: string
  eventTime: number
  symbol: string
  tradeId: number
  price: string
  quantity: string
  tradeTime: number
  isBuyerMaker: boolean
}

interface MarkPriceUpdate {
  eventType: string
  eventTime: number
  symbol: string
  markPrice: string
  indexPrice: string
  estimatedSettlePrice: string
  fundingRate: string
  nextFundingTime: number
}

export class WebSocketDataService extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingTimer: NodeJS.Timeout | null = null
  private subscriptions: Set<string> = new Set()
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 10
  private reconnectDelay: number = 1000 // Start with 1 second

  // Data caches
  private orderBooks: Map<string, OrderBookUpdate> = new Map()
  private markPrices: Map<string, MarkPriceUpdate> = new Map()
  private lastTradeTimes: Map<string, number> = new Map()
  private spreadHistory: Map<string, number[]> = new Map()

  constructor() {
    super()
    this.connect()
  }

  /**
   * Connect to Binance WebSocket
   */
  private connect(): void {
    try {
      const wsUrl = env.MARKET_DATA_ENV === 'live'
        ? 'wss://fstream.binance.com/ws'
        : 'wss://stream.binancefuture.com/ws'

      console.log(`🔌 Connecting to Binance WS: ${wsUrl}`)
      this.ws = new WebSocket(wsUrl)

      this.ws.on('open', this.onOpen.bind(this))
      this.ws.on('message', this.onMessage.bind(this))
      this.ws.on('error', this.onError.bind(this))
      this.ws.on('close', this.onClose.bind(this))
      this.ws.on('ping', this.onPing.bind(this))
      this.ws.on('pong', this.onPong.bind(this))

    } catch (error) {
      console.error('WS connection failed:', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Handle WebSocket open
   */
  private onOpen(): void {
    console.log('✅ Binance WS connected')
    this.isConnected = true
    this.reconnectAttempts = 0
    this.reconnectDelay = 1000
    this.startPingTimer()

    // Resubscribe to existing streams
    this.resubscribeAll()
  }

  /**
   * Handle WebSocket messages
   */
  private onMessage(data: WebSocket.RawData): void {
    try {
      const message: WSStreamData = JSON.parse(data.toString())

      if (message.stream) {
        this.handleStreamMessage(message)
      } else if (message.id) {
        // Subscription response
        console.log('📡 WS subscription response:', message)
      }
    } catch (error) {
      console.error('WS message parse error:', error)
    }
  }

  /**
   * Handle stream messages
   */
  private handleStreamMessage(message: WSStreamData): void {
    if (!message.stream) return

    const [streamType, symbol] = message.stream.split('@')
    const cleanSymbol = symbol?.replace('/', '') || ''

    switch (streamType) {
      case 'depth':
        this.handleOrderBookUpdate(cleanSymbol, message.data)
        break
      case 'aggTrade':
        this.handleTradeUpdate(cleanSymbol, message.data)
        break
      case '!markPrice':
        this.handleMarkPriceUpdate(message.data)
        break
      default:
        // Individual symbol streams
        if (message.stream.includes('depth')) {
          this.handleOrderBookUpdate(cleanSymbol, message.data)
        } else if (message.stream.includes('aggTrade')) {
          this.handleTradeUpdate(cleanSymbol, message.data)
        } else if (message.stream.includes('markPrice')) {
          this.handleMarkPriceUpdate(message.data)
        }
    }
  }

  /**
   * Handle order book updates
   */
  private handleOrderBookUpdate(symbol: string, data: OrderBookUpdate): void {
    this.orderBooks.set(symbol, data)

    // Calculate and emit spread
    const spreadBps = this.calculateSpreadBps(data)
    this.emit('spread', { symbol, spreadBps, timestamp: Date.now() })

    // Update spread history for volatility calculation
    if (!this.spreadHistory.has(symbol)) {
      this.spreadHistory.set(symbol, [])
    }
    const history = this.spreadHistory.get(symbol)!
    history.push(spreadBps)
    if (history.length > 100) { // Keep last 100 spreads
      history.shift()
    }

    this.emit('orderBook', { symbol, orderBook: data })
  }

  /**
   * Handle trade updates
   */
  private handleTradeUpdate(symbol: string, data: TradeUpdate): void {
    this.lastTradeTimes.set(symbol, data.tradeTime)
    this.emit('trade', { symbol, trade: data })
  }

  /**
   * Handle mark price updates
   */
  private handleMarkPriceUpdate(data: MarkPriceUpdate | MarkPriceUpdate[]): void {
    const updates = Array.isArray(data) ? data : [data]

    for (const update of updates) {
      this.markPrices.set(update.symbol, update)
      this.emit('markPrice', { symbol: update.symbol, markPrice: update })
    }
  }

  /**
   * Calculate spread in basis points
   */
  private calculateSpreadBps(orderBook: OrderBookUpdate): number {
    if (!orderBook.bids?.length || !orderBook.asks?.length) return 0

    const bestBid = parseFloat(orderBook.bids[0][0])
    const bestAsk = parseFloat(orderBook.asks[0][0])

    if (bestBid <= 0 || bestAsk <= 0) return 0

    const mid = (bestBid + bestAsk) / 2
    return ((bestAsk - bestBid) / mid) * 10000
  }

  /**
   * Subscribe to order book stream
   */
  subscribeOrderBook(symbol: string, levels: number = 50): void {
    const stream = `${symbol.toLowerCase()}@depth${levels}@100ms`
    this.subscribe(stream)
  }

  /**
   * Subscribe to aggregate trade stream
   */
  subscribeTrades(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@aggTrade`
    this.subscribe(stream)
  }

  /**
   * Subscribe to mark price stream
   */
  subscribeMarkPrice(symbol?: string): void {
    const stream = symbol ? `${symbol.toLowerCase()}@markPrice@1s` : '!markPrice@arr@1s'
    this.subscribe(stream)
  }

  /**
   * Subscribe to stream
   */
  private subscribe(stream: string): void {
    if (!this.isConnected || this.subscriptions.has(stream)) return

    const message = {
      method: 'SUBSCRIBE',
      params: [stream],
      id: Date.now()
    }

    this.ws?.send(JSON.stringify(message))
    this.subscriptions.add(stream)
    console.log(`📡 Subscribed to: ${stream}`)
  }

  /**
   * Unsubscribe from stream
   */
  unsubscribe(stream: string): void {
    if (!this.isConnected || !this.subscriptions.has(stream)) return

    const message = {
      method: 'UNSUBSCRIBE',
      params: [stream],
      id: Date.now()
    }

    this.ws?.send(JSON.stringify(message))
    this.subscriptions.delete(stream)
    console.log(`📡 Unsubscribed from: ${stream}`)
  }

  /**
   * Resubscribe to all streams after reconnection
   */
  private resubscribeAll(): void {
    for (const stream of this.subscriptions) {
      const message = {
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now()
      }
      this.ws?.send(JSON.stringify(message))
    }
    console.log(`🔄 Resubscribed to ${this.subscriptions.size} streams`)
  }

  /**
   * Start ping timer for connection health
   */
  private startPingTimer(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping()
      }
    }, 30000) // Ping every 30 seconds
  }

  /**
   * Handle ping/pong for connection health
   */
  private onPing(): void {
    this.ws?.pong()
  }

  private onPong(): void {
    // Connection is healthy
  }

  /**
   * Handle WebSocket errors
   */
  private onError(error: Error): void {
    console.error('WS error:', error)
    this.emit('error', error)
  }

  /**
   * Handle WebSocket close
   */
  private onClose(code: number, reason: Buffer): void {
    console.log(`🔌 WS closed: ${code} - ${reason.toString()}`)
    this.isConnected = false

    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }

    this.scheduleReconnect()
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('maxReconnectAttempts')
      return
    }

    this.reconnectAttempts++
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000) // Max 30 seconds

    console.log(`🔄 Scheduling reconnect in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectDelay)
  }

  /**
   * Get current order book for symbol
   */
  getOrderBook(symbol: string): OrderBookUpdate | null {
    return this.orderBooks.get(symbol) || null
  }

  /**
   * Get current mark price for symbol
   */
  getMarkPrice(symbol: string): MarkPriceUpdate | null {
    return this.markPrices.get(symbol) || null
  }

  /**
   * Get spread history for symbol
   */
  getSpreadHistory(symbol: string): number[] {
    return this.spreadHistory.get(symbol) || []
  }

  /**
   * Get connection status
   */
  getStatus(): {
    isConnected: boolean
    subscriptions: number
    reconnectAttempts: number
    orderBooks: number
    markPrices: number
  } {
    return {
      isConnected: this.isConnected,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
      orderBooks: this.orderBooks.size,
      markPrices: this.markPrices.size
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnected = false
    this.subscriptions.clear()
    console.log('🔌 WS service disconnected')
  }
}
