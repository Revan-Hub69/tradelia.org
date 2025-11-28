"use client";

import { useMemo } from "react";
import { defaultLocale, type Locale } from "./config";
import itDict from "./it.json";
import enDict from "./en.json";
import homeIt from "./home.json";

const dictionaries = {
  it: { ...itDict, home: homeIt.it },
  en: { ...enDict, home: homeIt.en },
};

export function useTranslations(locale: Locale = defaultLocale) {
  return useMemo(() => {
    const dict = dictionaries[locale] || dictionaries[defaultLocale];
    return {
      t: (key: string, fallback?: string): any => {
        const keys = key.split(".");
        let value: any = dict;
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) {
            break;
          }
        }
        return value !== undefined ? value : fallback || key;
      },
      dict,
    };
  }, [locale]);
}
