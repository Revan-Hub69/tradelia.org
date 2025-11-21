// /report/assets/js/components/glossary-popup.js
// Drawer Glossario - Stesso sistema di glossario.html
// Usa /glossario.json e mostra drawer identico a glossario.html (drawer laterale, non popup)

import Logger from '../utils/logger.js';
import { registerOverlay, unregisterOverlay, OVERLAY_TYPES } from '../utils/overlay-manager.js';
import { i18n } from '../utils/i18n.js';

const GLOSSARY_POPUP = {
  _overlay: null,
  _panel: null,
  _isOpen: false,
  _data: null,
  _overlayId: 'glossary-popup',
};

// ===== UTILITIES =====
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ===== CARICAMENTO GLOSSARIO =====
async function loadGlossaryData() {
  if (GLOSSARY_POPUP._data) return GLOSSARY_POPUP._data;

  try {
    // Stesso sistema di glossario.html: prima prova /glossario.json, poi fallback
    let res = await fetch('/glossario.json', { cache: 'no-store' });

    // Fallback a glossary.json esistente se nuovo non trovato
    if (!res.ok) {
      Logger.warn('GlossaryPopup', 'Nuovo JSON non trovato, uso fallback');
      res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    }

    if (res.ok) {
      const data = await res.json();
      // Normalizza formato (supporta sia nuovo che vecchio formato)
      const terms = {};
      Object.entries(data).forEach(([key, term]) => {
        if (!key.startsWith('_')) {
          terms[key] = term;
        }
      });
      GLOSSARY_POPUP._data = terms;
      Logger.debug('GlossaryPopup', 'Glossario caricato');
      return GLOSSARY_POPUP._data;
    }
  } catch (err) {
    Logger.warn('GlossaryPopup', 'Errore caricamento glossario', err);
  }

  GLOSSARY_POPUP._data = {};
  return GLOSSARY_POPUP._data;
}

// ===== MOUNT =====
function mount() {
  if (GLOSSARY_POPUP._overlay) return;

  // Crea overlay (stessa struttura di glossario.html)
  GLOSSARY_POPUP._overlay = document.createElement('div');
  GLOSSARY_POPUP._overlay.id = 'glossary-popup-overlay';
  GLOSSARY_POPUP._overlay.className = 'glossary-popup-overlay';
  GLOSSARY_POPUP._overlay.hidden = true;

  // Crea panel (stessa struttura di glossario.html)
  GLOSSARY_POPUP._panel = document.createElement('div');
  GLOSSARY_POPUP._panel.className = 'glossary-popup-panel';
  GLOSSARY_POPUP._panel.setAttribute('role', 'dialog');
  GLOSSARY_POPUP._panel.setAttribute('aria-labelledby', 'glossary-popup-title');

  GLOSSARY_POPUP._overlay.appendChild(GLOSSARY_POPUP._panel);
  document.body.appendChild(GLOSSARY_POPUP._overlay);

  Logger.debug('GlossaryPopup', 'Drawer montato');
}

