import { env } from '../config/env'
import { BINANCE_BASE_URLS } from '../config/env'
import { SymbolCandidate, KlineData, OrderBookData, TickerData } from './types'
import { WebSocketDataService } from './webSocketDataService'

export class MarketDataService {
  private baseUrl: string

  constructor(marketDataEnv: 'live' | 'testnet' = env.MARKET_DATA_ENV) {
    this.baseUrl = BINANCE_BASE_URLS[marketDataEnv].rest
  }

  /**
   * Fetch all USDT perpetual futures symbols
   */
  async getAllUsdtPerpetualSymbols(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/fapi/v1/exchangeInfo`)
      const data = await response.json()

      const symbols = data.symbols
        .filter((symbol: any) =>
          symbol.contractType === 'PERPETUAL' &&
          symbol.quoteAsset === 'USDT' &&
          symbol.status === 'TRADING'
        )
        .map((symbol: any) => symbol.symbol)

      console.log(`📊 Found ${symbols.length} USDT perpetual symbols`)
      return symbols
    } catch (error) {
      console.error('Failed to fetch exchange info:', error)
      return []
    }
  }

  /**
   * Fetch 24h ticker data for volume filtering
   */
  async get24hTickers(): Promise<TickerData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/fapi/v1/ticker/24hr`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch 24h tickers:', error)
      return []
    }
  }

  /**
   * Build candidate list with volume filtering
   */
  async buildCandidates(): Promise<SymbolCandidate[]> {
    const [symbols, tickers] = await Promise.all([
      this.getAllUsdtPerpetualSymbols(),
      this.get24hTickers()
    ])

    const tickerMap = new Map(tickers.map(t => [t.symbol, t]))

    const candidates: SymbolCandidate[] = symbols
      .map(symbol => {
        const ticker = tickerMap.get(symbol)
        if (!ticker) return null

        const quoteVolume24h = parseFloat(ticker.quoteVolume)
        const isTradable = quoteVolume24h >= env.MIN_DAILY_QUOTE_VOL_USD

        return {
          symbol,
          quoteVolume24h,
          isTradable
        }
      })
      .filter((candidate): candidate is SymbolCandidate => candidate !== null)
      .sort((a, b) => b.quoteVolume24h - a.quoteVolume24h) // Sort by volume desc
      .slice(0, env.MAX_SYMBOLS_TRACKED * 3) // Cap candidates

    console.log(`🎯 Built ${candidates.length} candidates (${candidates.filter(c => c.isTradable).length} tradable)`)
    return candidates
  }

  /**
   * Fetch klines for multiple timeframes
   */
  async getKlinesMultiTimeframe(symbol: string, timeframes: string[], limit: number = 500): Promise<Map<string, KlineData[]>> {
    const klinesMap = new Map<string, KlineData[]>()

    for (const timeframe of timeframes) {
      try {
        const klines = await this.getKlines(symbol, timeframe, limit)
        klinesMap.set(timeframe, klines)
      } catch (error) {
        console.warn(`Failed to fetch ${timeframe} klines for ${symbol}:`, error)
        klinesMap.set(timeframe, [])
      }
    }

    return klinesMap
  }

  /**
   * Fetch klines for single timeframe
   */
  async getKlines(symbol: string, interval: string, limit: number = 500): Promise<KlineData[]> {
    try {
      const url = `${this.baseUrl}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      const response = await fetch(url)
      const data = await response.json()

      return data.map((kline: any[]) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }))
    } catch (error) {
      console.error(`Failed to fetch ${interval} klines for ${symbol}:`, error)
      return []
    }
  }

  /**
   * Fetch order book data
   */
  async getOrderBook(symbol: string, levels: number = 50): Promise<OrderBookData | null> {
    try {
      const url = `${this.baseUrl}/fapi/v1/depth?symbol=${symbol}&limit=${levels}`
      const response = await fetch(url)
      const data = await response.json()

      return {
        bids: data.bids.map((bid: [string, string]) => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1])
        })),
        asks: data.asks.map((ask: [string, string]) => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1])
        })),
        timestamp: data.lastUpdateId || Date.now()
      }
    } catch (error) {
      console.error(`Failed to fetch order book for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Fetch spread data (book ticker)
   */
  async getBookTicker(symbol: string): Promise<{ bid: number; ask: number; spreadBps: number } | null> {
    try {
      const url = `${this.baseUrl}/fapi/v1/ticker/bookTicker?symbol=${symbol}`
      const response = await fetch(url)
      const data = await response.json()

      const bid = parseFloat(data.bidPrice)
      const ask = parseFloat(data.askPrice)

      if (bid <= 0 || ask <= 0) return null

      const mid = (bid + ask) / 2
      const spreadBps = ((ask - bid) / mid) * 10000

      return { bid, ask, spreadBps }
    } catch (error) {
      console.error(`Failed to fetch book ticker for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Fetch open interest (optional, may not be available)
   */
  async getOpenInterest(symbol: string): Promise<number | null> {
    try {
      const url = `${this.baseUrl}/fapi/v1/openInterest?symbol=${symbol}`
      const response = await fetch(url)
      const data = await response.json()

      return parseFloat(data.openInterest) || null
    } catch (error) {
      // Open interest endpoint may not be available, this is OK
      console.debug(`Open interest not available for ${symbol}`)
      return null
    }
  }

  /**
   * Batch fetch for multiple symbols (with rate limiting)
   */
  async batchFetch<T>(
    symbols: string[],
    fetchFn: (symbol: string) => Promise<T>,
    concurrency: number = 5
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    for (let i = 0; i < symbols.length; i += concurrency) {
      const batch = symbols.slice(i, i + concurrency)
      const promises = batch.map(async (symbol) => {
        try {
          const result = await fetchFn(symbol)
          results.set(symbol, result)
        } catch (error) {
          console.error(`Batch fetch failed for ${symbol}:`, error)
        }
      })

      await Promise.all(promises)

      // Small delay between batches to be respectful
      if (i + concurrency < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }

  /**
   * Health check for market data availability
   */
  async healthCheck(): Promise<{ available: boolean; latency: number; error?: string }> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.baseUrl}/fapi/v1/time`)
      const latency = Date.now() - startTime

      if (!response.ok) {
        return { available: false, latency, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      const serverTime = data.serverTime
      const timeDiff = Math.abs(serverTime - Date.now())

      if (timeDiff > 5000) { // 5 second time difference
        return { available: false, latency, error: `Time sync issue: ${timeDiff}ms` }
      }

      return { available: true, latency }
    } catch (error) {
      const latency = Date.now() - startTime
      return { available: false, latency, error: (error as Error).message }
    }
  }
}
