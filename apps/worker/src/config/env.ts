import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.string().default('info'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  WORKER_ID: z.string().min(1, 'WORKER_ID is required'),
  JOB_POLL_MS: z.coerce.number().int().min(250).default(1500),

  BINANCE_ENV: z.enum(['testnet', 'live']).default('testnet'),
  BINANCE_FSTREAM_WS: z.string().optional(),
  BINANCE_API_KEY: z.string().optional(),
  BINANCE_API_SECRET: z.string().optional(),

  LOB_SYMBOLS_MODE: z.enum(['universe', 'manual']).default('universe'),
  LOB_MANUAL_SYMBOLS: z.string().optional(),
  LOB_FEATURE_EMIT_MS: z.coerce.number().int().min(250).default(1000),
  LOB_SNAPSHOT_INTERVAL_MS: z.coerce.number().int().min(1000).default(30000)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const env = parsed.data;
