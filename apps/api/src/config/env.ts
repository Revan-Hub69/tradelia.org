import { z } from 'zod'

// Safe environment logging (without exposing secrets)
console.log('[env] EXCHANGE_ENV=', process.env.EXCHANGE_ENV)
console.log('[env] TRACK_SYMBOLS=', process.env.TRACK_SYMBOLS)
console.log('[env] hasKey=', Boolean(process.env.BINANCE_API_KEY))
console.log('[env] hasSecret=', Boolean(process.env.BINANCE_API_SECRET))
console.log('[env] hasDb=', Boolean(process.env.DATABASE_URL))
console.log('[env] hasSupabaseUrl=', Boolean(process.env.SUPABASE_URL))
console.log('[env] hasSupabaseKey=', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY))

// Environment schema validation
const envSchema = z.object({
  // Required
  EXCHANGE_ENV: z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase() : v),
    z.enum(['testnet', 'live'])
  ).default('testnet'),

  // Optional - will be provided by user via frontend (stored in DB)
  BINANCE_API_KEY: z.string().optional(),
  BINANCE_API_SECRET: z.string().optional(),

  TRACK_SYMBOLS: z.string().min(1).default('BTCUSDT,ETHUSDT'),
  DATABASE_URL: z.string().url().optional(),

  // Supabase (for auth and database)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  SUPABASE_ISSUER: z.string().optional(),
  SUPABASE_AUDIENCE: z.string().optional(),

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

  // Screener (PROMPT-2)
  SCREENER_ENABLED: z.coerce.boolean().default(true),
  SCREENER_TOP_K: z.coerce.number().int().positive().default(20),
  SCREENER_REFRESH_SEC: z.coerce.number().int().positive().default(60),
  MAX_SYMBOLS_TRACKED: z.coerce.number().int().positive().default(60),
  SCREEN_UNIVERSE_MODE: z.enum(['auto', 'static']).default('auto'),
  STATIC_SYMBOLS: z.string().default('BTCUSDT,ETHUSDT'),
  MARKET_DATA_ENV: z.enum(['live', 'testnet']).default('live'),
  MTF_TF_LIST: z.string().default('1m,5m,15m'),
  MIN_DAILY_QUOTE_VOL_USD: z.coerce.number().positive().default(50000000),
  MAX_SPREAD_BPS: z.coerce.number().positive().default(12),
  MIN_DEPTH_USD_TOPN: z.coerce.number().positive().default(200000),
  ORDERBOOK_LEVELS: z.coerce.number().int().positive().default(50),
  WS_LAG_WARN_MS: z.coerce.number().int().positive().default(800),
  WS_LAG_FAIL_MS: z.coerce.number().int().positive().default(1500),
  BOOK_GAP_FAIL_MS: z.coerce.number().int().positive().default(2000),

  // Fastify/Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  TRUST_PROXY: z.coerce.boolean().default(false),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute

  // Email service (Brevo)
  BREVO_API_KEY: z.string().min(1).optional(),

  // JWT verification
  VERIFY_JWT_STRICT: z.coerce.boolean().default(true),
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
