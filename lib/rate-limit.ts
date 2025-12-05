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
 * Get client IP from request
 * Supports various proxy headers (X-Forwarded-For, X-Real-IP, etc.)
 */
export function getClientIP(request: Request): string {
  // Try various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback: try to get from request URL or use a default
  // In Edge Runtime, we might not have direct access to socket
  return 'unknown';
}

/**
 * Rate limit wrapper with simplified signature
 * @param key - Unique identifier for rate limiting
 * @param maxRequests - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  return checkRateLimit(key, { maxRequests, windowMs });
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
