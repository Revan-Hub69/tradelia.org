import { type Locale } from './config';

/**
 * Simplified path builder - Always returns path without locale prefix
 * 
 * Maintained for API compatibility and future migration to external libraries
 * 
 * TODO: Replace with next-intl or similar library when ready
 */
export function buildLocalePath(locale: Locale, path: string): string {
  // Always return path as-is (no /en prefix)
  // Remove any existing /en prefix if present
  return path.replace(/^\/en(\/|$)/, '/');
}
