/**
 * Input Validation Utilities
 * 
 * Best Practice: Centralized validation functions
 * Used for form validation and API input sanitization
 */

import { z } from 'zod';

/**
 * Sanitize string input - Remove dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 10000); // Max length
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  positiveNumber: z.number().positive('Must be positive'),
  nonNegativeNumber: z.number().nonnegative('Must be non-negative'),
  stringMax: (max: number) => z.string().max(max, `Max length: ${max}`),
  stringMin: (min: number) => z.string().min(min, `Min length: ${min}`),
};

/**
 * Rate limit check helper
 */
export function checkRateLimit(
  requests: number,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const allowed = requests < maxRequests;
  const remaining = Math.max(0, maxRequests - requests);
  const resetAt = Date.now() + windowMs;

  return { allowed, remaining, resetAt };
}
