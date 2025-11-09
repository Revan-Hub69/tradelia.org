// /report/assets/js/utils/i18n.js
// Sistema Internazionalizzazione (i18n) - Multilingua
// Versione 2025 - Supporto IT/EN

import Logger from './logger.js';
import { userPreferences } from './user-preferences.js';

// ===== TRADUZIONI =====
const TRANSLATIONS = {
  it: {
    // Navigazione
    'nav.dashboard': 'Dashboard',
    'nav.index.title': 'Indice Moduli',
    'nav.breadcrumb.report': 'Report',
    'nav.search.placeholder': 'Cerca nel report...',
    'nav.search.noResults': 'Nessun risultato per',
    'nav.search.results': 'risultato',
    'nav.search.resultsPlural': 'risultati',
    'nav.search.found': 'trovato',
    'nav.search.foundPlural': 'trovati',
    'nav.search.resultType.title': 'Titolo',
    'nav.search.resultType.desc': 'Descrizione',
    'nav.search.resultType.metric': 'Metrica',
    'nav.home': 'Home',
    'nav.pricing': 'Prezzi',
    'nav.terms': 'Termini',
    'nav.privacy': 'Privacy',
    'nav.refund': 'Rimborsi',
    
    // Errori
    'error.loading': 'Errore di caricamento',
    'error.temporary': 'Si è verificato un errore temporaneo.',
    'error.reload': 'Ricarica pagina',
    
    // Moduli
    'module.status.active': 'ATTIVO',
    'module.status.hold': 'IN ATTESA',
    'module.status.review': 'IN REVISIONE',
    
    // Preferenze
    'prefs.language': 'Lingua',
    'prefs.language.it': 'Italiano',
    'prefs.language.en': 'English',
    
    // Comuni
    'common.close': 'Chiudi',
    'common.open': 'Apri',
    'common.cancel': 'Annulla',
    'common.save': 'Salva',
    'common.search': 'Cerca',
    'common.filter': 'Filtra',
    'common.export': 'Esporta',
    'common.loading': 'Caricamento...',
    
    // Report
    'report.freshness': 'Freshness',
    'report.version': 'Versione',
    'report.lastUpdate': 'Ultimo aggiornamento',
    
    // Metriche
    'metric.clickForDetails': 'Clicca per dettagli',
    'metric.keyMetric': 'Metrica Chiave',
    
    // Export
    'export.csv': 'Esporta CSV',
    'export.json': 'Esporta JSON',
    'export.pdf': 'Esporta PDF',
    'export.selectModules': 'Seleziona moduli da esportare',
    'export.success': 'Export completato con successo',
    'export.error': 'Errore durante l\'export',
    
    // Filtri
    'filter.byModule': 'Filtra per modulo',
    'filter.byDate': 'Filtra per data',
    'filter.byMetric': 'Filtra per metrica',
    'filter.all': 'Tutti',
    'filter.clear': 'Rimuovi filtri'
  },
  
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.index.title': 'Module Index',
    'nav.breadcrumb.report': 'Report',
    'nav.search.placeholder': 'Search in report...',
    'nav.search.noResults': 'No results for',
    'nav.search.results': 'result',
    'nav.search.resultsPlural': 'results',
    'nav.search.found': 'found',
    'nav.search.foundPlural': 'found',
    'nav.search.resultType.title': 'Title',
    'nav.search.resultType.desc': 'Description',
    'nav.search.resultType.metric': 'Metric',
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.terms': 'Terms',
    'nav.privacy': 'Privacy',
    'nav.refund': 'Refunds',
    
    // Errors
    'error.loading': 'Loading Error',
    'error.temporary': 'A temporary error occurred.',
    'error.reload': 'Reload page',
    
    // Modules
    'module.status.active': 'ACTIVE',
    'module.status.hold': 'HOLD',
    'module.status.review': 'REVIEW',
    
    // Preferences
    'prefs.language': 'Language',
    'prefs.language.it': 'Italiano',
    'prefs.language.en': 'English',
    
    // Common
    'common.close': 'Close',
    'common.open': 'Open',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.loading': 'Loading...',
    
    // Report
    'report.freshness': 'Freshness',
    'report.version': 'Version',
    'report.lastUpdate': 'Last update',
    
    // Metrics
    'metric.clickForDetails': 'Click for details',
    'metric.keyMetric': 'Key Metric',
    
    // Export
    'export.csv': 'Export CSV',
    'export.json': 'Export JSON',
    'export.pdf': 'Export PDF',
    'export.selectModules': 'Select modules to export',
    'export.success': 'Export completed successfully',
    'export.error': 'Error during export',
    
    // Filters
    'filter.byModule': 'Filter by module',
    'filter.byDate': 'Filter by date',
    'filter.byMetric': 'Filter by metric',
    'filter.all': 'All',
    'filter.clear': 'Clear filters'
  }
};

