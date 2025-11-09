// /report/assets/js/utils/user-preferences.js
// Sistema Preferenze Utente - localStorage
// Versione 2025

import Logger from './logger.js';

const STORAGE_KEY = 'tradelia-user-preferences';
const DEFAULT_PREFERENCES = {
  // Navigazione
  indexCollapsed: false,
  // Visualizzazione
  compactMode: false,
  fontSize: 'normal', // 'small', 'normal', 'large'
  // Ricerca
  searchHistory: [],
  // Moduli
  hiddenModules: [],
  // Accessibilità
  highContrast: false,
  reducedMotion: false,
  // Multilingua
  language: null // null = auto-detect, 'it', 'en'
};

// ===== UTILITIES =====
function getPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (err) {
    Logger.warn('UserPreferences', 'Errore caricamento preferenze', err);
  }
  return { ...DEFAULT_PREFERENCES };
}

function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch (err) {
    Logger.warn('UserPreferences', 'Errore salvataggio preferenze', err);
    return false;
  }
}

// ===== PUBLIC API =====
export const userPreferences = {
  /**
   * Ottieni tutte le preferenze
   * @returns {Object} Preferenze utente
   */
  getAll() {
    return getPreferences();
  },

  /**
   * Ottieni una preferenza specifica
   * @param {string} key - Chiave preferenza
   * @param {*} defaultValue - Valore di default
   * @returns {*} Valore preferenza
   */
  get(key, defaultValue = null) {
    const prefs = getPreferences();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  },

  /**
   * Imposta una preferenza
   * @param {string} key - Chiave preferenza
   * @param {*} value - Valore preferenza
   * @returns {boolean} Successo
   */
  set(key, value) {
    const prefs = getPreferences();
    prefs[key] = value;
    return savePreferences(prefs);
  },

  /**
   * Imposta multiple preferenze
   * @param {Object} updates - Oggetto con preferenze da aggiornare
   * @returns {boolean} Successo
   */
  setMultiple(updates) {
    const prefs = getPreferences();
    Object.assign(prefs, updates);
    return savePreferences(prefs);
  },

  /**
   * Reset preferenze a default
   * @returns {boolean} Successo
   */
  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      Logger.warn('UserPreferences', 'Errore reset preferenze', err);
      return false;
    }
  },

  /**
   * Aggiungi termine a storia ricerca
   * @param {string} term - Termine di ricerca
   * @param {number} maxHistory - Massimo elementi in storia
   * @returns {boolean} Successo
   */
  addSearchHistory(term, maxHistory = 10) {
    if (!term || term.trim().length < 2) return false;
    
    const prefs = getPreferences();
    const history = prefs.searchHistory || [];
    
    // Rimuovi duplicati
    const filtered = history.filter(item => item.toLowerCase() !== term.toLowerCase());
    
    // Aggiungi in cima
    filtered.unshift(term.trim());
    
    // Limita dimensione
    prefs.searchHistory = filtered.slice(0, maxHistory);
    
    return savePreferences(prefs);
  },

  /**
   * Ottieni storia ricerca
   * @returns {Array<string>} Storia ricerca
   */
  getSearchHistory() {
    return this.get('searchHistory', []);
  },

  /**
   * Nascondi modulo
   * @param {string} moduleId - ID modulo
   * @returns {boolean} Successo
   */
  hideModule(moduleId) {
    const prefs = getPreferences();
    const hidden = prefs.hiddenModules || [];
    if (!hidden.includes(moduleId)) {
      hidden.push(moduleId);
      prefs.hiddenModules = hidden;
      return savePreferences(prefs);
    }
    return true;
  },

  /**
   * Mostra modulo
   * @param {string} moduleId - ID modulo
   * @returns {boolean} Successo
   */
  showModule(moduleId) {
    const prefs = getPreferences();
    const hidden = prefs.hiddenModules || [];
    prefs.hiddenModules = hidden.filter(id => id !== moduleId);
    return savePreferences(prefs);
  },

  /**
   * Verifica se modulo è nascosto
   * @param {string} moduleId - ID modulo
   * @returns {boolean} Modulo nascosto
   */
  isModuleHidden(moduleId) {
    const hidden = this.get('hiddenModules', []);
    return hidden.includes(moduleId);
  },

  /**
   * Applica preferenze al DOM
   * @returns {void}
   */
  applyToDOM() {
    const prefs = getPreferences();
    const root = document.documentElement;

    // Font size
    if (prefs.fontSize === 'small') {
      root.style.fontSize = '14px';
    } else if (prefs.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '';
    }

    // High contrast
    if (prefs.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Reduced motion
    if (prefs.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }

    // Compact mode
    if (prefs.compactMode) {
      root.setAttribute('data-compact-mode', 'true');
    } else {
      root.removeAttribute('data-compact-mode');
    }

    Logger.debug('UserPreferences', 'Preferenze applicate al DOM', prefs);
  }
};

// Applica preferenze al caricamento
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => userPreferences.applyToDOM());
  } else {
    userPreferences.applyToDOM();
  }
}

