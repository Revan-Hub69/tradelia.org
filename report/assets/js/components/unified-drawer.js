// /report/assets/js/components/unified-drawer.js
// Drawer Unificato - Usa stessa struttura del glossary-drawer (che funziona perfettamente)
// Carica contenuto dinamicamente per tabs, glossario, ecc.

import Logger from '../utils/logger.js';
import { registerOverlay, unregisterOverlay, OVERLAY_TYPES } from '../utils/overlay-manager.js';
import { i18n } from '../utils/i18n.js';

const UNIFIED_DRAWER = {
  _overlay: null,
  _panel: null,
  _content: null,
  _isOpen: false,
  _currentId: null,
  _overlayId: 'unified-drawer'
};

// ===== UTILITIES =====
function createEl(tag, className, text = null) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== null) el.textContent = text;
  return el;
}

// ===== MOUNT =====
function mount() {
  if (UNIFIED_DRAWER._overlay) return;
  
  // Create overlay (stessa struttura del glossary-drawer)
  UNIFIED_DRAWER._overlay = createEl('div', 'glossary-drawer-overlay');
  UNIFIED_DRAWER._overlay.setAttribute('aria-modal', 'true');
  UNIFIED_DRAWER._overlay.setAttribute('aria-hidden', 'true');
  UNIFIED_DRAWER._overlay.hidden = true;
  
  // Create panel (stessa struttura del glossary-drawer)
  UNIFIED_DRAWER._panel = createEl('div', 'glossary-drawer-panel');
  UNIFIED_DRAWER._panel.setAttribute('role', 'dialog');
  
  // Header
  const header = createEl('header', 'glossary-drawer-header');
  header.innerHTML = `
    <h2 class="glossary-drawer-title" data-drawer-title>${i18n.t('module.header.sections')}</h2>
    <button class="glossary-drawer-close" aria-label="${i18n.t('common.close')}" type="button">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  UNIFIED_DRAWER._panel.appendChild(header);
  
  // Content wrapper
  UNIFIED_DRAWER._content = createEl('div', 'glossary-drawer-content');
  UNIFIED_DRAWER._panel.appendChild(UNIFIED_DRAWER._content);
  
  // Close handlers
  header.querySelector('.glossary-drawer-close').addEventListener('click', () => UNIFIED_DRAWER.close());
  UNIFIED_DRAWER._overlay.addEventListener('click', (e) => {
    if (e.target === UNIFIED_DRAWER._overlay) UNIFIED_DRAWER.close();
  });
  
  // Listener per close request dall'overlay manager (ESC key)
  UNIFIED_DRAWER._overlay.addEventListener('overlay-close-request', (e) => {
    if (e.detail.id === UNIFIED_DRAWER._overlayId) {
      UNIFIED_DRAWER.close();
    }
  });
  
  // IMPORTANTE: Panel DENTRO overlay (come glossary-drawer)
  UNIFIED_DRAWER._overlay.appendChild(UNIFIED_DRAWER._panel);
  document.body.appendChild(UNIFIED_DRAWER._overlay);
  
  Logger.debug('UnifiedDrawer', 'Drawer montato');
}

// ===== PUBLIC API =====
function open(config) {
  if (!UNIFIED_DRAWER._overlay) mount();
  
  const { title, breadcrumb, content, id } = config || {};
  
  // Aggiorna titolo
  const titleEl = UNIFIED_DRAWER._panel.querySelector('[data-drawer-title]');
  if (titleEl) {
    titleEl.textContent = title || i18n.t('module.header.sections');
    titleEl.id = `unified-drawer-title-${id || 'default'}`;
    UNIFIED_DRAWER._panel.setAttribute('aria-labelledby', titleEl.id);
  }
  
  // Aggiorna aria-label del pulsante close
  const closeBtn = UNIFIED_DRAWER._panel.querySelector('.glossary-drawer-close');
  if (closeBtn) {
    closeBtn.setAttribute('aria-label', i18n.t('common.close'));
  }
  
  // Carica contenuto
  if (UNIFIED_DRAWER._content) {
    // Rimuovi classe search se presente (per distinguere contenuto schede da glossario)
    UNIFIED_DRAWER._content.classList.remove('has-search');
    
    if (typeof content === 'string') {
      UNIFIED_DRAWER._content.innerHTML = content;
      // Se non c'è search/filters, è contenuto di una scheda
      if (!content.includes('glossary-drawer-search') && !content.includes('glossary-drawer-filters')) {
        UNIFIED_DRAWER._content.classList.add('module-tabs-content-wrapper');
      }
    } else if (content instanceof HTMLElement) {
      UNIFIED_DRAWER._content.innerHTML = '';
      UNIFIED_DRAWER._content.appendChild(content);
      UNIFIED_DRAWER._content.classList.add('module-tabs-content-wrapper');
    } else {
      UNIFIED_DRAWER._content.innerHTML = '';
    }
    
    // IMPORTANTE: Event delegation per click su metriche nel drawer
    // Questo assicura che i click funzionino anche se i click handler non sono bindati correttamente
    if (!UNIFIED_DRAWER._content.__metricClickBound) {
      UNIFIED_DRAWER._content.__metricClickBound = true;
      UNIFIED_DRAWER._content.addEventListener('click', async (e) => {
        // Cerca il button metric più vicino
        const metricButton = e.target.closest('.metric-inline[data-metric]');
        if (metricButton) {
          e.stopPropagation();
          e.preventDefault();
          const metricKey = metricButton.dataset.metric;
          if (metricKey) {
            Logger.debug('UnifiedDrawer', `Click su metrica nel drawer: ${metricKey}`);
            try {
              // Apri drawer glossario sopra il drawer attuale
              const { glossaryPopup } = await import('./glossary-popup.js');
              if (glossaryPopup && glossaryPopup.openTerm) {
                await glossaryPopup.openTerm(metricKey);
              }
            } catch (err) {
              Logger.error('UnifiedDrawer', 'Errore apertura drawer glossario', err);
            }
          }
        }
      }, { capture: true }); // Usa capture per intercettare prima che altri handler possano interferire
    }
  }
  
  // Apri drawer
  UNIFIED_DRAWER._overlay.hidden = false;
  UNIFIED_DRAWER._overlay.setAttribute('aria-hidden', 'false');
  UNIFIED_DRAWER._isOpen = true;
  UNIFIED_DRAWER._currentId = id || 'default';
  
  // Registra overlay nello stack (stessa logica del glossary-drawer)
  registerOverlay(UNIFIED_DRAWER._overlayId, OVERLAY_TYPES.MODULE_TABS, UNIFIED_DRAWER._overlay, UNIFIED_DRAWER._panel);
  
  Logger.debug('UnifiedDrawer', `Drawer aperto: ${id || 'default'}`);
}

function close() {
  if (!UNIFIED_DRAWER._overlay || !UNIFIED_DRAWER._isOpen) return;
  
  UNIFIED_DRAWER._overlay.hidden = true;
  UNIFIED_DRAWER._overlay.setAttribute('aria-hidden', 'true');
  UNIFIED_DRAWER._isOpen = false;
  UNIFIED_DRAWER._currentId = null;
  
  // Rimuovi overlay dallo stack
  unregisterOverlay(UNIFIED_DRAWER._overlayId);
  
  // Pulisci contenuto dopo animazione
  if (UNIFIED_DRAWER._content) {
    setTimeout(() => {
      if (!UNIFIED_DRAWER._isOpen) {
        UNIFIED_DRAWER._content.innerHTML = '';
      }
    }, 300);
  }
  
  Logger.debug('UnifiedDrawer', 'Drawer chiuso');
}

// Export
UNIFIED_DRAWER.mount = mount;
UNIFIED_DRAWER.open = open;
UNIFIED_DRAWER.close = close;

export const unifiedDrawer = UNIFIED_DRAWER;

