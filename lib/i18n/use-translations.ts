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
    return {
      t: (key: string, fallback?: string): string | string[] | Record<string, unknown> => {
        const keys = key.split('.');
        let value: string | string[] | Record<string, unknown> | undefined = dict;
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) break;
        }
        return value !== undefined ? value : (fallback || key);
      },
      dict,
      locale,
    };
  }, [locale]);
}
