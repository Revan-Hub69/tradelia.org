/**
 * Sistema di logging centralizzato per Tradelia Report
 * 
 * Supporta logging condizionale basato su ambiente:
 * - DEBUG_MODE: Abilita log dettagliati (solo sviluppo)
 * - PRODUCTION: Solo errori critici
 * 
 * @module logger
 */

/**
 * Configurazione ambiente logging
 */
const LOG_CONFIG = {
  // Abilita log dettagliati in sviluppo (disabilitare in produzione)
  DEBUG_MODE: typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('debug=true')
  ),
  // Flag produzione (impostare a true in build produzione)
  PRODUCTION: typeof window !== 'undefined' && !(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
};

/**
 * Logger centralizzato
 * 
 * @namespace Logger
 */
const Logger = {
  /**
   * Log di debug (solo in sviluppo)
   * @param {string} module - Nome del modulo
   * @param {string} message - Messaggio di log
   * @param {*} [data] - Dati opzionali da loggare
   */
  debug(module, message, data) {
    if (LOG_CONFIG.DEBUG_MODE) {
      console.log(`[${module}] ${message}`, data || '');
    }
  },

  /**
   * Log di informazione
   * @param {string} module - Nome del modulo
   * @param {string} message - Messaggio di log
   * @param {*} [data] - Dati opzionali da loggare
   */
  info(module, message, data) {
    if (LOG_CONFIG.DEBUG_MODE) {
      console.info(`[${module}] ${message}`, data || '');
    }
  },

  /**
   * Log di warning
   * @param {string} module - Nome del modulo
   * @param {string} message - Messaggio di log
   * @param {Error|*} [error] - Errore o dati opzionali
   */
  warn(module, message, error) {
    // I warning sono sempre loggati ma con dettagli limitati in produzione
    if (LOG_CONFIG.DEBUG_MODE) {
      console.warn(`[${module}] ${message}`, error || '');
    } else {
      // In produzione, solo messaggio senza dettagli sensibili
      console.warn(`[${module}] ${message}`);
    }
  },

  /**
   * Log di errore critico (sempre loggato)
   * @param {string} module - Nome del modulo
   * @param {string} message - Messaggio di log
   * @param {Error|*} [error] - Errore o dati opzionali
   */
  error(module, message, error) {
    // Gli errori sono sempre loggati
    if (LOG_CONFIG.DEBUG_MODE) {
      console.error(`[${module}] ${message}`, error || '');
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      // In produzione, solo messaggio senza stack trace dettagliato
      console.error(`[${module}] ${message}`);
    }

    // Qui potresti inviare errori a un servizio di logging esterno
    // Es: sendToErrorTrackingService(module, message, error);
  },

  /**
   * Verifica se il debug è abilitato
   * @returns {boolean}
   */
  isDebugEnabled() {
    return LOG_CONFIG.DEBUG_MODE;
  }
};

export default Logger;

