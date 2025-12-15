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
 * - Loads Italian dictionary for translations
 */

import { useMemo } from "react";
import { defaultLocale, type Locale } from "./config";
import itDict from "./it.json";
import homeIt from "./home.json";

// Merge dictionaries (same as original implementation)
const dictionaries = {
  it: { ...itDict, home: homeIt.it },
};

export function useTranslations() {
  // Always return Italian locale
  const locale: Locale = defaultLocale;
  const dict = dictionaries[locale] || dictionaries[defaultLocale];

  // Translation function that looks up in dictionary
  const getValue = (key: string, fallback?: string): unknown => {
    if (!key || typeof key !== "string") {
      return fallback || "";
    }

    const keys = key.split(".");
    let value: unknown = dict;
    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }
    return value !== undefined ? value : fallback || "";
  };

  const t = (key: string, fallback?: string): string => {
    const value = getValue(key, fallback);
    return typeof value === "string" ? value : String(value);
  };

  return useMemo(() => ({
    t,
    tArray: (key: string, fallback?: string[]): string[] => {
      const value = getValue(key);
      return Array.isArray(value) ? (value as string[]) : fallback || [];
    },
    tObject: (key: string): Record<string, unknown> => {
      const value = getValue(key);
      return typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)
        : {};
    },
    dict,
    locale,
  }), []);
}
