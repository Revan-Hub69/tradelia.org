import { env } from '../../config/env'
import { getBaseUrls, isRateLimitError, isRetryableError } from './constants'
import { buildSignedUrl, getSignedHeaders, getPublicHeaders, TimeSync } from './signing'

export class BinanceRestClient {
  private baseUrl: string

  constructor(exchangeEnv: 'testnet' | 'live' = env.EXCHANGE_ENV) {
    this.baseUrl = getBaseUrls(exchangeEnv).rest
  }

  /**
   * Initialize client (sync time)
   */
  async initialize(): Promise<void> {
    await TimeSync.syncTime(this.baseUrl)
  }

  /**
   * Make authenticated request with retry logic and rate limiting
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {},
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    apiKey?: string,
    apiSecret?: string
  ): Promise<T> {
    const maxRetries = env.BINANCE_RETRY_MAX
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let url: string
        let headers: Record<string, string>
        let body: string | undefined

        if (apiKey && apiSecret) {
          // Signed request - params in query string with signature
          url = buildSignedUrl(this.baseUrl, endpoint, params, apiSecret)
          headers = getSignedHeaders(apiKey)
        } else {
          // Public request
          if (method === 'GET') {
            const queryString = Object.keys(params).length > 0
              ? `?${new URLSearchParams(params as any)}`
              : ''
            url = `${this.baseUrl}${endpoint}${queryString}`
          } else {
            // POST/PUT/DELETE public requests - params in body
            url = `${this.baseUrl}${endpoint}`
            body = JSON.stringify(params)
          }
          headers = getPublicHeaders()
        }

        // Implement timeout manually since fetch doesn't support it
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), env.BINANCE_REST_TIMEOUT_MS)

        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : env.BINANCE_RETRY_BASE_MS
          console.warn(`Rate limited, waiting ${waitMs}ms before retry`)
          await new Promise(resolve => setTimeout(resolve, waitMs))
          continue
        }

        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ msg: 'Unknown error' }))

          // Check if retryable
          if (isRetryableError(response.status) && attempt < maxRetries) {
            const waitMs = env.BINANCE_RETRY_BASE_MS * Math.pow(2, attempt)
            console.warn(`Retryable error (${response.status}), waiting ${waitMs}ms before retry:`, errorData)
            await new Promise(resolve => setTimeout(resolve, waitMs))
            continue
          }

          throw new Error(`HTTP ${response.status}: ${errorData.msg || 'Unknown error'}`)
        }

        const data = await response.json()
        return data as T

      } catch (error) {
        lastError = error as Error

        if (attempt < maxRetries && isRetryableError(-1)) { // Network errors
          const waitMs = env.BINANCE_RETRY_BASE_MS * Math.pow(2, attempt)
          console.warn(`Network error, retrying in ${waitMs}ms:`, error)
          await new Promise(resolve => setTimeout(resolve, waitMs))
          continue
        }

        break
      }
    }

    throw lastError || new Error('Request failed after all retries')
  }

  // Public endpoints
  async getExchangeInfo(): Promise<any> {
    return this.makeRequest('/fapi/v1/exchangeInfo')
  }

  async getBookTicker(symbol: string): Promise<any> {
    return this.makeRequest('/fapi/v1/ticker/bookTicker', { symbol })
  }

  // Signed endpoints (require API credentials)
  async getOpenOrders(symbol: string, apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v1/openOrders', { symbol }, 'GET', apiKey, apiSecret)
  }

  async cancelAllOrders(symbol: string, apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v1/allOpenOrders', { symbol }, 'DELETE', apiKey, apiSecret)
  }

  async cancelOrder(symbol: string, orderId: string, apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v1/order', { symbol, orderId }, 'DELETE', apiKey, apiSecret)
  }

  async cancelOrderByClientId(symbol: string, origClientOrderId: string, apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v1/order', { symbol, origClientOrderId }, 'DELETE', apiKey, apiSecret)
  }

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
    const params: any = {
      symbol,
      side,
      type,
      quantity,
    }

    if (price) params.price = price
    if (stopPrice) params.stopPrice = stopPrice
    if (reduceOnly !== undefined) params.reduceOnly = reduceOnly
    if (timeInForce) params.timeInForce = timeInForce
    if (positionSide) params.positionSide = positionSide

    return this.makeRequest('/fapi/v1/order', params, 'POST', apiKey, apiSecret)
  }

  async getPositionRisk(apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v2/positionRisk', {}, 'GET', apiKey, apiSecret)
  }

  async setLeverage(symbol: string, leverage: number, apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v1/leverage', { symbol, leverage }, 'POST', apiKey, apiSecret)
  }

  async setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSSED', apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v1/marginType', { symbol, marginType }, 'POST', apiKey, apiSecret)
  }

  // Optional PNL tracking (PATCH #2)
  async getAccount(apiKey: string, apiSecret: string): Promise<any> {
    return this.makeRequest('/fapi/v2/account', {}, 'GET', apiKey, apiSecret)
  }

  async getIncome(
    symbol?: string,
    incomeType?: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
    apiKey?: string,
    apiSecret?: string
  ): Promise<any> {
    const params: any = {}
    if (symbol) params.symbol = symbol
    if (incomeType) params.incomeType = incomeType
    if (startTime) params.startTime = startTime
    if (endTime) params.endTime = endTime
    if (limit) params.limit = limit

    return this.makeRequest('/fapi/v1/income', params, 'GET', apiKey, apiSecret)
  }
}
