'use client';

import { useMemo, useEffect, useState } from 'react';
import { detectOsloLocale, saveOsloLocale, type OsloLocale, osloDefaultLocale } from './oslo-config';

// Lazy load dictionaries
const dictionaries: Record<OsloLocale, () => Promise<any>> = {
  it: () => import('./it.json').then((m) => m.default),
  en: () => import('./en.json').then((m) => m.default),
  ru: () => import('./ru.json').then((m) => m.default),
  fr: () => import('./fr.json').then((m) => m.default),
  de: () => import('./de.json').then((m) => m.default),
  es: () => import('./es.json').then((m) => m.default),
  zh: () => import('./zh.json').then((m) => m.default),
  ja: () => import('./ja.json').then((m) => m.default),
  ro: () => import('./ro.json').then((m) => m.default),
};

// Cache for loaded dictionaries
const dictCache: Record<OsloLocale, any> = {} as any;

/**
 * Hook per traduzioni Oslo con autodetect lingua
 */
export function useOsloTranslations() {
  const [locale, setLocale] = useState<OsloLocale>(osloDefaultLocale);
  const [dict, setDict] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Detect locale on mount
  useEffect(() => {
    setMounted(true);
    const detected = detectOsloLocale();
    setLocale(detected);
  }, []);

  // Load dictionary when locale changes
  useEffect(() => {
    if (!mounted) return;

    const loadDict = async () => {
      setLoading(true);
      try {
        // Check cache first
        if (dictCache[locale]) {
          setDict(dictCache[locale]);
          setLoading(false);
          return;
        }

        // Load dictionary
        const loader = dictionaries[locale] || dictionaries[osloDefaultLocale];
        const loaded = await loader();
        dictCache[locale] = loaded;
        setDict(loaded);
      } catch (error) {
        console.error('Error loading dictionary:', error);
        // Fallback to default
        if (locale !== osloDefaultLocale) {
          const fallback = await dictionaries[osloDefaultLocale]();
          setDict(fallback);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDict();
  }, [locale, mounted]);

  const changeLocale = (newLocale: OsloLocale) => {
    setLocale(newLocale);
    saveOsloLocale(newLocale);
  };

  const getValue = (key: string, fallback?: string): unknown => {
    if (!dict) return fallback || key;
    
    const keys = key.split('.');
    let value: unknown = dict;
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return fallback || key;
      }
    }
    
    return value !== undefined ? value : fallback || key;
  };

  return useMemo(
    () => ({
      t: (key: string, params?: Record<string, string | number>, fallback?: string): string => {
        const value = getValue(key, fallback);
        let str = typeof value === 'string' ? value : String(value);
        
        // Replace params {count} -> actual value
        if (params) {
          Object.entries(params).forEach(([param, val]) => {
            str = str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
          });
        }
        
        return str;
      },
      tArray: (key: string, fallback?: string[]): string[] => {
        const value = getValue(key);
        return Array.isArray(value) ? (value as string[]) : fallback || [];
      },
      tObject: (key: string): Record<string, unknown> => {
        const value = getValue(key);
        return typeof value === 'object' && value !== null
          ? (value as Record<string, unknown>)
          : {};
      },
      locale,
      changeLocale,
      loading,
      dict,
    }),
    [locale, dict, loading]
  );
}

