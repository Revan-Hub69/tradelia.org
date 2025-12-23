import { EventEmitter } from 'events'
import { MarketDataService } from './marketDataService'
import { WebSocketDataService } from './webSocketDataService'
import { SymbolCandidate, KlineData, OrderBookData } from './types'

export class HybridDataService extends EventEmitter {
  private restService: MarketDataService
  private wsService: WebSocketDataService
  private wsEnabled: boolean = true

  constructor() {
    super()
    this.restService = new MarketDataService()
    this.wsService = new WebSocketDataService()

    // Relay WebSocket events
    this.setupWSEventRelaying()
  }

  /**
   * Setup event relaying from WebSocket to this service
   */
  private setupWSEventRelaying(): void {
    this.wsService.on('spread', (data) => this.emit('spread', data))
    this.wsService.on('orderBook', (data) => this.emit('orderBook', data))
    this.wsService.on('trade', (data) => this.emit('trade', data))
    this.wsService.on('markPrice', (data) => this.emit('markPrice', data))
    this.wsService.on('error', (error) => this.emit('wsError', error))
  }

  /**
   * Get order book - prefer WS if available, fallback to REST
   */
  async getOrderBook(symbol: string, levels: number = 50): Promise<OrderBookData | null> {
    // Try WebSocket first if enabled and connected
    if (this.wsEnabled && this.wsService.getStatus().isConnected) {
      const wsOrderBook = this.wsService.getOrderBook(symbol)
      if (wsOrderBook) {
        return {
          bids: wsOrderBook.bids.slice(0, levels).map(([price, qty]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty)
          })),
          asks: wsOrderBook.asks.slice(0, levels).map(([price, qty]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty)
          })),
          timestamp: wsOrderBook.lastUpdateId
        }
      }
    }

    // Fallback to REST
    return this.restService.getOrderBook(symbol, levels)
  }

  /**
   * Get spread data - prefer WS if available, fallback to REST
   */
  async getBookTicker(symbol: string): Promise<{ bid: number; ask: number; spreadBps: number } | null> {
    // Try WebSocket first if enabled and connected
    if (this.wsEnabled && this.wsService.getStatus().isConnected) {
      const wsOrderBook = this.wsService.getOrderBook(symbol)
      if (wsOrderBook && wsOrderBook.bids.length > 0 && wsOrderBook.asks.length > 0) {
        const bid = parseFloat(wsOrderBook.bids[0][0])
        const ask = parseFloat(wsOrderBook.asks[0][0])

        if (bid > 0 && ask > 0) {
          const mid = (bid + ask) / 2
          const spreadBps = ((ask - bid) / mid) * 10000

          return { bid, ask, spreadBps }
        }
      }
    }

    // Fallback to REST
    return this.restService.getBookTicker(symbol)
  }

  /**
   * Get klines - always use REST (WS not suitable for historical data)
   */
  async getKlines(symbol: string, interval: string, limit: number = 500): Promise<KlineData[]> {
    return this.restService.getKlines(symbol, interval, limit)
  }

  /**
   * Get klines for multiple timeframes
   */
  async getKlinesMultiTimeframe(symbol: string, timeframes: string[], limit: number = 500) {
    return this.restService.getKlinesMultiTimeframe(symbol, timeframes, limit)
  }

  /**
   * Get all symbols - use REST
   */
  async getAllUsdtPerpetualSymbols(): Promise<string[]> {
    return this.restService.getAllUsdtPerpetualSymbols()
  }

  /**
   * Get 24h tickers - use REST
   */
  async get24hTickers() {
    return this.restService.get24hTickers()
  }

  /**
   * Build candidates - use REST
   */
  async buildCandidates(): Promise<SymbolCandidate[]> {
    return this.restService.buildCandidates()
  }

  /**
   * Get open interest - use REST
   */
  async getOpenInterest(symbol: string): Promise<number | null> {
    return this.restService.getOpenInterest(symbol)
  }

  /**
   * Subscribe to real-time streams for symbols
   */
  subscribeSymbols(symbols: string[]): void {
    if (!this.wsEnabled) return

    console.log(`📡 Subscribing to ${symbols.length} symbols for real-time data`)

    for (const symbol of symbols) {
      // Subscribe to order book updates
      this.wsService.subscribeOrderBook(symbol, 50)

      // Subscribe to trades (for volume monitoring)
      this.wsService.subscribeTrades(symbol)
    }

    // Subscribe to all mark prices (for funding rates)
    this.wsService.subscribeMarkPrice()
  }

  /**
   * Unsubscribe from symbols
   */
  unsubscribeSymbols(symbols: string[]): void {
    if (!this.wsEnabled) return

    console.log(`📡 Unsubscribing from ${symbols.length} symbols`)

    for (const symbol of symbols) {
      // Note: WebSocket service handles stream naming internally
      // This is a simplified version - in production you'd track subscriptions better
    }
  }

  /**
   * Get WebSocket connection status
   */
  getWSStatus() {
    return this.wsService.getStatus()
  }

  /**
   * Enable/disable WebSocket usage
   */
  setWSEnabled(enabled: boolean): void {
    this.wsEnabled = enabled
    console.log(`🔌 WebSocket ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Get spread history from WebSocket (if available)
   */
  getSpreadHistory(symbol: string): number[] {
    if (this.wsEnabled && this.wsService.getStatus().isConnected) {
      return this.wsService.getSpreadHistory(symbol)
    }
    return []
  }

  /**
   * Get mark price from WebSocket (if available)
   */
  getMarkPrice(symbol: string) {
    if (this.wsEnabled && this.wsService.getStatus().isConnected) {
      return this.wsService.getMarkPrice(symbol)
    }
    return null
  }

  /**
   * Batch fetch with rate limiting
   */
  async batchFetch<T>(
    symbols: string[],
    fetchFn: (symbol: string) => Promise<T>,
    concurrency: number = 5
  ): Promise<Map<string, T>> {
    return this.restService.batchFetch(symbols, fetchFn, concurrency)
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.restService.healthCheck()
  }

  /**
   * Cleanup resources
   */
  disconnect(): void {
    this.wsService.disconnect()
  }
}
