import { z } from 'zod'

// Kline data structure (reuse from screener)
export interface KlineData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Market Regime types
export type MarketRegime = 'TREND_UP' | 'TREND_DOWN' | 'RANGE' | 'VOLATILE_BREAKOUT' | 'DEAD'

export interface MarketRegimeResult {
  regime: MarketRegime
  confidence: number // 0-100
  allowedDirections: ('LONG' | 'SHORT')[]
  signals: RegimeSignal[]
  timestamp: Date
}

export interface RegimeSignal {
  indicator: string
  value: number
  threshold: number
  strength: number // -1 to 1
}

// Setup Detection types
export type SetupType = 'SQUEEZE' | 'BREAKOUT' | 'FADE' | 'VWAP'

export interface TradeSetup {
  symbol: string
  direction: 'LONG' | 'SHORT'
  setupType: SetupType
  entryZone: {
    min: number
    max: number
  }
  invalidation: number
  confidence: number // 0-100
  metadata: Record<string, any>
  timestamp: Date
}

// Symbol Screener types (different from PROMPT-2 - simpler)
export interface SymbolFilter {
  symbol: string
  volume24h: number
  spreadBps: number
  volatility: number
  score: number
  passed: boolean
}

// Position Manager types
export interface PositionState {
  symbol: string
  side: 'LONG' | 'SHORT'
  entryPrice: number
  currentPrice: number
  size: number
  pnl: number
  pnlPct: number
  slPrice?: number
  tpPrice?: number
  trailingActivated: boolean
  metadata: Record<string, any>
}

export interface PositionAction {
  type: 'MOVE_SL' | 'TRAIL_SL' | 'CLOSE_POSITION' | 'ADD_TP'
  symbol: string
  newSlPrice?: number
  newTpPrice?: number
  reason: string
  confidence: number
}

// Signal Bus types
export interface OrderIntent {
  symbol: string
  planId: string
  side: 'LONG' | 'SHORT'
  quantity: string
  slPrice?: string
  tpPrice?: string
  entryType: 'MARKET' | 'LIMIT'
  entryPrice?: string
  positionSide?: 'LONG' | 'SHORT'
  metadata?: Record<string, any>
}

export interface StrategySignal {
  id: string
  timestamp: Date
  type: 'ENTRY' | 'EXIT' | 'MODIFY'
  intent: OrderIntent
  reason: string
  confidence: number
  regime: MarketRegimeResult
  setup?: TradeSetup
}

// Strategy Configuration
export interface StrategyConfig {
  enabled: boolean
  regimeThreshold: number // confidence threshold for DEAD regime
  setupMinConfidence: number // minimum confidence for setup execution
  maxConcurrentPositions: number
  riskPerTrade: number // percentage of capital
  slBufferBps: number // stop loss buffer in basis points
  tpMultiplier: number // take profit R-multiple
  trailingEnabled: boolean
  trailingActivationR: number // R level to activate trailing
  trailingDistanceBps: number // trailing distance in basis points
}

// API Schemas
export const StrategyConfigSchema = z.object({
  enabled: z.boolean().optional(),
  regimeThreshold: z.number().min(0).max(100).optional(),
  setupMinConfidence: z.number().min(0).max(100).optional(),
  maxConcurrentPositions: z.number().int().positive().optional(),
  riskPerTrade: z.number().positive().optional(),
  slBufferBps: z.number().int().positive().optional(),
  tpMultiplier: z.number().positive().optional(),
  trailingEnabled: z.boolean().optional(),
  trailingActivationR: z.number().positive().optional(),
  trailingDistanceBps: z.number().int().positive().optional(),
})

// Strategy Status
export interface StrategyStatus {
  isRunning: boolean
  currentRegime?: MarketRegimeResult
  activePositions: number
  pendingSignals: number
  lastUpdate: Date
  errors: string[]
}

// Constants
export const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  enabled: false,
  regimeThreshold: 60, // 60% confidence to consider DEAD
  setupMinConfidence: 70, // 70% confidence minimum for execution
  maxConcurrentPositions: 2,
  riskPerTrade: 0.005, // 0.5% per trade
  slBufferBps: 80, // 80 bps buffer
  tpMultiplier: 2.0, // 2R target
  trailingEnabled: true,
  trailingActivationR: 1.0, // Activate after 1R
  trailingDistanceBps: 50, // 50 bps trailing distance
}

export const REGIME_DEFINITIONS = {
  TREND_UP: {
    name: 'Bull Trend',
    allowedDirections: ['LONG'] as const,
    indicators: ['funding_bias', 'oi_trend', 'returns_15m', 'vwap_slope']
  },
  TREND_DOWN: {
    name: 'Bear Trend',
    allowedDirections: ['SHORT'] as const,
    indicators: ['funding_bias', 'oi_trend', 'returns_15m', 'vwap_slope']
  },
  RANGE: {
    name: 'Sideways Range',
    allowedDirections: ['LONG', 'SHORT'] as const,
    indicators: ['atr_compression', 'volume_stability', 'range_bounds']
  },
  VOLATILE_BREAKOUT: {
    name: 'High Volatility Breakout',
    allowedDirections: ['LONG', 'SHORT'] as const,
    indicators: ['atr_expansion', 'volume_spike', 'breakout_confirmation']
  },
  DEAD: {
    name: 'No Trading - Dead Market',
    allowedDirections: [] as const,
    indicators: ['low_volume', 'extreme_funding', 'btc_volatility']
  }
} as const
