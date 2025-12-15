/**
 * Zod schemas per validazione input API crypto
 */

import { z } from "zod";

/**
 * Schema per query parameters dell'order book API
 */
export const OrderBookQuerySchema = z.object({
  symbol: z.string().min(1).max(10),
  explanation: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});

/**
 * Schema per query parameters generici crypto
 */
export const CryptoSymbolSchema = z.object({
  symbol: z.string().min(1).max(10),
});

/**
 * Schema per query parameters con timeframe
 */
export const CryptoTimeframeSchema = z.object({
  symbol: z.string().min(1).max(10),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]).optional(),
});
