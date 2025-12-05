/**
 * Rate Limiting Utility
 * 
 * Best Practice 2025:
 * - In-memory rate limiting (per deployment)
 * - Configurable limits per endpoint
 * - IP + User ID based
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

// In-memory store (per deployment instance)
// In produzione, usare Redis per multi-instance
const rateLimitStore: RateLimitStore = {};

/**
 * Check rate limit for a key
 * 
 * @param key - Unique identifier (IP + User ID + Endpoint)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const storeKey = key;
  
  // Clean expired entries (garbage collection)
  if (Object.keys(rateLimitStore).length > 10000) {
    Object.keys(rateLimitStore).forEach(k => {
      if (rateLimitStore[k].resetAt < now) {
        delete rateLimitStore[k];
      }
    });
  }

  const entry = rateLimitStore[storeKey];

  // New entry or expired
  if (!entry || entry.resetAt < now) {
    rateLimitStore[storeKey] = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Check limit
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(
  identifier: string,
  endpoint: string
): string {
  return `${identifier}:${endpoint}`;
}

/**
 * Rate limit configurations per endpoint
 */
export const RATE_LIMITS = {
  'widgets': { maxRequests: 100, windowMs: 60 * 1000 }, // 100 req/min
  'crypto-whale': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 req/min
  'crypto-depth': { maxRequests: 20, windowMs: 60 * 1000 }, // 20 req/min
  'crypto-movers': { maxRequests: 20, windowMs: 60 * 1000 }, // 20 req/min
} as const;
