/**
 * Simplified path builder - Always returns path without locale prefix
 * 
 * Maintained for API compatibility and future migration to external libraries
 * Strategy: Strangler Fig Pattern - allows gradual removal without breaking changes
 */

import { type Locale } from './config';

export function buildLocalePath(locale: Locale, path: string): string {
  // Always return path as-is (no /en prefix)
  // Remove any existing /en prefix if present
  return path.replace(/^\/en(\/|$)/, '/');
}
