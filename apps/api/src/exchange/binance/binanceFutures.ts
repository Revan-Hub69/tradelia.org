import { env } from '../../config/env'
import { BinanceRestClient } from './restClient'
import { SymbolFilters, roundQuantity, roundPrice, validateNotional } from './filters'
import { TimeSync } from './signing'
import { getBaseUrls } from './constants'

export class BinanceFuturesClient {
  private restClient: BinanceRestClient
  private initialized = false

  constructor(exchangeEnv: 'testnet' | 'live' = env.EXCHANGE_ENV) {
    this.restClient = new BinanceRestClient(exchangeEnv)
  }

  /**
   * Initialize client (load filters, sync time)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const baseUrls = getBaseUrls(env.EXCHANGE_ENV)

      // Load symbol filters
      await SymbolFilters.loadFilters(baseUrls.rest)

      // Initialize REST client (syncs time)
      await this.restClient.initialize()

      this.initialized = true
      console.log('✅ Binance Futures client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Binance client:', error)
      throw error
    }
  }

  /**
   * Ensure client is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  /**
   * Get exchange info
   */
  async getExchangeInfo(): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.getExchangeInfo()
  }

  /**
   * Get book ticker for symbol
   */
  async getBookTicker(symbol: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.getBookTicker(symbol)
  }

  /**
   * Place order with validation and rounding
   */
  async placeOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    type: 'MARKET' | 'LIMIT' | 'STOP_MARKET' | 'TAKE_PROFIT_MARKET',
    quantity: string,
    price?: string,
    stopPrice?: string,
    reduceOnly?: boolean,
    timeInForce?: 'GTC' | 'IOC' | 'FOK',
    positionSide?: 'LONG' | 'SHORT',
    apiKey?: string,
    apiSecret?: string
  ): Promise<any> {
    await this.ensureInitialized()

    // Validate and round quantity
    const symbolData = SymbolFilters.getFilters(symbol)
    if (!symbolData) {
      throw new Error(`Symbol ${symbol} not found or not trading`)
    }

    const lotSize = symbolData.filters.find(f => f.filterType === 'LOT_SIZE')
    const priceFilter = symbolData.filters.find(f => f.filterType === 'PRICE_FILTER')
    const minNotional = symbolData.filters.find(f => f.filterType === 'MIN_NOTIONAL')

    // Round quantity
    let roundedQty = quantity
    if (lotSize?.stepSize && lotSize?.minQty) {
      roundedQty = roundQuantity(quantity, lotSize.stepSize, lotSize.minQty)
    }

    // Round price
    let roundedPrice = price
    if (price && priceFilter?.tickSize) {
      roundedPrice = roundPrice(price, priceFilter.tickSize)
    }

    // Round stop price
    let roundedStopPrice = stopPrice
    if (stopPrice && priceFilter?.tickSize) {
      roundedStopPrice = roundPrice(stopPrice, priceFilter.tickSize)
    }

    // Validate min notional if price is provided
    if (roundedPrice && minNotional?.notional) {
      const isValid = validateNotional(roundedQty, roundedPrice, minNotional.notional)
      if (!isValid) {
        throw new Error(`Order value below minimum notional ${minNotional.notional}`)
      }
    }

    return this.restClient.placeOrder(
      symbol,
      side,
      type,
      roundedQty,
      roundedPrice,
      roundedStopPrice,
      reduceOnly,
      timeInForce,
      positionSide,
      apiKey,
      apiSecret
    )
  }

  /**
   * Get open orders
   */
  async getOpenOrders(symbol: string, apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.getOpenOrders(symbol, apiKey, apiSecret)
  }

  /**
   * Cancel order
   */
  async cancelOrder(symbol: string, orderId: string, apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.cancelOrder(symbol, orderId, apiKey, apiSecret)
  }

  /**
   * Cancel order by client ID
   */
  async cancelOrderByClientId(symbol: string, origClientOrderId: string, apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.cancelOrderByClientId(symbol, origClientOrderId, apiKey, apiSecret)
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(symbol: string, apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.cancelAllOrders(symbol, apiKey, apiSecret)
  }

  /**
   * Get position risk
   */
  async getPositionRisk(apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.getPositionRisk(apiKey, apiSecret)
  }

  /**
   * Set leverage
   */
  async setLeverage(symbol: string, leverage: number, apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.setLeverage(symbol, leverage, apiKey, apiSecret)
  }

  /**
   * Set margin type
   */
  async setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSSED', apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.setMarginType(symbol, marginType, apiKey, apiSecret)
  }

  /**
   * Get account info
   */
  async getAccount(apiKey: string, apiSecret: string): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.getAccount(apiKey, apiSecret)
  }

  /**
   * Get income history
   */
  async getIncome(
    symbol?: string,
    incomeType?: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
    apiKey?: string,
    apiSecret?: string
  ): Promise<any> {
    await this.ensureInitialized()
    return this.restClient.getIncome(symbol, incomeType, startTime, endTime, limit, apiKey, apiSecret)
  }

  /**
   * Check if symbol is valid and trading
   */
  isValidSymbol(symbol: string): boolean {
    const symbolData = SymbolFilters.getFilters(symbol)
    return symbolData?.status === 'TRADING' || false
  }

  /**
   * Get symbol filters
   */
  getSymbolFilters(symbol: string): any {
    return SymbolFilters.getFilters(symbol)
  }

  /**
   * Get current time offset
   */
  getTimeOffset(): number {
    return TimeSync.getOffset()
  }

  /**
   * Get synchronized timestamp
   */
  async getTimestamp(): Promise<number> {
    return TimeSync.getTimestamp()
  }
}
