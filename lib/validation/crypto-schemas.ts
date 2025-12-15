/**
 * Zod Schemas per validazione input Crypto APIs
 */

import { z } from 'zod';

/**
 * Simboli crypto supportati
 */
export const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL'] as const;

export const CryptoSymbolSchema = z.enum(CRYPTO_SYMBOLS).default('BTC');

/**
 * Schema per query params order book
 */
export const OrderBookQuerySchema = z.object({
  symbol: CryptoSymbolSchema,
  explanation: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
  limit: z.coerce.number().int().min(1).max(5000).optional().default(100),
});

/**
 * Schema per query params imbalance
 */
export const ImbalanceQuerySchema = z.object({
  symbol: CryptoSymbolSchema,
  explanation: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
});

/**
 * Schema per query params futures
 */
export const FuturesQuerySchema = z.object({
  symbol: CryptoSymbolSchema,
  explanation: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
  period: z.enum(['1h', '4h', '24h']).optional().default('24h'),
});

/**
 * Schema per Binance WebSocket message
 */
export const BinanceWebSocketMessageSchema = z.object({
  stream: z.string(),
  data: z.object({
    s: z.string().optional(), // symbol
    b: z.array(z.tuple([z.string(), z.string()])).optional(), // bids [price, quantity]
    a: z.array(z.tuple([z.string(), z.string()])).optional(), // asks [price, quantity]
    u: z.number().optional(), // updateId
    E: z.number().optional(), // event time
    T: z.number().optional(), // trade time
    p: z.string().optional(), // price
    q: z.string().optional(), // quantity
    t: z.number().optional(), // trade ID
    m: z.boolean().optional(), // is buyer maker
  }),
});

/**
 * Type inference
 */
export type CryptoSymbol = z.infer<typeof CryptoSymbolSchema>;
export type OrderBookQuery = z.infer<typeof OrderBookQuerySchema>;
export type ImbalanceQuery = z.infer<typeof ImbalanceQuerySchema>;
export type FuturesQuery = z.infer<typeof FuturesQuerySchema>;
export type BinanceWebSocketMessage = z.infer<typeof BinanceWebSocketMessageSchema>;

