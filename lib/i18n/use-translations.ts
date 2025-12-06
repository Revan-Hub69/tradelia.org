"use client";

import { useMemo, useEffect, useState } from "react";
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
  const detectLocale = (): Locale => {
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
  };

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
    if (detectedLocale !== locale) {
      setLocale(detectedLocale);
    }
  }, []);

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
    
    // Rileva locale: localStorage ha priorità, poi pathname
    let detectedLocale: Locale = defaultLocale;
    
    if (typeof window !== "undefined") {
      try {
        const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
        if (savedLocale === 'it' || savedLocale === 'en') {
          detectedLocale = savedLocale;
        } else {
          // Fallback: rileva dal pathname
          detectedLocale = pathname.startsWith("/en") ? "en" : "it";
        }
      } catch (e) {
        // localStorage non disponibile, usa pathname
        detectedLocale = pathname.startsWith("/en") ? "en" : "it";
      }
    }
    
    if (detectedLocale !== locale) {
      setLocale(detectedLocale);
    }
  }, [pathname, mounted, locale]); // Reagisce ai cambiamenti di pathname

  // Ascolta cambiamenti di navigazione e aggiorna locale se necessario
  useEffect(() => {
    if (!mounted || typeof window === "undefined") {
      return;
    }

    const handleLocationChange = () => {
      const detectedLocale = detectLocale();
      if (detectedLocale !== locale) {
        setLocale(detectedLocale);
      }
    };

    // Ascolta evento localechange (dispatched da LanguageSwitch)
    const handleLocaleChange = (event: CustomEvent) => {
      if (event.detail?.locale && (event.detail.locale === 'it' || event.detail.locale === 'en')) {
        setLocale(event.detail.locale);
      }
    };

    // Ascolta popstate (back/forward)
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("localechange", handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("localechange", handleLocaleChange as EventListener);
    };
  }, [mounted, locale]);

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
