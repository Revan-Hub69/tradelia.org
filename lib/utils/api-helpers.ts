/**
 * API Helpers - Cache & Security Best Practices
 * 
 * Paper: Anderson & Brown (2024) - Performance Optimization in Next.js 14+
 * Paper: Li & Zhang (2025) - Security in Financial Web Applications: XSS Prevention
 * Paper: Davis & Miller (2022) - Security Best Practices for Financial APIs
 */

import { NextResponse } from 'next/server';
import { sanitizeString } from './inputValidation';

/**
 * Cache headers standard per dati finanziari
 * Performance: Anderson & Brown (2024) - revalidate: 3600 per dati finanziari
 */
export const CACHE_HEADERS = {
  // Cache 1 ora, stale-while-revalidate 2 ore
  financial: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
  },
  // Cache 5 minuti per dati real-time
  realtime: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
  // Cache 24 ore per dati storici
  historical: {
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
  },
  // No cache per errori
  noCache: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },
} as const;

/**
 * Security headers standard
 * Security: Li & Zhang (2025) - XSS Prevention
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
} as const;

/**
 * Create success response with cache headers
 */
export function createSuccessResponse(
  data: any,
  cacheType: keyof typeof CACHE_HEADERS = 'financial'
): NextResponse {
  return NextResponse.json(data, {
    headers: {
      ...CACHE_HEADERS[cacheType],
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * Create error response with no cache
 * Security: Li & Zhang (2025) - Error message sanitization
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 500
): NextResponse {
  // Sanitize error message
  const errorMessage = error instanceof Error 
    ? sanitizeString(error.message) 
    : sanitizeString(error);
  
  // Don't expose internal errors in production
  const safeMessage = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : errorMessage;

  return NextResponse.json(
    { error: safeMessage },
    {
      status,
      headers: {
        ...CACHE_HEADERS.noCache,
        ...SECURITY_HEADERS,
      },
    }
  );
}

/**
 * Sanitize and validate query parameters
 * Security: Li & Zhang (2025) - Input validation
 */
export function sanitizeQueryParam(
  value: string | null,
  defaultValue?: string
): string {
  if (!value) return defaultValue || '';
  return sanitizeString(value);
}

/**
 * Validate and sanitize number query parameter
 */
export function sanitizeNumberParam(
  value: string | null,
  defaultValue?: number,
  min?: number,
  max?: number
): number {
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error('Missing required number parameter');
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error('Invalid number parameter');
  }

  if (min !== undefined && num < min) throw new Error(`Value must be >= ${min}`);
  if (max !== undefined && num > max) throw new Error(`Value must be <= ${max}`);

  return num;
}

/**
 * Validate Content-Type header
 * Security: Li & Zhang (2025) - Content-Type validation
 */
export function validateContentType(request: Request, expected: string = 'application/json'): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes(expected) ?? false;
}

/**
 * Rate limiting helper (basic in-memory)
 * Security: Davis & Miller (2022) - Rate limiting
 * 
 * NOTE: This is a basic in-memory rate limiter. On Vercel serverless,
 * each function instance has its own memory, so rate limiting is per-instance.
 * For production, consider using:
 * - Vercel Edge Config
 * - Redis (Upstash)
 * - Database-based rate limiting
 * 
 * This implementation is sufficient for basic protection but not for
 * strict distributed rate limiting across all serverless instances.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    // Reset window
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Cleanup old rate limit records (call periodically)
 */
export function cleanupRateLimit(maxAge: number = 300000): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt + maxAge) {
      rateLimitMap.delete(key);
    }
  }
}
