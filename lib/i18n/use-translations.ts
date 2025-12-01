"use client";

import { useMemo, useEffect, useState } from "react";
import { defaultLocale, type Locale } from "./config";
import itDict from "./it.json";
import enDict from "./en.json";
import homeIt from "./home.json";

const dictionaries = {
  it: { ...itDict, home: homeIt.it },
  en: { ...enDict, home: homeIt.en },
};

export function useTranslations() {
  // Usa sempre defaultLocale durante SSR per evitare hydration mismatch
  // Il locale verrà aggiornato solo dopo il mount sul client
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Aggiorna mounted PRIMA di cambiare locale per evitare mismatch
    setMounted(true);
    
    // Detect locale from window.location only on client
    // Usa requestAnimationFrame per assicurarsi che il DOM sia pronto
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const detectedLocale = window.location.pathname.startsWith("/en") ? "en" : "it";
        // Solo aggiorna se diverso per evitare re-render inutili
        if (detectedLocale !== locale) {
          setLocale(detectedLocale);
        }
      });
    }
  }, []);

  // Update locale on navigation
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const handleLocationChange = () => {
      if (typeof window !== "undefined") {
        const detectedLocale = window.location.pathname.startsWith("/en") ? "en" : "it";
        setLocale(detectedLocale);
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, [mounted]);

  return useMemo(() => {
    // IMPORTANTE: Usa sempre defaultLocale durante SSR e fino al mount
    // Questo garantisce che server e client renderizzino lo stesso contenuto iniziale
    const currentLocale = mounted ? locale : defaultLocale;
    const dict = dictionaries[currentLocale] || dictionaries[defaultLocale];
    const getValue = (key: string, fallback?: string): unknown => {
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
      return value !== undefined ? value : fallback || key;
    };

    return {
      t: (key: string, fallback?: string): string => {
        const value = getValue(key, fallback);
        return typeof value === "string" ? value : String(value);
      },
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
      locale: currentLocale,
    };
  }, [locale, mounted]);
}
