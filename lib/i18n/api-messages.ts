/**
 * API Messages - Simplified (always Italian)
 * 
 * Maintained for API compatibility and future migration to external libraries
 * 
 * TODO: Replace with next-intl or similar library when ready
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

// Always return Italian messages
const italianMessages: ApiMessages = {
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
};

/**
 * Get API messages - Always returns Italian
 */
export function getApiMessages(locale: Locale = 'it'): ApiMessages {
  return italianMessages;
}

/**
 * Detect locale from request - Always returns Italian
 */
export function detectLocaleFromRequest(request: Request): Locale {
  return 'it';
}

/**
 * Get locale from request - Always returns Italian
 */
export function getLocaleFromRequest(request: Request): Locale {
  return 'it';
}
