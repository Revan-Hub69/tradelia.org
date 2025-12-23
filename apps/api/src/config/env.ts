import { z } from 'zod'

// Environment schema validation
const envSchema = z.object({
  // Required
  EXCHANGE_ENV: z.enum(['testnet', 'live']),
  BINANCE_API_KEY: z.string().min(1),
  BINANCE_API_SECRET: z.string().min(1),
  TRACK_SYMBOLS: z.string().min(1),
  DATABASE_URL: z.string().url(),

  // Optional with defaults
  POSITION_MODE: z.enum(['oneway', 'hedge']).default('oneway'),
  ENABLE_INCOME_TRACKING: z.coerce.boolean().default(false),
  TRADING_ENABLED: z.coerce.boolean().default(false),
  MAX_CONCURRENT_POSITIONS: z.coerce.number().int().positive().default(2),
  DAILY_MAX_LOSS_PCT: z.coerce.number().positive().default(1.5),
  COOLDOWN_AFTER_LOSS_MIN: z.coerce.number().int().nonnegative().default(15),
  ERROR_STORM_FAIL: z.coerce.number().int().positive().default(8),
  BINANCE_CB_OPEN_SEC: z.coerce.number().int().positive().default(30),
  BINANCE_REST_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),
  BINANCE_RETRY_MAX: z.coerce.number().int().nonnegative().default(3),
  BINANCE_RETRY_BASE_MS: z.coerce.number().int().positive().default(250),
  EMERGENCY_SL_BPS: z.coerce.number().int().positive().default(80),

  // Fastify/Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  TRUST_PROXY: z.coerce.boolean().default(false),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute
})

// Parse and validate environment variables
const envParse = envSchema.safeParse(process.env)

if (!envParse.success) {
  console.error('❌ Environment validation failed:')
  console.error(envParse.error.format())
  process.exit(1)
}

export const env = envParse.data

// Derived constants
export const BINANCE_BASE_URLS = {
  live: {
    rest: 'https://fapi.binance.com',
    ws: 'wss://fstream.binance.com',
  },
  testnet: {
    rest: 'https://testnet.binancefuture.com',
    ws: 'wss://stream.binancefuture.com',
  },
} as const

export const TRACKED_SYMBOLS = env.TRACK_SYMBOLS.split(',').map(s => s.trim())

// Type exports
export type Env = typeof env
export type ExchangeEnv = Env['EXCHANGE_ENV']
export type PositionMode = Env['POSITION_MODE']