// ===== APERTURA TERMINE (DRAWER) =====
async function openTerm(key) {
  if (!GLOSSARY_POPUP._overlay) mount();

  // Carica glossario se necessario
  await loadGlossaryData();

  const term = GLOSSARY_POPUP._data[key];
  const panel = GLOSSARY_POPUP._panel;
  const overlay = GLOSSARY_POPUP._overlay;

  if (!term) {
    Logger.warn('GlossaryPopup', `Termine non trovato: ${key}`);
    // Mostra comunque il popup con messaggio informativo
    panel.innerHTML = `
      <header class="glossary-popup-header">
        <div class="glossary-popup-header-content">
          <h2 id="glossary-popup-title" class="glossary-popup-title">${escapeHtml(key)}</h2>
        </div>
        <button class="glossary-popup-close" aria-label="${i18n.t('common.close')}" type="button">×</button>
      </header>
      <div class="glossary-popup-body">
        <div class="glossary-popup-section">
          <p class="glossary-popup-section-text">${i18n.t('glossary.term.noInfo')}</p>
        </div>
      </div>
      <footer class="glossary-popup-footer">
        <button class="glossary-popup-close-bottom" type="button">${i18n.t('common.close')}</button>
      </footer>
    `;

    // Close handlers
    const closeBtn = panel.querySelector('.glossary-popup-close');
    const closeBtnBottom = panel.querySelector('.glossary-popup-close-bottom');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => GLOSSARY_POPUP.close());
    }
    if (closeBtnBottom) {
      closeBtnBottom.addEventListener('click', () => GLOSSARY_POPUP.close());
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) GLOSSARY_POPUP.close();
    });

    overlay.addEventListener('overlay-close-request', (e) => {
      if (e.detail.id === GLOSSARY_POPUP._overlayId) {
        GLOSSARY_POPUP.close();
      }
    });

    overlay.hidden = false;
    // NOTA: overflow gestito da overlay-manager.js (non impostare qui)
    GLOSSARY_POPUP._isOpen = true;
    registerOverlay(GLOSSARY_POPUP._overlayId, OVERLAY_TYPES.GLOSSARY, overlay, panel);
    return;
  }

  const title = term.nomeTecnico || term.title || key;
  const universo = term.universo || term.category;

  // Stesso HTML di glossario.html - Mostra sempre definizione accademica, spiegazione AI e fonti
  const definizioneAccademica = term.definizioneAccademica || term.what || '';
  const spiegazioneAI = term.spiegazioneAI || term.how || '';
  const fonteAccademica = term.fonteAccademica || term.source || '';

  panel.innerHTML = `
    <header class="glossary-popup-header">
      <div class="glossary-popup-header-content">
        <h2 id="glossary-popup-title" class="glossary-popup-title">${escapeHtml(title)}</h2>
        <div class="glossary-popup-badges">
          ${
            universo
              ? `
            <span class="glossary-popup-badge glossary-popup-badge--universo">${escapeHtml(universo)}</span>
          `
              : ''
          }
          ${
            term.difficolta
              ? `
            <span class="glossary-popup-badge glossary-popup-badge--difficolta ${term.difficolta.toLowerCase()}">${escapeHtml(term.difficolta)}</span>
          `
              : ''
          }
        </div>
      </div>
      <button class="glossary-popup-close" aria-label="${i18n.t('common.close')}" type="button">×</button>
    </header>
    <div class="glossary-popup-body">
      ${
        definizioneAccademica
          ? `
        <div class="glossary-popup-section">
          <h3 class="glossary-popup-section-title">${i18n.t('glossary.term.definition')}</h3>
          <p class="glossary-popup-section-text">${escapeHtml(definizioneAccademica)}</p>
        </div>
      `
          : ''
      }
      
      ${
        spiegazioneAI
          ? `
        <div class="glossary-popup-section">
          <h3 class="glossary-popup-section-title">${i18n.t('glossary.term.explanation')}</h3>
          <p class="glossary-popup-section-text">${escapeHtml(spiegazioneAI)}</p>
        </div>
      `
          : ''
      }
      
      ${
        fonteAccademica
          ? `
        <div class="glossary-popup-section">
          <h3 class="glossary-popup-section-title">${i18n.t('glossary.term.source')}</h3>
          <p class="glossary-popup-section-text glossary-popup-source">${escapeHtml(fonteAccademica)}</p>
        </div>
      `
          : ''
      }
      
      ${
        !definizioneAccademica && !spiegazioneAI && !fonteAccademica
          ? `
        <div class="glossary-popup-section">
          <p class="glossary-popup-section-text">${i18n.t('glossary.term.noInfo')}</p>
        </div>
      `
          : ''
      }
    </div>
    <footer class="glossary-popup-footer">
      <button class="glossary-popup-close-bottom" type="button">${i18n.t('common.close')}</button>
    </footer>
  `;

  // Close handlers (stesso sistema di glossario.html)
  const closeBtn = panel.querySelector('.glossary-popup-close');
  const closeBtnBottom = panel.querySelector('.glossary-popup-close-bottom');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => GLOSSARY_POPUP.close());
  }
  if (closeBtnBottom) {
    closeBtnBottom.addEventListener('click', () => GLOSSARY_POPUP.close());
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) GLOSSARY_POPUP.close();
  });

  // Listener per close request dall'overlay manager (ESC key)
  overlay.addEventListener('overlay-close-request', (e) => {
    if (e.detail.id === GLOSSARY_POPUP._overlayId) {
      GLOSSARY_POPUP.close();
    }
  });

  // Apri drawer (stesso sistema di glossario.html)
  overlay.hidden = false;
  // NOTA: overflow gestito da overlay-manager.js (non impostare qui)
  GLOSSARY_POPUP._isOpen = true;

  // Registra overlay nello stack (gestisce z-index e overflow)
  registerOverlay(GLOSSARY_POPUP._overlayId, OVERLAY_TYPES.GLOSSARY, overlay, panel);

  Logger.debug('GlossaryPopup', `Drawer aperto per termine: ${key}`);
}

// ===== CHIUSURA =====
function close() {
  if (!GLOSSARY_POPUP._overlay || !GLOSSARY_POPUP._isOpen) return;

  GLOSSARY_POPUP._overlay.hidden = true;
  // NOTA: overflow gestito da overlay-manager.js (non impostare qui)
  GLOSSARY_POPUP._isOpen = false;

  // Rimuovi overlay dallo stack (gestisce anche overflow)
  unregisterOverlay(GLOSSARY_POPUP._overlayId);

  Logger.debug('GlossaryPopup', 'Drawer chiuso');
}

// Export
GLOSSARY_POPUP.mount = mount;
GLOSSARY_POPUP.openTerm = openTerm;
GLOSSARY_POPUP.close = close;
GLOSSARY_POPUP.loadGlossaryData = loadGlossaryData;

export const glossaryPopup = GLOSSARY_POPUP;