// ===== UTILITIES =====
function detectLanguage() {
  // 1. Preferenze utente
  const userLang = userPreferences.get('language');
  if (userLang && TRANSLATIONS[userLang]) {
    return userLang;
  }
  
  // 2. Browser language
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  if (TRANSLATIONS[langCode]) {
    return langCode;
  }
  
  // 3. Default: italiano
  return 'it';
}

function getCurrentLanguage() {
  return userPreferences.get('language') || detectLanguage();
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) {
    Logger.warn('i18n', `Lingua non supportata: ${lang}`);
    return false;
  }
  
  userPreferences.set('language', lang);
  applyLanguage(lang);
  return true;
}

function applyLanguage(lang) {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('data-lang', lang);
  
  // Trigger event per aggiornare UI
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  
  Logger.debug('i18n', `Lingua applicata: ${lang}`);
}

// ===== PUBLIC API =====
export const i18n = {
  /**
   * Inizializza sistema i18n
   * @returns {string} Lingua corrente
   */
  init() {
    const lang = getCurrentLanguage();
    applyLanguage(lang);
    return lang;
  },

  /**
   * Ottieni traduzione
   * @param {string} key - Chiave traduzione
   * @param {Object} params - Parametri per sostituzione
   * @returns {string} Testo tradotto
   */
  t(key, params = {}) {
    const lang = getCurrentLanguage();
    const translation = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['it']?.[key] || key;
    
    // Sostituzione parametri {{param}}
    let result = translation;
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });
    
    return result;
  },

  /**
   * Ottieni traduzione con pluralizzazione
   * @param {string} key - Chiave traduzione (singolare)
   * @param {number} count - Numero per pluralizzazione
   * @param {Object} params - Parametri aggiuntivi
   * @returns {string} Testo tradotto
   */
  tPlural(key, count, params = {}) {
    const lang = getCurrentLanguage();
    const isPlural = count !== 1;
    const pluralKey = `${key}Plural`;
    
    // Prova prima con chiave pluralizzata
    if (isPlural && TRANSLATIONS[lang]?.[pluralKey]) {
      return this.t(pluralKey, { ...params, count });
    }
    
    // Altrimenti usa chiave normale
    return this.t(key, { ...params, count });
  },

  /**
   * Cambia lingua
   * @param {string} lang - Codice lingua (it, en)
   * @returns {boolean} Successo
   */
  setLanguage(lang) {
    return setLanguage(lang);
  },

  /**
   * Ottieni lingua corrente
   * @returns {string} Codice lingua
   */
  getLanguage() {
    return getCurrentLanguage();
  },

  /**
   * Ottieni lingue disponibili
   * @returns {Array<string>} Array codici lingue
   */
  getAvailableLanguages() {
    return Object.keys(TRANSLATIONS);
  },

  /**
   * Traduci elemento DOM
   * @param {HTMLElement} element - Elemento DOM
   * @param {string} key - Chiave traduzione
   * @param {Object} params - Parametri
   * @returns {void}
   */
  translateElement(element, key, params = {}) {
    if (!element) return;
    
    const translation = this.t(key, params);
    
    // Se ha data-i18n, aggiorna testo
    if (element.hasAttribute('data-i18n')) {
      element.textContent = translation;
    } else {
      // Altrimenti aggiorna direttamente
      element.textContent = translation;
    }
    
    // Se è input/textarea, aggiorna placeholder
    if (element.placeholder !== undefined) {
      element.placeholder = translation;
    }
    
    // Se è title/aria-label, aggiorna attributi
    if (element.hasAttribute('title')) {
      element.setAttribute('title', translation);
    }
    if (element.hasAttribute('aria-label')) {
      element.setAttribute('aria-label', translation);
    }
  },

  /**
   * Traduci tutti gli elementi con data-i18n
   * @returns {void}
   */
  translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        this.translateElement(element, key);
      }
    });
    
    Logger.debug('i18n', `Tradotti ${elements.length} elementi`);
  }
};

// Inizializza al caricamento
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      i18n.init();
      i18n.translatePage();
    });
  } else {
    i18n.init();
    i18n.translatePage();
  }
  
  // Ascolta cambiamenti lingua
  window.addEventListener('languageChanged', () => {
    i18n.translatePage();
  });
}

