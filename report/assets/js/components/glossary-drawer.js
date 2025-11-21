// /report/assets/js/components/glossary-drawer.js
// Drawer Glossario - Versione standalone
// Apre come drawer separato (non dentro popup)

import Logger from '../utils/logger.js';
import { registerOverlay, unregisterOverlay, OVERLAY_TYPES } from '../utils/overlay-manager.js';
import { i18n } from '../utils/i18n.js';

const GLOSSARY_DRAWER = {
  _overlay: null,
  _panel: null,
  _isOpen: false,
  _data: null,
  _overlayId: 'glossary-drawer',
};

// ===== UTILITIES =====
function createEl(tag, className, text = null) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== null) el.textContent = text;
  return el;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== DATA LOADING =====
async function loadGlossaryData() {
  if (GLOSSARY_DRAWER._data) return GLOSSARY_DRAWER._data;

  try {
    let res = await fetch('/glossario.json', { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    }

    if (res.ok) {
      GLOSSARY_DRAWER._data = await res.json();
      Logger.debug('GlossaryDrawer', 'Glossario caricato');
      return GLOSSARY_DRAWER._data;
    }
  } catch (err) {
    Logger.warn('GlossaryDrawer', 'Errore caricamento glossario', err);
  }

  GLOSSARY_DRAWER._data = {};
  return GLOSSARY_DRAWER._data;
}

// ===== RENDERING =====
function renderGlossary() {
  if (!GLOSSARY_DRAWER._panel || !GLOSSARY_DRAWER._data) return;

  const data = GLOSSARY_DRAWER._data;
  const terms = Object.entries(data).filter(([key]) => !key.startsWith('_'));

  // Filtri dinamici
  const universi = [
    ...new Set(terms.map(([, term]) => term.universo || term.category).filter(Boolean)),
  ];
  const difficolta = [...new Set(terms.map(([, term]) => term.difficolta).filter(Boolean))];

  const contentWrapper = GLOSSARY_DRAWER._panel.querySelector('.glossary-drawer-content');
  if (!contentWrapper) return;

  contentWrapper.innerHTML = `
    <!-- Search -->
    <div class="glossary-drawer-search">
      <div class="glossary-drawer-search-wrapper">
        <svg class="glossary-drawer-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          id="glossary-drawer-search-input" 
          class="glossary-drawer-search-input" 
          placeholder="${i18n.t('glossary.search.placeholder')}"
          aria-label="${i18n.t('glossary.search.ariaLabel')}"
        />
      </div>
    </div>
    
    <!-- Filters -->
    <div class="glossary-drawer-filters">
      <div class="glossary-drawer-filter-group">
        <label class="glossary-drawer-filter-label">${i18n.t('glossary.filter.universe')}</label>
        <div class="glossary-drawer-filter-buttons" data-filter="universo">
          <button class="glossary-drawer-filter-btn active" data-value="all" type="button">${i18n.t('glossary.filter.all')}</button>
          ${universi
            .map(
              (u) => `
            <button class="glossary-drawer-filter-btn" data-value="${escapeHtml(u)}" type="button">${escapeHtml(u)}</button>
          `
            )
            .join('')}
        </div>
      </div>
      
      <div class="glossary-drawer-filter-group">
        <label class="glossary-drawer-filter-label">${i18n.t('glossary.filter.difficulty')}</label>
        <div class="glossary-drawer-filter-buttons" data-filter="difficolta">
          <button class="glossary-drawer-filter-btn active" data-value="all" type="button">${i18n.t('glossary.filter.allDifficulties')}</button>
          ${difficolta
            .map(
              (d) => `
            <button class="glossary-drawer-filter-btn" data-value="${escapeHtml(d)}" type="button">${escapeHtml(d)}</button>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="glossary-drawer-stats">
      <span id="glossary-drawer-stats-text">${terms.length} ${i18n.t('glossary.stats')}</span>
    </div>
    
    <!-- Terms List -->
    <div id="glossary-drawer-terms" class="glossary-drawer-terms">
      ${renderTermsList(terms)}
    </div>
  `;

  // Event listeners
  setupEventListeners();
}

function renderTermsList(terms) {
  if (!terms || terms.length === 0) {
    return `<div class="glossary-drawer-empty">${i18n.t('glossary.empty')}</div>`;
  }

  return terms
    .map(([key, term]) => {
      const nomeTecnico = term.nomeTecnico || term.title || key;
      const universo = term.universo || term.category || '';
      const difficolta = term.difficolta || '';

      return `
      <button class="glossary-drawer-term-item" data-key="${escapeHtml(key)}" type="button">
        <div class="glossary-drawer-term-header">
          <div class="glossary-drawer-term-name">${escapeHtml(nomeTecnico)}</div>
          ${universo ? `<span class="glossary-drawer-term-badge">${escapeHtml(universo)}</span>` : ''}
        </div>
        ${
          term.definizioneAccademica || term.what
            ? `
          <div class="glossary-drawer-term-desc">${escapeHtml((term.definizioneAccademica || term.what || '').substring(0, 100))}${(term.definizioneAccademica || term.what || '').length > 100 ? '...' : ''}</div>
        `
            : ''
        }
      </button>
    `;
    })
    .join('');
}

function setupEventListeners() {
  if (!GLOSSARY_DRAWER._panel) return;

  // Search
  const searchInput = GLOSSARY_DRAWER._panel.querySelector('#glossary-drawer-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterTerms);
  }

  // Filters
  const filterButtons = GLOSSARY_DRAWER._panel.querySelectorAll('.glossary-drawer-filter-btn');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.glossary-drawer-filter-buttons');
      group
        .querySelectorAll('.glossary-drawer-filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filterTerms();
    });
  });

  // Terms
  const termItems = GLOSSARY_DRAWER._panel.querySelectorAll('.glossary-drawer-term-item');
  termItems.forEach((item) => {
    item.addEventListener('click', () => {
      const key = item.dataset.key;
      openTermDetail(key);
    });
  });
}

function filterTerms() {
  if (!GLOSSARY_DRAWER._data || !GLOSSARY_DRAWER._panel) return;

  const searchQuery =
    GLOSSARY_DRAWER._panel
      .querySelector('#glossary-drawer-search-input')
      ?.value.toLowerCase()
      .trim() || '';
  const universoFilter =
    GLOSSARY_DRAWER._panel.querySelector(
      '[data-filter="universo"] .glossary-drawer-filter-btn.active'
    )?.dataset.value || 'all';
  const difficoltaFilter =
    GLOSSARY_DRAWER._panel.querySelector(
      '[data-filter="difficolta"] .glossary-drawer-filter-btn.active'
    )?.dataset.value || 'all';

  const terms = Object.entries(GLOSSARY_DRAWER._data).filter(([key, term]) => {
    if (key.startsWith('_')) return false;

    if (universoFilter !== 'all') {
      const termUniverso = term.universo || term.category;
      if (termUniverso !== universoFilter) return false;
    }

    if (difficoltaFilter !== 'all') {
      if (term.difficolta !== difficoltaFilter) return false;
    }

    if (searchQuery) {
      const searchable = [
        key.toLowerCase(),
        term.nomeTecnico?.toLowerCase() || term.title?.toLowerCase() || '',
        term.definizioneAccademica?.toLowerCase() || term.what?.toLowerCase() || '',
        term.spiegazioneAI?.toLowerCase() || term.how?.toLowerCase() || '',
        term.universo?.toLowerCase() || term.category?.toLowerCase() || '',
        term.difficolta?.toLowerCase() || '',
      ].join(' ');

      if (!searchable.includes(searchQuery)) return false;
    }

    return true;
  });

  const termsContainer = GLOSSARY_DRAWER._panel.querySelector('#glossary-drawer-terms');
  if (termsContainer) {
    termsContainer.innerHTML = renderTermsList(terms);

    // Re-attach event listeners
    const termItems = termsContainer.querySelectorAll('.glossary-drawer-term-item');
    termItems.forEach((item) => {
      item.addEventListener('click', () => {
        const key = item.dataset.key;
        openTermDetail(key);
      });
    });
  }

  const statsText = GLOSSARY_DRAWER._panel.querySelector('#glossary-drawer-stats-text');
  if (statsText) {
    const total = Object.keys(GLOSSARY_DRAWER._data).filter((k) => !k.startsWith('_')).length;
    if (terms.length === total) {
      statsText.textContent = `${total} ${i18n.t('glossary.stats')}`;
    } else {
      statsText.textContent = i18n
        .t('glossary.stats.showing')
        .replace('{count}', terms.length)
        .replace('{total}', total);
    }
  }
}

async function openTermDetail(key) {
  if (!GLOSSARY_DRAWER._data || !key) return;

  const term = GLOSSARY_DRAWER._data[key];
  if (!term) return;

  // Apri drawer glossario (stesso sistema di glossario.html)
  try {
    const { glossaryPopup } = await import('./glossary-popup.js');
    if (glossaryPopup && glossaryPopup.openTerm) {
      await glossaryPopup.openTerm(key);
    }
  } catch (err) {
    Logger.error('GlossaryDrawer', 'Errore apertura drawer glossario', err);
  }
}

// ===== MOUNT =====
function mount() {
  if (GLOSSARY_DRAWER._overlay) return;

  // Create overlay
  GLOSSARY_DRAWER._overlay = createEl('div', 'glossary-drawer-overlay');
  GLOSSARY_DRAWER._overlay.setAttribute('aria-modal', 'true');
  GLOSSARY_DRAWER._overlay.setAttribute('aria-hidden', 'true');
  GLOSSARY_DRAWER._overlay.hidden = true;

  // Create panel
  GLOSSARY_DRAWER._panel = createEl('div', 'glossary-drawer-panel');
  GLOSSARY_DRAWER._panel.setAttribute('role', 'dialog');
  GLOSSARY_DRAWER._panel.setAttribute('aria-labelledby', 'glossary-drawer-title');

  // Header
  const header = createEl('header', 'glossary-drawer-header');
  header.innerHTML = `
    <h2 id="glossary-drawer-title" class="glossary-drawer-title">${i18n.t('glossary.title')}</h2>
    <button class="glossary-drawer-close" aria-label="${i18n.t('common.close')}" type="button">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  GLOSSARY_DRAWER._panel.appendChild(header);

  // Content wrapper
  const contentWrapper = createEl('div', 'glossary-drawer-content');
  GLOSSARY_DRAWER._panel.appendChild(contentWrapper);

  // Close handlers
  header
    .querySelector('.glossary-drawer-close')
    .addEventListener('click', () => GLOSSARY_DRAWER.close());
  GLOSSARY_DRAWER._overlay.addEventListener('click', (e) => {
    if (e.target === GLOSSARY_DRAWER._overlay) GLOSSARY_DRAWER.close();
  });

  // Listener per close request dall'overlay manager (ESC key)
  GLOSSARY_DRAWER._overlay.addEventListener('overlay-close-request', (e) => {
    if (e.detail.id === GLOSSARY_DRAWER._overlayId) {
      GLOSSARY_DRAWER.close();
    }
  });

  GLOSSARY_DRAWER._overlay.appendChild(GLOSSARY_DRAWER._panel);
  document.body.appendChild(GLOSSARY_DRAWER._overlay);

  Logger.debug('GlossaryDrawer', 'Drawer montato');
}

// ===== PUBLIC API =====
async function open() {
  if (!GLOSSARY_DRAWER._overlay) mount();

  // Load glossary
  await loadGlossaryData();

  // Render
  renderGlossary();

  GLOSSARY_DRAWER._overlay.hidden = false;
  GLOSSARY_DRAWER._overlay.setAttribute('aria-hidden', 'false');
  GLOSSARY_DRAWER._isOpen = true;

  // Registra overlay nello stack (gestisce z-index e overflow)
  // Passa anche il panel come drawerEl per z-index corretto
  registerOverlay(
    GLOSSARY_DRAWER._overlayId,
    OVERLAY_TYPES.GLOSSARY,
    GLOSSARY_DRAWER._overlay,
    GLOSSARY_DRAWER._panel
  );

  // Focus search
  const searchInput = GLOSSARY_DRAWER._panel.querySelector('#glossary-drawer-search-input');
  if (searchInput) {
    setTimeout(() => searchInput.focus(), 100);
  }

  Logger.debug('GlossaryDrawer', 'Drawer aperto');
}

function close() {
  if (!GLOSSARY_DRAWER._overlay || !GLOSSARY_DRAWER._isOpen) return;

  GLOSSARY_DRAWER._overlay.hidden = true;
  GLOSSARY_DRAWER._overlay.setAttribute('aria-hidden', 'true');
  GLOSSARY_DRAWER._isOpen = false;

  // Rimuovi overlay dallo stack (gestisce overflow automaticamente)
  unregisterOverlay(GLOSSARY_DRAWER._overlayId);

  Logger.debug('GlossaryDrawer', 'Drawer chiuso');
}

// Export
GLOSSARY_DRAWER.mount = mount;
GLOSSARY_DRAWER.open = open;
GLOSSARY_DRAWER.close = close;

export const glossaryDrawer = GLOSSARY_DRAWER;
