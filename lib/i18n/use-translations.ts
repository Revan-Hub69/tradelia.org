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

const LOCALE_STORAGE_KEY = 'tradelia_locale';

export function useTranslations() {
  // IMPORTANTE: Inizializza sempre con defaultLocale e mounted=false
  // Questo garantisce che server e client abbiano lo stesso stato iniziale
  const [locale, setLocale] = useState<Locale>(() => {
    // Durante SSR, sempre defaultLocale
    if (typeof window === "undefined") {
      return defaultLocale;
    }
    // Sul client, prova a leggere da localStorage o pathname
    try {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (savedLocale === 'it' || savedLocale === 'en') {
        return savedLocale;
      }
    } catch (e) {
      // localStorage non disponibile
    }
    // Fallback: rileva dal pathname
    const pathLocale = window.location.pathname.startsWith("/en") ? "en" : "it";
    return pathLocale;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // IMPORTANTE: Aggiorna mounted SOLO dopo che il componente è montato sul client
    // Questo garantisce che il rendering iniziale sia identico tra server e client
    if (typeof window === "undefined") {
      return;
    }

    // Usa un doppio setTimeout per assicurarsi che l'hydration sia completamente completata
    // prima di aggiornare lo stato - questo previene hydration mismatch
    const timeoutId = setTimeout(() => {
      // Secondo setTimeout per essere sicuri che React abbia completato l'hydration
      setTimeout(() => {
        setMounted(true);

        // Detect locale from window.location or localStorage
        // Usa requestAnimationFrame per assicurarsi che il DOM sia pronto
        requestAnimationFrame(() => {
          let detectedLocale: Locale = defaultLocale;
          
          // Prima prova localStorage
          try {
            const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
            if (savedLocale === 'it' || savedLocale === 'en') {
              detectedLocale = savedLocale;
            }
          } catch (e) {
            // localStorage non disponibile
          }
          
          // Se non c'è in localStorage, rileva dal pathname
          if (detectedLocale === defaultLocale) {
            detectedLocale = window.location.pathname.startsWith("/en") ? "en" : "it";
            // Salva la preferenza
            try {
              localStorage.setItem(LOCALE_STORAGE_KEY, detectedLocale);
            } catch (e) {
              // localStorage non disponibile
            }
          }
          
          // Solo aggiorna se diverso per evitare re-render inutili
          if (detectedLocale !== locale) {
            setLocale(detectedLocale);
          }
        });
      }, 100); // Delay più lungo per assicurarsi che l'hydration sia completa
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Update locale on navigation and save to localStorage
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const handleLocationChange = () => {
      if (typeof window !== "undefined") {
        let detectedLocale: Locale = defaultLocale;
        
        // Prima prova localStorage
        try {
          const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
          if (savedLocale === 'it' || savedLocale === 'en') {
            detectedLocale = savedLocale;
          }
        } catch (e) {
          // localStorage non disponibile
        }
        
        // Se non c'è in localStorage, rileva dal pathname
        if (detectedLocale === defaultLocale) {
          detectedLocale = window.location.pathname.startsWith("/en") ? "en" : "it";
        }
        
        setLocale(detectedLocale);
      }
    };

    // Salva locale quando cambia
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (e) {
      // localStorage non disponibile
    }

    window.addEventListener("popstate", handleLocationChange);
    // Ascolta anche i cambi di pathname (Next.js router)
    const interval = setInterval(() => {
      handleLocationChange();
    }, 100);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      clearInterval(interval);
    };
  }, [mounted, locale]);

  return useMemo(() => {
    // IMPORTANTE: Usa sempre defaultLocale durante SSR e fino al mount
    // Questo garantisce che server e client renderizzino lo stesso contenuto iniziale
    const currentLocale = mounted ? locale : defaultLocale;
    const dict = dictionaries[currentLocale] || dictionaries[defaultLocale];
    const getValue = (key: string, fallback?: string): unknown => {
      // Best Practice: Validate key format to prevent showing invalid keys
      if (!key || typeof key !== "string" || key.includes("porco") || key.includes("dio")) {
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
      // Best Practice: Always return fallback if key not found, never show the key itself
      return value !== undefined ? value : fallback || "";
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
