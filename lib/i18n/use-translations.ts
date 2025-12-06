"use client";

/**
 * Simplified i18n hook - Always returns Italian
 * 
 * This is a minimal wrapper that maintains API compatibility
 * for future migration to external libraries (next-intl, react-i18next, etc.)
 * 
 * TODO: Replace with next-intl or similar library when ready
 */
export function useTranslations() {
  // Always return Italian locale
  const locale = 'it' as const;

  // Simple translation function - returns fallback or key
  // In future: replace with library's t() function
  const t = (key: string, fallback?: string): string => {
    // For now, always return fallback or empty string
    // This allows gradual migration to hardcoded Italian strings
    return fallback || '';
  };

  return {
    t,
    tArray: (key: string, fallback?: string[]): string[] => fallback || [],
    tObject: (key: string): Record<string, unknown> => ({}),
    dict: {},
    locale,
  };
}
