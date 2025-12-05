/**
 * API Messages - Multilingual error and success messages
 * Best Practice: Centralized message management for API responses
 * Supports dynamic content translation based on locale
 */

import { type Locale } from './config';

export interface ApiMessages {
  errors: {
    unauthorized: string;
    notFound: string;
    serverError: string;
    validationError: string;
    rateLimitExceeded: string;
    messageRequired: string;
    messageTooLong: (max: number) => string;
    invalidLocale: string;
    invalidInput: string;
    forbidden: string;
  };
  success: {
    created: string;
    updated: string;
    deleted: string;
    saved: string;
  };
}

const messages: Record<Locale, ApiMessages> = {
  it: {
    errors: {
      unauthorized: 'Non autorizzato',
      notFound: 'Risorsa non trovata',
      serverError: 'Errore interno del server',
      validationError: 'Errore di validazione',
      rateLimitExceeded: 'Troppe richieste. Riprova più tardi.',
      messageRequired: 'Il messaggio è obbligatorio',
      messageTooLong: (max: number) => `Messaggio troppo lungo. Massimo ${max} caratteri.`,
      invalidLocale: 'Locale non valido',
      invalidInput: 'Input non valido',
      forbidden: 'Accesso negato',
    },
    success: {
      created: 'Creato con successo',
      updated: 'Aggiornato con successo',
      deleted: 'Eliminato con successo',
      saved: 'Salvato con successo',
    },
  },
  en: {
    errors: {
      unauthorized: 'Unauthorized',
      notFound: 'Resource not found',
      serverError: 'Internal server error',
      validationError: 'Validation error',
      rateLimitExceeded: 'Too many requests. Please try again later.',
      messageRequired: 'Message is required',
      messageTooLong: (max: number) => `Message too long. Max ${max} characters.`,
      invalidLocale: 'Invalid locale',
      invalidInput: 'Invalid input',
      forbidden: 'Access denied',
    },
    success: {
      created: 'Created successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      saved: 'Saved successfully',
    },
  },
};

/**
 * Get API messages for a specific locale
 * Best Practice: Fallback to default locale if locale not found
 */
export function getApiMessages(locale: Locale = 'it'): ApiMessages {
  return messages[locale] || messages.it;
}

/**
 * Detect locale from request headers
 * Best Practice: Check Accept-Language header, then fallback to default
 */
export function detectLocaleFromRequest(request: Request): Locale {
  const acceptLanguage = request.headers.get('accept-language');
  
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,it;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase());
    
    // Check for English first
    if (languages.some(lang => lang.startsWith('en'))) {
      return 'en';
    }
    
    // Check for Italian
    if (languages.some(lang => lang.startsWith('it'))) {
      return 'it';
    }
  }
  
  // Fallback: check URL path
  const url = new URL(request.url);
  if (url.pathname.startsWith('/en')) {
    return 'en';
  }
  
  // Default to Italian
  return 'it';
}

/**
 * Get locale from request (checks multiple sources)
 * Best Practice: Priority based on W3C i18n recommendations
 * Priority: 1. Query param (user explicit), 2. URL path, 3. Accept-Language header, 4. Default (ITALIANO)
 * 
 * IMPORTANTE: 
 * - Default è sempre ITALIANO se non c'è preferenza
 * - Accept-Language header è best practice per rilevare lingua browser (W3C standard)
 * - Ma viene usato solo se non c'è preferenza esplicita (query/path)
 */
export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  
  // 1. Check query parameter (preferenza esplicita utente - priorità massima)
  const localeParam = url.searchParams.get('locale') as Locale | null;
  if (localeParam === 'it' || localeParam === 'en') {
    return localeParam;
  }
  
  // 2. Check URL path (preferenza esplicita da routing - priorità alta)
  if (url.pathname.startsWith('/en')) {
    return 'en';
  }
  
  // 3. Check Accept-Language header (best practice W3C - rileva lingua browser)
  // Usato solo se non c'è preferenza esplicita sopra
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header (es: "en-US,en;q=0.9,it;q=0.8")
    // Best Practice: Considera quality values (q) per priorità
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [langCode, qValue] = lang.split(';');
        const quality = qValue ? parseFloat(qValue.replace('q=', '')) : 1.0;
        return {
          code: langCode.trim().toLowerCase(),
          quality,
        };
      })
      .sort((a, b) => b.quality - a.quality); // Ordina per quality (più alta = più preferita)
    
    // Cerca prima inglese, poi italiano
    for (const lang of languages) {
      if (lang.code.startsWith('en')) {
        return 'en';
      }
      if (lang.code.startsWith('it')) {
        return 'it';
      }
    }
  }
  
  // 4. DEFAULT: Sempre italiano se non c'è preferenza
  return 'it';
}
