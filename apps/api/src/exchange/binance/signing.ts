import crypto from 'crypto'

/**
 * Create HMAC SHA256 signature for Binance API
 */
export function createSignature(queryString: string, apiSecret: string): string {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex')
}

/**
 * Build signed request URL with timestamp and signature
 */
export function buildSignedUrl(
  baseUrl: string,
  endpoint: string,
  params: Record<string, any>,
  apiSecret: string
): string {
  const timestamp = Date.now()
  const recvWindow = 5000

  // Build query parameters
  const queryParams = new URLSearchParams({
    ...params,
    timestamp: timestamp.toString(),
    recvWindow: recvWindow.toString(),
  })

  const queryString = queryParams.toString()
  const signature = createSignature(queryString, apiSecret)

  return `${baseUrl}${endpoint}?${queryString}&signature=${signature}`
}

/**
 * Get current server time offset from Binance
 */
export class TimeSync {
  private static offset: number = 0
  private static lastSync: number = 0
  private static readonly SYNC_INTERVAL = 60000 // 1 minute

  static async syncTime(baseUrl: string): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/fapi/v1/time`)
      const data = await response.json()

      if (data.serverTime) {
        const localTime = Date.now()
        this.offset = data.serverTime - localTime
        this.lastSync = localTime
      }
    } catch (error) {
      console.warn('Failed to sync time with Binance:', error)
    }
  }

  static getTimestamp(): number {
    const now = Date.now()

    // Re-sync if needed
    if (now - this.lastSync > this.SYNC_INTERVAL) {
      // Note: This is async, but for simplicity we'll use cached offset
      // In production, call syncTime() periodically
    }

    return now + this.offset
  }

  static getOffset(): number {
    return this.offset
  }
}

/**
 * Build query string for GET requests
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.append(key, String(value))
    }
  }

  return query.toString()
}

/**
 * Add required headers for signed requests
 */
export function getSignedHeaders(apiKey: string): Record<string, string> {
  return {
    'X-MBX-APIKEY': apiKey,
    'Content-Type': 'application/json',
  }
}

/**
 * Add required headers for public requests
 */
export function getPublicHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  }
}
