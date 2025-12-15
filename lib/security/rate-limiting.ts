/**
 * Rate Limiting per API
 *
 * Implementa rate limiting per prevenire abuse e proteggere risorse
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// In-memory store (in produzione usare Redis)
const requestStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter semplice in-memory
 * Per produzione, usare Redis o Upstash
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / config.windowMs)}`;

  const current = requestStore.get(key);

  if (!current || current.resetTime < now) {
    // Nuova finestra
    requestStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  if (current.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      reset: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000),
    };
  }

  // Incrementa contatore
  current.count++;
  requestStore.set(key, current);

  return {
    success: true,
    remaining: config.maxRequests - current.count,
    reset: current.resetTime,
  };
}

/**
 * Pulisce store vecchio (evita memory leak)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (value.resetTime < now) {
      requestStore.delete(key);
    }
  }
}

// Cleanup ogni 5 minuti
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
