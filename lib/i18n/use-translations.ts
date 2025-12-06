"use client";

/**
 * Simplified i18n hook - Always returns Italian
 * 
 * This is a minimal wrapper that maintains API compatibility
 * while we incrementally remove i18n from the codebase.
 * 
 * Strategy: Strangler Fig Pattern
 * - Maintains same API signature
 * - Always returns Italian locale
 * - Allows gradual migration without breaking changes
 */

import { useMemo } from "react";
import { defaultLocale, type Locale } from "./config";

export function useTranslations() {
  // Always return Italian locale
  const locale: Locale = defaultLocale;

  // Simple translation function that returns fallback
  const t = (key: string, fallback?: string): string => {
    return fallback || '';
  };

  return useMemo(() => ({
    t,
    tArray: (key: string, fallback?: string[]): string[] => fallback || [],
    tObject: (key: string): Record<string, unknown> => ({}),
    dict: {},
    locale,
  }), []);
}
