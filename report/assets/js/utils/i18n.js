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
    'filter.clear': 'Rimuovi filtri',
    
    // Mifid Banner
    'mifid.banner.title': 'Informativa legale',
    'mifid.banner.message': 'Questo sito ha finalità esclusivamente educativa e informativa. Non costituisce consulenza in materia di investimenti (MiFID II).',
    'mifid.banner.accept': 'Accetto e chiudi',
    'mifid.banner.mifid': 'Informativa MiFID',
    'mifid.banner.privacy': 'Privacy',
    'mifid.banner.close': 'Chiudi',
    'mifid.banner.continue': 'Continuando dichiari di aver letto e compreso le informative.',
    
    // Homepage
    'home.hero.badge': 'Progetto Indipendente',
    'home.hero.title.line1': 'Analisi Finanziaria',
    'home.hero.title.line2': 'Accademica',
    'home.hero.description': 'Tradelia AI sviluppa <strong>analisi finanziarie modulari</strong> attraverso prompt proprietari e <strong>metodologia accademica scientifica</strong>. Strumenti didattici per comprendere mercati, rischi e correlazioni, con piena consapevolezza dei <strong>limiti tecnici e legali</strong> delle AI.',
    'home.hero.feature.analysis': 'Potenza Analitica',
    'home.hero.feature.analysis.desc': 'Analisi tecnica, macro e fondamentale integrate in modelli multilayer',
    'home.hero.feature.report': 'Report Accademici',
    'home.hero.feature.report.desc': 'Report dettagliati con metodologia accademica e conformità MiFID II',
    'home.hero.feature.education': 'Educazione Finanziaria',
    'home.hero.feature.education.desc': 'Glossario, tutorial e strumenti educativi per trader e investitori',
    'home.hero.disclaimer': 'Le analisi di Tradelia AI sono a scopo esclusivamente <strong>didattico</strong>. Le <strong>intelligenze artificiali</strong> non memorizzano dati, non tracciano l\'utente e possono contenere errori. Non costituiscono <strong>consulenza finanziaria</strong> e non sostituiscono un professionista abilitato.',
    
    // Footer
    'footer.about.title': 'Chi Siamo',
    'footer.about.desc': 'Progetto indipendente con metodo accademico AI per analisi finanziaria multi-fattore.',
    'footer.legal.title': 'Legale',
    'footer.legal.mifid': 'Informativa MiFID',
    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.terms': 'Termini di Servizio',
    'footer.legal.refund': 'Politica di Rimborso',
    'footer.contact.title': 'Contatti',
    'footer.contact.email': 'info@tradelia.org',
    'footer.copyright': 'Tradelia AI. Tutti i diritti riservati.',
    
    // Glossario
    'glossary.title': 'Glossario Finanziario',
    'glossary.subtitle': 'Oltre 200 termini finanziari spiegati con definizioni accademiche e spiegazioni AI',
    'glossary.search.placeholder': 'Cerca nel glossario...',
    'glossary.filter.all': 'Tutti',
    'glossary.filter.trading': 'Trading',
    'glossary.filter.investments': 'Investimenti',
    'glossary.filter.finance': 'Finanza base',
    'glossary.empty': 'Nessun termine trovato',
    'glossary.stats': 'termini trovati'
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
    'filter.clear': 'Clear filters',
    
    // Mifid Banner
    'mifid.banner.title': 'Legal information',
    'mifid.banner.message': 'This site is for educational and informational purposes only. It does not constitute investment advice (MiFID II).',
    'mifid.banner.accept': 'Accept and close',
    'mifid.banner.mifid': 'MiFID Information',
    'mifid.banner.privacy': 'Privacy',
    'mifid.banner.close': 'Close',
    'mifid.banner.continue': 'By continuing you declare that you have read and understood the information.',
    
    // Homepage
    'home.hero.badge': 'Independent Project',
    'home.hero.title.line1': 'Financial Analysis',
    'home.hero.title.line2': 'Academic',
    'home.hero.description': 'Tradelia AI develops <strong>modular financial analysis</strong> through proprietary prompts and <strong>scientific academic methodology</strong>. Educational tools to understand markets, risks and correlations, with full awareness of the <strong>technical and legal limits</strong> of AI.',
    'home.hero.feature.analysis': 'Analytical Power',
    'home.hero.feature.analysis.desc': 'Technical, macro and fundamental analysis integrated into multilayer models',
    'home.hero.feature.report': 'Academic Reports',
    'home.hero.feature.report.desc': 'Detailed reports with academic methodology and MiFID II compliance',
    'home.hero.feature.education': 'Financial Education',
    'home.hero.feature.education.desc': 'Glossary, tutorials and educational tools for traders and investors',
    'home.hero.disclaimer': 'Tradelia AI analyses are for <strong>educational</strong> purposes only. <strong>Artificial intelligences</strong> do not store data, do not track users and may contain errors. They do not constitute <strong>financial advice</strong> and do not replace a licensed professional.',
    
    // Footer
    'footer.about.title': 'About Us',
    'footer.about.desc': 'Independent project with academic AI method for multi-factor financial analysis.',
    'footer.legal.title': 'Legal',
    'footer.legal.mifid': 'MiFID Information',
    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.terms': 'Terms of Service',
    'footer.legal.refund': 'Refund Policy',
    'footer.contact.title': 'Contact',
    'footer.contact.email': 'info@tradelia.org',
    'footer.copyright': 'Tradelia AI. All rights reserved.',
    
    // Glossario
    'glossary.title': 'Financial Glossary',
    'glossary.subtitle': 'Over 200 financial terms explained with academic definitions and AI explanations',
    'glossary.search.placeholder': 'Search in glossary...',
    'glossary.filter.all': 'All',
    'glossary.filter.trading': 'Trading',
    'glossary.filter.investments': 'Investments',
    'glossary.filter.finance': 'Basic Finance',
    'glossary.empty': 'No terms found',
    'glossary.stats': 'terms found'
  }
};

