import { z } from 'zod'

// Screener types
export type MtfGateResult = 'PASS' | 'REVIEW' | 'FAIL'

export interface SymbolCandidate {
  symbol: string
  quoteVolume24h: number
  isTradable: boolean
}

export interface HardVetoResult {
  symbol: string
  vetoed: boolean
  spreadBps?: number
  depthUsd?: number
  reasons: string[]
}

export interface SymbolScores {
  symbol: string
  lqs: number        // Liquidity Quality Score (0-100)
  vos: number        // Volatility Opportunity Score (0-100)
  dfs: number        // Derivatives Flow Score (0-100)
  mes: number        // Microstructure Edge Score (0-100)
  mtfGate: MtfGateResult
  totalScore: number // Weighted total (0-100)
  vetoed: boolean
  reasons: string[]
}

export interface ScreenerSnapshot {
  timestamp: Date
  env: string
  candidatesCount: number
  vettedCount: number
  topKCount: number
  scores: SymbolScores[]
  topK: Array<{
    symbol: string
    score: number
    rank: number
  }>
  wsHealth: {
    lagMs: number
    gapMs: number
    degraded: boolean
  }
}

export interface KlineData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface OrderBookLevel {
  price: number
  quantity: number
}

export interface OrderBookData {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  timestamp: number
}

export interface TickerData {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  bidQty: string
  askPrice: string
  askQty: string
  openPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
}

// API Schemas
export const ScreenerConfigSchema = z.object({
  topK: z.number().int().positive().optional(),
  refreshSec: z.number().int().positive().optional(),
  maxTracked: z.number().int().positive().optional(),
  thresholds: z.record(z.string(), z.unknown()).optional(),
  mtfGatePolicy: z.enum(['PASS', 'REVIEW', 'FAIL']).optional(),
  disableOthers: z.boolean().optional(),
})

export const UniverseApplySchema = z.object({
  disableOthers: z.boolean().default(false),
})

// Math utilities types
export interface ZScoreResult {
  value: number
  zscore: number
  percentile: number
}

export interface AtrResult {
  atr: number
  tr: number[]
  ema: number[]
}

// Constants
export const MTF_TIMEFRAMES = ['1m', '5m', '15m'] as const
export const SCORE_WEIGHTS = {
  LQS: 0.35,
  VOS: 0.25,
  DFS: 0.20,
  MES: 0.20,
} as const

export const DEFAULT_THRESHOLDS = {
  minAtrPct1m: 0.001,    // 0.1% minimum ATR for 1m
  maxAtrPct5m: 0.05,     // 5% maximum ATR for 5m
  targetAtrPct: 0.02,    // 2% target ATR for scoring
  impulseZThreshold: 2.0, // Z-score threshold for impulse detection
  volZThreshold: 1.5,    // Z-score threshold for volume spikes
} as const
