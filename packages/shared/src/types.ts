import { z } from 'zod';

// Enums
export const TradeSide = z.enum(['LONG', 'SHORT']);
export const TradeMode = z.enum(['DEMO_STRESS', 'DEMO_REALISTIC', 'LIVE_MICRO', 'LIVE_SCALE']);
export const ScreenerProfile = z.enum(['A', 'B']);
export const Environment = z.enum(['testnet', 'live']);
export const FundingMode = z.enum(['normal', 'tight', 'contrarian']);
export const ExecutionMode = z.enum(['confirm', 'auto']);
export const SessionStatus = z.enum(['RUNNING', 'STOPPED']);
export const PlanStatus = z.enum(['PENDING', 'EXECUTED', 'EXPIRED', 'CANCELLED']);

// Entry schema
export const EntrySchema = z.object({
  type: z.literal('MARKET'),
  price: z.number().positive()
});

// Risk schema
export const RiskSchema = z.object({
  sl: z.number().positive(),
  tp1: z.number().positive(),
  tp2: z.number().positive(),
  trail: z.string() // e.g., "EMA20_1m"
});

// Sizing schema
export const SizingSchema = z.object({
  qty: z.number().positive(),
  leverage: z.number().min(1).max(500),
  marginType: z.enum(['ISOLATED', 'CROSS'])
});

// Gates schema
export const GatesSchema = z.object({
  setup_pass: z.boolean(),
  micro_pass: z.boolean(),
  funding_mode: FundingMode,
  expires_at: z.number() // timestamp
});

// Metrics schema
export const MetricsSchema = z.object({
  obi5: z.number(),
  obi20: z.number(),
  delta_fast: z.number(),
  delta_slow: z.number(),
  spread: z.number().positive(),
  atrp15m: z.number().positive(),
  funding: z.number()
});

// TradePlan v1.0 - Contratto immutabile
export const TradePlanSchema = z.object({
  plan_id: z.string().cuid(),
  session_id: z.string().cuid(),
  env: Environment,
  mode: TradeMode,
  screener_profile: ScreenerProfile,
  symbol: z.string(),
  side: TradeSide,
  entry: EntrySchema,
  risk: RiskSchema,
  sizing: SizingSchema,
  gates: GatesSchema,
  why: z.array(z.string()),
  metrics: MetricsSchema
});

// Session schema
export const SessionSchema = z.object({
  mode: TradeMode,
  screener_profile: ScreenerProfile,
  execution_mode: ExecutionMode,
  binance_env: Environment
});

// Market data provider interface
export const KlineSchema = z.object({
  openTime: z.number(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string(),
  volume: z.string(),
  closeTime: z.number()
});

export const DepthSchema = z.object({
  bids: z.array(z.tuple([z.string(), z.string()])),
  asks: z.array(z.tuple([z.string(), z.string()])),
  lastUpdateId: z.number()
});

export const FundingRateSchema = z.object({
  symbol: z.string(),
  fundingRate: z.string(),
  fundingTime: z.number()
});

// Signal candidate schema
export const SignalCandidateSchema = z.object({
  symbol: z.string(),
  side: TradeSide,
  timestamp: z.number(),
  features: z.record(z.string(), z.number()),
  funding_mode_pre: FundingMode
});

// FeatureSnapshot schema (persisted by collectors)
export const FeatureSnapshotSchema = z.object({
  snapshot_id: z.string().uuid(),
  exchange: z.string().default('binance'),
  venue: z.string().default('futures_usdt'),
  symbol: z.string(),
  ts: z.string(), // ISO timestamp
  features: z.record(z.string(), z.any()),
  quality: z.record(z.string(), z.any()),
  source_meta: z.record(z.string(), z.any()).optional().default({}),
  created_at: z.string().optional()
});

// Export types
export type TradePlan = z.infer<typeof TradePlanSchema>;
export type SessionConfig = z.infer<typeof SessionSchema>;
export type Kline = z.infer<typeof KlineSchema>;
export type Depth = z.infer<typeof DepthSchema>;
export type FundingRate = z.infer<typeof FundingRateSchema>;
export type SignalCandidate = z.infer<typeof SignalCandidateSchema>;
export type FeatureSnapshot = z.infer<typeof FeatureSnapshotSchema>;

// Constants
export const MODE_CONFIGS = {
  DEMO_STRESS: { leverage_cap: 500, risk_pct: 0.02 },
  DEMO_REALISTIC: { leverage_cap: 50, risk_pct: 0.01 },
  LIVE_MICRO: { leverage_cap: 20, risk_pct: 0.005 },
  LIVE_SCALE: { leverage_cap: 50, risk_pct: 0.0075 }
} as const;

export const TIER_CONFIGS = {
  TIER1: { atr_min: 0.002, atr_max: 0.025, spread_max: 0.0008 },
  TIER2: { atr_min: 0.004, atr_max: 0.045, spread_max: 0.0012 },
  TIER3: { atr_min: 0.006, atr_max: 0.06, spread_max: 0.0015 }
} as const;

export const FUNDING_THRESHOLDS = {
  WARN: 0.0002,
  EXTREME: 0.0005
} as const;