// ===== UTILITIES =====
function detectLanguage() {
  // 1. Preferenze utente (salvate in localStorage)
  const userLang = userPreferences.get('language');
  if (userLang && TRANSLATIONS[userLang]) {
    Logger.debug('i18n', `Lingua da preferenze utente: ${userLang}`);
    return userLang;
  }
  
  // 2. Browser language (rilevamento automatico)
  try {
    const browserLang = navigator.language || navigator.userLanguage || 'it';
    const langCode = browserLang.split('-')[0].toLowerCase();
    if (TRANSLATIONS[langCode]) {
      Logger.debug('i18n', `Lingua da browser: ${langCode} (${browserLang})`);
      // Salva automaticamente la lingua del browser come preferenza
      userPreferences.set('language', langCode);
      return langCode;
    }
  } catch (e) {
    Logger.warn('i18n', 'Errore rilevamento lingua browser', e);
  }
  
  // 3. Default: italiano
  Logger.debug('i18n', 'Lingua default: it');
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
    
    // Se è input/textarea, aggiorna placeholder
    if (element.hasAttribute('data-i18n-placeholder') || element.placeholder !== undefined) {
      const placeholderKey = element.getAttribute('data-i18n-placeholder') || key;
      element.placeholder = this.t(placeholderKey, params);
    }
    
    // Se è input/button/text, aggiorna testo
    if (element.tagName === 'INPUT' && element.type === 'button') {
      element.value = translation;
    } else if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
      // Se la traduzione contiene HTML, usa innerHTML
      if (translation.includes('<')) {
        element.innerHTML = translation;
      } else {
        element.textContent = translation;
      }
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
    // Traduci elementi con data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    let translatedCount = 0;
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translation = this.t(key);
        if (translation && translation !== key) {
          // Se la traduzione contiene HTML (tag <strong>, <em>, etc.), usa innerHTML
          if (translation.includes('<')) {
            element.innerHTML = translation;
          } else {
            // Altrimenti usa textContent per sicurezza
            element.textContent = translation;
          }
          translatedCount++;
        }
      }
    });
    
    // Traduci placeholder con data-i18n-placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key && element.placeholder !== undefined) {
        const translation = this.t(key);
        if (translation && translation !== key) {
          element.placeholder = translation;
          translatedCount++;
        }
      }
    });
    
    Logger.debug('i18n', `Tradotti ${translatedCount} elementi (${elements.length} data-i18n + ${placeholderElements.length} placeholder)`);
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

