import { EventEmitter } from 'events'
import { MarketDataService } from './marketDataService'
import { SupabaseDataService } from './supabaseDataService'
import { SymbolCandidate, KlineData, OrderBookData } from './types'

export class HybridDataService extends EventEmitter {
  private restService: MarketDataService
  private supabaseService: SupabaseDataService
  private dbEnabled: boolean = true

  constructor() {
    super()
    this.restService = new MarketDataService()
    this.supabaseService = new SupabaseDataService()

    // Relay Supabase events
    this.setupDBEventRelaying()
  }

  /**
   * Setup event relaying from Supabase to this service
   */
  private setupDBEventRelaying(): void {
    this.supabaseService.on('spread', (data: any) => this.emit('spread', data))
    this.supabaseService.on('orderBook', (data: any) => this.emit('orderBook', data))
    this.supabaseService.on('dataUpdate', (data: any) => this.emit('dataUpdate', data))
  }

  /**
   * Get order book - prefer Supabase if available, fallback to REST
   */
  async getOrderBook(symbol: string, levels: number = 50): Promise<OrderBookData | null> {
    // Try Supabase first if enabled
    if (this.dbEnabled) {
      const dbOrderBook = await this.supabaseService.getOrderBook(symbol, levels)
      if (dbOrderBook) {
        return dbOrderBook
      }
    }

    // Fallback to REST
    return this.restService.getOrderBook(symbol, levels)
  }

  /**
   * Get spread data - prefer Supabase if available, fallback to REST
   */
  async getBookTicker(symbol: string): Promise<{ bid: number; ask: number; spreadBps: number } | null> {
    // Try Supabase first if enabled
    if (this.dbEnabled) {
      const dbTicker = await this.supabaseService.getBookTicker(symbol)
      if (dbTicker) {
        return dbTicker
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
   * Subscribe to real-time streams for symbols (no-op for DB-based service)
   */
  subscribeSymbols(symbols: string[]): void {
    // DB-based service doesn't need explicit subscriptions
    // Data is polled continuously from feature_snapshots
    console.log(`📊 DB-based service: monitoring ${symbols.length} symbols`)
  }

  /**
   * Unsubscribe from symbols (no-op for DB-based service)
   */
  unsubscribeSymbols(symbols: string[]): void {
    // DB-based service doesn't need explicit unsubscriptions
    console.log(`📊 DB-based service: stopped monitoring ${symbols.length} symbols`)
  }

  /**
   * Get DB connection status
   */
  getDBStatus() {
    return this.supabaseService.getStatus()
  }

  /**
   * Enable/disable DB usage
   */
  setDBEnabled(enabled: boolean): void {
    this.dbEnabled = enabled
    console.log(`🗄️ DB service ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Get latest snapshot from DB (if available)
   */
  getLatestSnapshot(symbol: string) {
    if (this.dbEnabled) {
      return this.supabaseService.getLatestSnapshot(symbol)
    }
    return null
  }

  /**
   * Get all latest snapshots from DB
   */
  getAllLatestSnapshots() {
    if (this.dbEnabled) {
      return this.supabaseService.getAllLatestSnapshots()
    }
    return new Map()
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
    this.supabaseService.disconnect()
  }
}
