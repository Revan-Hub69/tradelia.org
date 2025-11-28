import { type Locale } from './config';

/**
 * Utility to keep locale-aware navigation consistent across the app.
 * Accepts an absolute path (starting with "/") and prefixes it with /en
 * when the active locale is English. Default locale (Italian) keeps the
 * canonical path without duplication.
 */
export function buildLocalePath(locale: Locale, path: string) {
  if (!path.startsWith('/')) {
    return path;
  }

  // Normalize existing /en prefixes to avoid double-prepending
  const normalizedPath = path.replace(/^\/en(\/|$)/, '/');

  if (locale === 'en') {
    if (normalizedPath === '/') {
      return '/en';
    }
    return `/en${normalizedPath}`;
  }

  return normalizedPath;
}
