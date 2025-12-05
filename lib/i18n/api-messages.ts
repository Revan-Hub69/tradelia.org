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
 * Priority: 1. Query param, 2. Header, 3. Path, 4. Default
 */
export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  
  // 1. Check query parameter
  const localeParam = url.searchParams.get('locale') as Locale | null;
  if (localeParam === 'it' || localeParam === 'en') {
    return localeParam;
  }
  
  // 2. Check Accept-Language header
  const detectedLocale = detectLocaleFromRequest(request);
  if (detectedLocale) {
    return detectedLocale;
  }
  
  // 3. Default
  return 'it';
}
