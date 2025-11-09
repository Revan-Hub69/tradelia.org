// /report/assets/js/components/export-menu.js
// Menu Export Dati - CSV, JSON, PDF
// Versione 2025

import Logger from '../utils/logger.js';
import { i18n } from '../utils/i18n.js';
import { exportUtils } from '../utils/export.js';

const EXPORT_MENU = {
  _button: null,
  _dropdown: null,
  _isOpen: false
};

// ===== RENDER =====
function render() {
  return `
    <div class="export-menu">
      <button class="export-menu-btn" type="button" aria-label="${i18n.t('common.export')}" aria-haspopup="true" aria-expanded="false">
        <svg class="export-menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V10M8 10L5 7M8 10L11 7M3 12H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="export-menu-text">${i18n.t('common.export')}</span>
        <svg class="export-menu-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="export-menu-dropdown" hidden>
        <button class="export-menu-option" data-export="json" type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 2H12V14H4V2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6H10M6 9H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>${i18n.t('export.json')}</span>
        </button>
        <button class="export-menu-option" data-export="csv" type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 2H12V14H4V2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 5H10M6 8H10M6 11H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>${i18n.t('export.csv')}</span>
        </button>
        <div class="export-menu-divider"></div>
        <button class="export-menu-option" data-export="pdf" type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 2H12V14H4V2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 5H10M6 8H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>${i18n.t('export.pdf')}</span>
        </button>
      </div>
    </div>
  `;
}

// ===== SETUP EVENT HANDLERS =====
function setupEventHandlers(container) {
  const btn = container.querySelector('.export-menu-btn');
  const dropdown = container.querySelector('.export-menu-dropdown');
  const options = container.querySelectorAll('.export-menu-option');

  if (!btn || !dropdown) return;

  EXPORT_MENU._button = btn;
  EXPORT_MENU._dropdown = dropdown;

  // Toggle dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !isExpanded);
    dropdown.hidden = isExpanded;
    EXPORT_MENU._isOpen = !isExpanded;
  });

  // Click su opzione export
  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const format = option.getAttribute('data-export');
      handleExport(format);
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      EXPORT_MENU._isOpen = false;
    });
  });

  // Chiudi dropdown quando si clicca fuori
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && EXPORT_MENU._isOpen) {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      EXPORT_MENU._isOpen = false;
    }
  });

  // Keyboard navigation
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    } else if (e.key === 'Escape') {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      EXPORT_MENU._isOpen = false;
    }
  });
}

// ===== HANDLE EXPORT =====
function handleExport(format) {
  try {
    let success = false;

    switch (format) {
      case 'json':
        success = exportUtils.exportReportJSON();
        break;
      case 'csv':
        success = exportUtils.exportMetricsCSV();
        break;
      case 'pdf':
        success = exportUtils.exportPDF();
        break;
      default:
        Logger.warn('ExportMenu', `Formato non supportato: ${format}`);
        return;
    }

    if (success) {
      Logger.debug('ExportMenu', `Export ${format} completato`);
      // TODO: Mostra notifica successo
    } else {
      Logger.error('ExportMenu', `Export ${format} fallito`);
      // TODO: Mostra notifica errore
    }
  } catch (err) {
    Logger.error('ExportMenu', 'Errore export', err);
  }
}

// ===== PUBLIC API =====
export const exportMenu = {
  /**
   * Renderizza menu export
   * @param {HTMLElement} container - Container per menu
   * @returns {HTMLElement} Elemento menu
   */
  render(container) {
    if (!container) {
      Logger.error('ExportMenu', 'Container non fornito');
      return null;
    }

    container.innerHTML = render();
    setupEventHandlers(container);

    // Aggiorna traduzioni quando cambia lingua
    window.addEventListener('languageChanged', () => {
      container.innerHTML = render();
      setupEventHandlers(container);
    });

    Logger.debug('ExportMenu', 'Menu export renderizzato');
    return container.firstElementChild;
  }
};

