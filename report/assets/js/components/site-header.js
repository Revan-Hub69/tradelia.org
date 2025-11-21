// /report/assets/js/components/site-header.js
// Componente Header principale - Brand/Logo
// Coerente con architettura modulare

import Logger from '../utils/logger.js';
import { exportMenu } from './export-menu.js';

const HEADER = {
  _node: null,
  _container: null,
};

// ===== UTILITIES =====
function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

// ===== RENDER =====
function render(options = {}) {
  const showExport = options.showExport === true; // Solo per pagine report

  return `
    <div class="container">
      <a href="/index.html" class="brand" aria-label="Tradelia.org - Homepage">
        <span class="brand-word">TRADELIA</span>
        <span class="brand-dot" aria-hidden="true"></span>
        <span class="brand-suffix">AI</span>
      </a>
      <div class="header-actions">
        <a href="#" class="header-dashboard-link" aria-label="Dashboard" data-dashboard-handler="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Dashboard</span>
        </a>
        ${showExport ? '<div id="header-export-menu-slot"></div>' : ''}
      </div>
    </div>
  `;
}

// ===== MOUNT =====
function mount(containerEl, options = {}) {
  if (!containerEl) {
    Logger.error('SiteHeader', 'mount: containerEl non fornito');
    return null;
  }

  if (HEADER._node) {
    Logger.warn('SiteHeader', 'Header già montato');
    return HEADER._node;
  }

  const node = createEl('header', 'hdr');
  node.innerHTML = render(options);

  containerEl.appendChild(node);

  HEADER._node = node;
  HEADER._container = containerEl;

  // Renderizza menu export solo se showExport è true
  const exportSlot = node.querySelector('#header-export-menu-slot');
  if (exportSlot) {
    exportMenu.render(exportSlot);
  }

  Logger.debug('SiteHeader', 'Header montato');
  return node;
}

// ===== UPDATE =====
function update(data = {}) {
  if (!HEADER._node) {
    Logger.warn('SiteHeader', 'update: header non montato');
    return;
  }

  // Se richiesto, aggiorna header completo
  if (data.refresh) {
    const showExport = HEADER._node.querySelector('#header-export-menu-slot') !== null;
    HEADER._node.innerHTML = render({ showExport });
    const exportSlot = HEADER._node.querySelector('#header-export-menu-slot');
    if (exportSlot) {
      exportMenu.render(exportSlot);
    }
  }

  Logger.debug('SiteHeader', 'Header aggiornato');
}

// ===== PUBLIC API =====
export const siteHeader = {
  mount,
  update,
};
