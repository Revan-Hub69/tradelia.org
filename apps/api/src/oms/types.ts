import { z } from 'zod'
import { env } from '../config/env'

// Core types
export type ExchangeEnv = typeof env.EXCHANGE_ENV
export type PositionMode = typeof env.POSITION_MODE

export type OrderSide = 'BUY' | 'SELL'
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_MARKET' | 'TAKE_PROFIT_MARKET'
export type TimeInForce = 'GTC' | 'IOC' | 'FOK'
export type PositionSide = 'LONG' | 'SHORT'

export type OrderLeg = 'ENTRY' | 'SL' | 'TP1' | 'TP2' | 'FLAT' | 'EMERGENCY_SL'
export type OrderStatus = 'PENDING' | 'PLACED' | 'FILLED' | 'CANCELED' | 'REJECTED'
export type PositionStatus = 'OPEN' | 'CLOSED'

// API request schemas
export const OrderIntentSchema = z.object({
  symbol: z.string().min(1),
  planId: z.string().min(1),
  side: z.enum(['LONG', 'SHORT', 'BUY', 'SELL']),
  quantity: z.string().min(1),
  slPrice: z.string().optional(),
  tpPrice: z.string().optional(),
  entryType: z.enum(['MARKET', 'LIMIT']).default('MARKET'),
  entryPrice: z.string().optional(),
  positionSide: z.enum(['LONG', 'SHORT']).optional(),
})

export const FlattenRequestSchema = z.object({
  symbol: z.string().min(1),
  positionSide: z.enum(['LONG', 'SHORT']).optional(),
})

export const RiskConfigSchema = z.object({
  tradingEnabled: z.boolean().optional(),
  maxPositions: z.number().int().positive().optional(),
  dailyLossLimitPct: z.number().positive().optional(),
})

// Internal types
export type OrderIntent = z.infer<typeof OrderIntentSchema>
export type FlattenRequest = z.infer<typeof FlattenRequestSchema>
export type RiskConfig = z.infer<typeof RiskConfigSchema>

// Binance API types
export interface BinanceOrder {
  symbol: string
  orderId: string
  clientOrderId: string
  price: string
  origQty: string
  executedQty: string
  status: string
  timeInForce: string
  type: string
  side: string
  stopPrice?: string
  icebergQty?: string
  time: number
  updateTime: number
  isWorking: boolean
  workingTime: number
  origQuoteOrderQty: string
  selfTradePreventionMode: string
  reduceOnly?: boolean
  positionSide?: string
}

export interface BinancePosition {
  symbol: string
  positionAmt: string
  entryPrice: string
  markPrice: string
  unRealizedProfit: string
  liquidationPrice: string
  leverage: string
  maxNotionalValue: string
  marginType: string
  isolatedMargin: string
  isAutoAddMargin: string
  positionSide: string
  notional: string
  isolatedWallet: string
  updateTime: number
}

export interface BinanceExchangeInfo {
  timezone: string
  serverTime: number
  rateLimits: any[]
  exchangeFilters: any[]
  symbols: BinanceSymbol[]
}

export interface BinanceSymbol {
  symbol: string
  status: string
  baseAsset: string
  quoteAsset: string
  marginAsset: string
  pricePrecision: number
  quantityPrecision: number
  baseAssetPrecision: number
  quotePrecision: number
  filters: BinanceFilter[]
}

export interface BinanceFilter {
  filterType: string
  minPrice?: string
  maxPrice?: string
  tickSize?: string
  minQty?: string
  maxQty?: string
  stepSize?: string
  minNotional?: string
  notional?: string  // For MIN_NOTIONAL filter
  applyToMarket?: boolean
  avgPriceMins?: number
}

// OMS internal types
export interface ClientOrderIdComponents {
  env: ExchangeEnv
  symbol: string
  planId: string
  leg: OrderLeg
  seq: number
}

export interface OrderPlacement {
  clientOrderId: string
  symbol: string
  side: OrderSide
  type: OrderType
  quantity: string
  price?: string
  stopPrice?: string
  reduceOnly?: boolean
  timeInForce?: TimeInForce
  positionSide?: PositionSide
}

// Engine state
export interface EngineState {
  isRunning: boolean
  lastReconcileTs: Date | null
  reconcileErrors: number
  totalOrders: number
  activePositions: number
}

// Risk state
export interface RiskCheck {
  canEnter: boolean
  reason: string
  availableSlots: number
  cooldownRemainingSec: number
}

export interface KillTrigger {
  active: boolean
  reason: string
  triggeredAt: Date
  actionsTaken: string[]
}

// Reconcile result
export interface ReconcileResult {
  symbol: string
  positionsUpdated: number
  ordersPlaced: number
  ordersCanceled: number
  errors: string[]
}
