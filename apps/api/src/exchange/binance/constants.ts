import { BINANCE_BASE_URLS } from '../../config/env'

// Binance Futures API endpoints
export const BINANCE_ENDPOINTS = {
  // Public endpoints
  EXCHANGE_INFO: '/fapi/v1/exchangeInfo',
  TIME: '/fapi/v1/time',
  BOOK_TICKER: '/fapi/v1/ticker/bookTicker',

  // Signed endpoints
  ORDER: '/fapi/v1/order',
  CANCEL_ORDER: '/fapi/v1/order',
  CANCEL_ALL_ORDERS: '/fapi/v1/allOpenOrders',
  OPEN_ORDERS: '/fapi/v1/openOrders',
  POSITION_RISK: '/fapi/v2/positionRisk',
  LEVERAGE: '/fapi/v1/leverage',
  MARGIN_TYPE: '/fapi/v1/marginType',

  // Optional for PNL tracking
  ACCOUNT: '/fapi/v2/account',
  INCOME: '/fapi/v1/income',
} as const

// HTTP status codes
export const BINANCE_HTTP_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const

// Binance error codes
export const BINANCE_ERROR_CODES = {
  // Rate limiting
  TOO_MANY_REQUESTS: -1003,
  WAY_TOO_MANY_REQUESTS: -1004,
  REQUEST_WEIGHT_EXCEEDED: -1001,
  IP_BANNED: 418,

  // Order errors
  UNKNOWN_ORDER: -2013,
  ORDER_NOT_FOUND: -2011,
  INVALID_ORDER: -2010,

  // Account errors
  INSUFFICIENT_BALANCE: -2010,
  MARGIN_INSUFFICIENT: -2019,

  // Symbol errors
  SYMBOL_NOT_TRADING: -1121,
  INVALID_SYMBOL: -1120,
} as const

// Order defaults
export const ORDER_DEFAULTS = {
  TIME_IN_FORCE: 'GTC' as const,
  RECV_WINDOW: 5000,
  WORKING_TYPE: 'MARK_PRICE' as const,
} as const

// Position modes
export const POSITION_MODES = {
  ONEWAY: 'oneway',
  HEDGE: 'hedge',
} as const

// Margin types
export const MARGIN_TYPES = {
  ISOLATED: 'ISOLATED',
  CROSSED: 'CROSSED',
} as const

// Helper functions
export function getBaseUrls(env: 'testnet' | 'live') {
  return BINANCE_BASE_URLS[env]
}

export function isRateLimitError(code: number): boolean {
  return code === BINANCE_HTTP_CODES.TOO_MANY_REQUESTS ||
         code === BINANCE_ERROR_CODES.IP_BANNED ||
         code === BINANCE_ERROR_CODES.TOO_MANY_REQUESTS ||
         code === BINANCE_ERROR_CODES.WAY_TOO_MANY_REQUESTS
}

export function isRetryableError(code: number): boolean {
  return isRateLimitError(code) ||
         code === BINANCE_HTTP_CODES.INTERNAL_ERROR ||
         code === BINANCE_ERROR_CODES.UNKNOWN_ORDER
}
