'use client';

import { useMemo, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { defaultLocale, type Locale } from './config';
import itDict from './it.json';
import enDict from './en.json';
import homeIt from './home.json';

const dictionaries = {
  it: { ...itDict, home: homeIt.it },
  en: { ...enDict, home: homeIt.en },
};

export function useTranslations() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Detect locale from pathname
    const detectedLocale = pathname?.startsWith('/en') ? 'en' : 'it';
    setLocale(detectedLocale);
  }, [pathname]);

  return useMemo(() => {
    const dict = dictionaries[locale] || dictionaries[defaultLocale];
    const getValue = (key: string, fallback?: string): unknown => {
      const keys = key.split('.');
      let value: unknown = dict;
      for (const k of keys) {
        if (typeof value === 'object' && value !== null && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          value = undefined;
          break;
        }
      }
      return value !== undefined ? value : (fallback || key);
    };

    return {
      t: (key: string, fallback?: string): string => {
        const value = getValue(key, fallback);
        return typeof value === 'string' ? value : String(value);
      },
      tArray: (key: string, fallback?: string[]): string[] => {
        const value = getValue(key);
        return Array.isArray(value) ? (value as string[]) : (fallback || []);
      },
      tObject: (key: string): Record<string, unknown> => {
        const value = getValue(key);
        return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
      },
      dict,
      locale,
    };
  }, [locale]);
}
