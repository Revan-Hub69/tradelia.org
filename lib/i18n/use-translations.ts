"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  
  // Funzione helper per rilevare il locale
  // CRITICAL: localStorage ha SEMPRE priorità massima - preferenza utente
  // Usa useCallback per memoizzare la funzione
  const detectLocale = useCallback((): Locale => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }
    
    // PRIMA: Leggi sempre da localStorage (priorità massima - preferenza utente)
    try {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (savedLocale === 'it' || savedLocale === 'en') {
        return savedLocale;
      }
    } catch (e) {
      // localStorage non disponibile
    }
    
    // SECONDO: Rileva dal pathname (URL esplicito)
    const pathLocale = pathname.startsWith("/en") ? "en" : "it";
    return pathLocale;
  }, [pathname]);

  // CRITICAL: Inizializza sempre con defaultLocale sul server per evitare hydration mismatch
  // Il locale verrà aggiornato sul client dopo il mount
  const [locale, setLocale] = useState<Locale>(() => {
    // Sul server, usa sempre defaultLocale
    if (typeof window === "undefined") {
      return defaultLocale;
    }
    // Sul client, rileva il locale
    return detectLocale();
  });
  const [mounted, setMounted] = useState(false);

  // Monta il componente e rileva il locale
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setMounted(true);
    
    // Rileva e imposta il locale immediatamente dopo il mount
    const detectedLocale = detectLocale();
    setLocale((currentLocale) => {
      // Solo aggiorna se è diverso per evitare re-render inutili
      if (detectedLocale !== currentLocale) {
        return detectedLocale;
      }
      return currentLocale;
    });
    
    // CRITICAL: Salva sempre la lingua rilevata in localStorage per persistenza
    // Questo assicura che la preferenza venga mantenuta quando si naviga tra pagine
    try {
      const currentSavedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (!currentSavedLocale || (currentSavedLocale !== 'it' && currentSavedLocale !== 'en')) {
        // Se non c'è una preferenza salvata, salva quella rilevata
        localStorage.setItem(LOCALE_STORAGE_KEY, detectedLocale);
      }
    } catch (e) {
      // localStorage non disponibile
    }
  }, [detectLocale]);

  // Salva locale in localStorage quando cambia
  useEffect(() => {
    if (!mounted || typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (e) {
      // localStorage non disponibile
    }
  }, [locale, mounted]);

  // Sincronizza locale quando cambia il pathname (navigazione Next.js)
  useEffect(() => {
    if (!mounted) {
      return;
    }
    
    // CRITICAL: Usa detectLocale() che ha già la logica corretta (localStorage > pathname)
    // Solo aggiorna se è diverso per evitare re-render inutili
    setLocale((currentLocale) => {
      const detectedLocale = detectLocale();
      if (detectedLocale !== currentLocale) {
        // Se il locale rilevato è diverso, aggiorna
        return detectedLocale;
      }
      return currentLocale;
    });
  }, [pathname, mounted, detectLocale]); // Reagisce ai cambiamenti di pathname

  // Ascolta cambiamenti di navigazione e aggiorna locale se necessario
  useEffect(() => {
    if (!mounted || typeof window === "undefined") {
      return;
    }

    // Ascolta evento localechange (dispatched da LanguageSwitch e InitialLanguageSelector)
    const handleLocaleChange = (event: CustomEvent) => {
      if (event.detail?.locale && (event.detail.locale === 'it' || event.detail.locale === 'en')) {
        setLocale(event.detail.locale);
      }
    };

    // Ascolta popstate (back/forward) - rileva locale dal pathname
    const handlePopState = () => {
      // Usa detectLocale che ha la logica corretta (localStorage > pathname)
      const detectedLocale = detectLocale();
      setLocale((currentLocale) => {
        // Solo aggiorna se è diverso per evitare re-render inutili
        return detectedLocale !== currentLocale ? detectedLocale : currentLocale;
      });
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("localechange", handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("localechange", handleLocaleChange as EventListener);
    };
  }, [mounted, detectLocale]); // Aggiunto detectLocale per evitare closure stale

  return useMemo(() => {
    // Usa il locale rilevato (già inizializzato correttamente)
    const currentLocale = locale;
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
