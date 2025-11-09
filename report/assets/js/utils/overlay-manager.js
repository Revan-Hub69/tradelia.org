// /report/assets/js/utils/overlay-manager.js
// Sistema di gestione overlay unificato - Stack management
// Gestisce z-index dinamici, overflow body, ESC key

import Logger from './logger.js';

const OVERLAY_STACK = [];
const BASE_Z_INDEX = 1000;
const Z_INDEX_INCREMENT = 10;

// Tipi overlay
export const OVERLAY_TYPES = {
  MODULE_TABS: 'module-tabs',
  METRICS_DRAWER: 'metrics-drawer',
  METRIC_POPUP: 'metric-popup',
  GLOSSARY: 'glossary',
  PANEL: 'panel',
  POPOVER: 'popover'
};

/**
 * Registra un overlay nello stack
 * @param {string} id - ID univoco overlay
 * @param {string} type - Tipo overlay (OVERLAY_TYPES)
 * @param {HTMLElement} overlayEl - Elemento overlay DOM
 * @param {HTMLElement} drawerEl - Elemento drawer/panel (opzionale, per z-index separato)
 * @returns {number} Z-index assegnato
 */
export function registerOverlay(id, type, overlayEl, drawerEl = null) {
  if (!id || !overlayEl) {
    Logger.warn('OverlayManager', 'ID o elemento overlay mancante');
    return null;
  }

  // Rimuovi se già presente (evita duplicati)
  unregisterOverlay(id);

  const zIndex = BASE_Z_INDEX + (OVERLAY_STACK.length * Z_INDEX_INCREMENT);
  const entry = {
    id,
    type,
    overlayEl,
    drawerEl, // Drawer/panel separato (se presente)
    zIndex,
    registeredAt: Date.now()
  };

  OVERLAY_STACK.push(entry);
  overlayEl.style.zIndex = zIndex;
  overlayEl.style.pointerEvents = 'all'; // Assicura che l'overlay blocchi lo sfondo
  
  // Se c'è un drawer/panel separato, imposta z-index + 10 (sempre in primo piano)
  if (drawerEl) {
    drawerEl.style.zIndex = zIndex + 10;
    drawerEl.style.pointerEvents = 'auto'; // Forza pointer-events sul drawer
    drawerEl.style.visibility = 'visible'; // Forza visibilità
    drawerEl.style.opacity = '1'; // Forza opacità
  } else {
    // Altrimenti cerca dentro l'overlay
    const drawer = overlayEl.querySelector('.module-tabs-drawer, .metrics-drawer-panel, .metric-popup-panel, .glossary-drawer-panel');
    if (drawer) {
      drawer.style.zIndex = zIndex + 10;
      drawer.style.pointerEvents = 'auto'; // Forza pointer-events sul drawer
      drawer.style.visibility = 'visible'; // Forza visibilità
      drawer.style.opacity = '1'; // Forza opacità
    }
  }
  
  // Aggiorna overflow body
  updateBodyOverflow();
  
  Logger.debug('OverlayManager', `Overlay registrato: ${id} (z-index: ${zIndex})`);
  return zIndex;
}

/**
 * Rimuove un overlay dallo stack
 * @param {string} id - ID overlay
 */
export function unregisterOverlay(id) {
  const index = OVERLAY_STACK.findIndex(entry => entry.id === id);
  if (index === -1) return;

  OVERLAY_STACK.splice(index, 1);
  
  // Ricalcola z-index per overlay rimanenti
  OVERLAY_STACK.forEach((entry, i) => {
    const newZIndex = BASE_Z_INDEX + (i * Z_INDEX_INCREMENT);
    entry.zIndex = newZIndex;
    if (entry.overlayEl) {
      entry.overlayEl.style.zIndex = newZIndex;
      entry.overlayEl.style.pointerEvents = 'all';
    }
    // Aggiorna anche drawer/panel separato (se presente)
    if (entry.drawerEl) {
      entry.drawerEl.style.zIndex = newZIndex + 10;
    } else if (entry.overlayEl) {
      // Altrimenti cerca dentro l'overlay
      const drawer = entry.overlayEl.querySelector('.module-tabs-drawer, .metrics-drawer-panel, .metric-popup-panel, .glossary-drawer-panel');
      if (drawer) {
        drawer.style.zIndex = newZIndex + 10;
      }
    }
  });
  
  // Aggiorna overflow body
  updateBodyOverflow();
  
  Logger.debug('OverlayManager', `Overlay rimosso: ${id}`);
}

/**
 * Ottiene l'overlay in cima allo stack
 * @returns {Object|null} Entry overlay o null
 */
export function getTopOverlay() {
  return OVERLAY_STACK.length > 0 ? OVERLAY_STACK[OVERLAY_STACK.length - 1] : null;
}

/**
 * Chiude l'overlay in cima allo stack
 */
export function closeTopOverlay() {
  const top = getTopOverlay();
  if (!top) return;

  // Trigger evento custom per chiudere (ogni overlay gestisce la propria chiusura)
  const event = new CustomEvent('overlay-close-request', {
    detail: { id: top.id, type: top.type }
  });
  top.overlayEl.dispatchEvent(event);
}

/**
 * Aggiorna overflow body in base allo stack
 */
function updateBodyOverflow() {
  if (OVERLAY_STACK.length > 0) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

/**
 * Inizializza gestione ESC key globale
 */
let escListenerAttached = false;

export function initEscHandler() {
  if (escListenerAttached) return;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && OVERLAY_STACK.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      closeTopOverlay();
    }
  });
  
  escListenerAttached = true;
  Logger.debug('OverlayManager', 'ESC handler inizializzato');
}

/**
 * Pulisce tutti gli overlay (utile per cleanup)
 */
export function clearAllOverlays() {
  OVERLAY_STACK.length = 0;
  updateBodyOverflow();
  Logger.debug('OverlayManager', 'Tutti gli overlay puliti');
}

// Auto-inizializza ESC handler
if (typeof document !== 'undefined') {
  initEscHandler();
}

