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
 * Priority: 1. Query param, 2. Path, 3. Header, 4. Default (ITALIANO)
 * 
 * IMPORTANTE: Default è sempre ITALIANO se non c'è preferenza esplicita
 * L'utente italiano vede sempre italiano a meno che non scelga esplicitamente inglese
 */
export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  
  // 1. Check query parameter (esplicito dall'utente)
  const localeParam = url.searchParams.get('locale') as Locale | null;
  if (localeParam === 'it' || localeParam === 'en') {
    return localeParam;
  }
  
  // 2. Check URL path (se è /en allora è esplicito)
  if (url.pathname.startsWith('/en')) {
    return 'en';
  }
  
  // 3. Check Accept-Language header (solo se esplicito)
  // NOTA: Non usiamo header come default perché potrebbe essere sbagliato
  // Solo se l'utente ha esplicitamente scelto inglese nel browser
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase());
    
    // Solo se inglese è la PRIMA preferenza (q=1.0 o senza q)
    const firstLang = languages[0];
    if (firstLang && firstLang.startsWith('en') && !firstLang.startsWith('it')) {
      return 'en';
    }
  }
  
  // 4. DEFAULT: Sempre italiano se non c'è preferenza esplicita
  return 'it';
}
