/**
 * Oslo i18n Configuration
 * Supporta 9 lingue per gaming communities internazionali
 */

export const osloLocales = ['it', 'en', 'ru', 'fr', 'de', 'es', 'zh', 'ja', 'ro'] as const;
export const osloDefaultLocale = 'it' as const;

export type OsloLocale = (typeof osloLocales)[number];

export const osloLocaleNames: Record<OsloLocale, string> = {
  it: 'Italiano',
  en: 'English',
  ru: 'Русский',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  zh: '简体中文',
  ja: '日本語',
  ro: 'Română',
};

export const osloLocaleFlags: Record<OsloLocale, string> = {
  it: '🇮🇹',
  en: '🇬🇧',
  ru: '🇷🇺',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ro: '🇷🇴',
};

/**
 * Mappa browser locale -> Oslo locale
 */
export const browserLocaleMap: Record<string, OsloLocale> = {
  // Italiano
  'it': 'it',
  'it-IT': 'it',
  'it-CH': 'it',
  // Inglese
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'en-CA': 'en',
  // Russo
  'ru': 'ru',
  'ru-RU': 'ru',
  // Francese
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  // Tedesco
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  // Spagnolo
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  // Cinese
  'zh': 'zh',
  'zh-CN': 'zh',
  'zh-Hans': 'zh',
  // Giapponese
  'ja': 'ja',
  'ja-JP': 'ja',
  // Rumeno
  'ro': 'ro',
  'ro-RO': 'ro',
};

/**
 * Detect browser locale and map to Oslo locale
 */
export function detectOsloLocale(): OsloLocale {
  if (typeof window === 'undefined') {
    return osloDefaultLocale;
  }

  // 1. Check localStorage preference
  const savedLocale = localStorage.getItem('oslo_locale') as OsloLocale | null;
  if (savedLocale && osloLocales.includes(savedLocale)) {
    return savedLocale;
  }

  // 2. Check browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang) {
    // Exact match
    if (browserLocaleMap[browserLang]) {
      return browserLocaleMap[browserLang];
    }
    // Partial match (e.g., "it-IT" -> "it")
    const langCode = browserLang.split('-')[0].toLowerCase();
    if (browserLocaleMap[langCode]) {
      return browserLocaleMap[langCode];
    }
  }

  // 3. Check navigator.languages array
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      const langCode = lang.split('-')[0].toLowerCase();
      if (browserLocaleMap[langCode]) {
        return browserLocaleMap[langCode];
      }
    }
  }

  return osloDefaultLocale;
}

/**
 * Save locale preference
 */
export function saveOsloLocale(locale: OsloLocale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('oslo_locale', locale);
  }
}

