/**
 * Modules Translations
 * Best Practice: Centralized translations for dashboard modules
 * Supports dynamic content translation
 */

import { type Locale } from './config';

export interface ModuleTranslation {
  title: string;
  description: string;
}

export interface ModulesTranslations {
  [key: string]: ModuleTranslation;
}

const modulesTranslations: Record<Locale, ModulesTranslations> = {
  it: {
    reports: {
      title: 'Report',
      description: 'Report ufficiali verificabili e analisi conformi MiFID II',
    },
    education: {
      title: 'Formazione',
      description: 'Corsi formativi basati su framework AI verificabili',
    },
    utilities: {
      title: 'Utilities',
      description: 'Strumenti finanziari professionali: calcolatori, simulatori e analisi avanzate',
    },
    requests: {
      title: 'Richieste',
      description: 'Gestisci le tue richieste di analisi',
    },
    voting: {
      title: 'Votazioni',
      description: 'Partecipa alle votazioni per nuovi asset',
    },
    settings: {
      title: 'Impostazioni',
      description: 'Gestisci profilo, notifiche e preferenze',
    },
    favorites: {
      title: 'Preferiti',
      description: 'I tuoi contenuti salvati per accesso rapido',
    },
    widgets: {
      title: 'Widgets',
      description: 'Widget personalizzabili per watchlist, portfolio e alert (Coming Soon)',
    },
    watchlist: {
      title: 'Watchlist',
      description: 'Monitora i tuoi asset preferiti con alert personalizzati (Coming Soon)',
    },
    billing: {
      title: 'Billing',
      description: 'Gestisci crediti, pagamenti e fatture',
    },
    admin: {
      title: 'Admin',
      description: 'Area amministrazione e gestione Supabase',
    },
  },
  en: {
    reports: {
      title: 'Reports',
      description: 'Official verifiable reports and MiFID II compliant analysis',
    },
    education: {
      title: 'Education',
      description: 'Training courses based on verifiable AI frameworks',
    },
    utilities: {
      title: 'Utilities',
      description: 'Professional financial tools: calculators, simulators and advanced analysis',
    },
    requests: {
      title: 'Requests',
      description: 'Manage your analysis requests',
    },
    voting: {
      title: 'Voting',
      description: 'Participate in voting for new assets',
    },
    settings: {
      title: 'Settings',
      description: 'Manage profile, notifications and preferences',
    },
    favorites: {
      title: 'Favorites',
      description: 'Your saved content for quick access',
    },
    widgets: {
      title: 'Widgets',
      description: 'Customizable widgets for watchlist, portfolio and alerts (Coming Soon)',
    },
    watchlist: {
      title: 'Watchlist',
      description: 'Monitor your favorite assets with custom alerts (Coming Soon)',
    },
    billing: {
      title: 'Billing',
      description: 'Manage credits, payments and invoices',
    },
    admin: {
      title: 'Admin',
      description: 'Administration area and Supabase management',
    },
  },
};

/**
 * Get module translation for a specific locale
 */
export function getModuleTranslation(
  moduleId: string,
  locale: Locale
): ModuleTranslation | null {
  return modulesTranslations[locale]?.[moduleId] || modulesTranslations.it[moduleId] || null;
}

/**
 * Translate a module object
 * Best Practice: Handles null/undefined descriptions from database
 */
export function translateModule<T extends { id: string; title?: string | null; description?: string | null }>(
  module: T,
  locale: Locale
): T {
  const translation = getModuleTranslation(module.id, locale);
  
  if (translation) {
    return {
      ...module,
      title: translation.title,
      description: translation.description,
    };
  }
  
  return module;
}

/**
 * Translate array of modules
 * Best Practice: Handles null/undefined descriptions from database
 */
export function translateModules<T extends { id: string; title?: string | null; description?: string | null }>(
  modules: T[],
  locale: Locale
): T[] {
  return modules.map(module => translateModule(module, locale));
}
