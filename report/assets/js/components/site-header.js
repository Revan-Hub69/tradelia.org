// /report/assets/js/components/site-header.js
// Componente Header principale - Brand/Logo
// Coerente con architettura modulare

import Logger from '../utils/logger.js';

const HEADER = {
  _node: null,
  _container: null
};

// ===== UTILITIES =====
function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

// ===== RENDER =====
function render() {
  return `
    <div class="container">
      <a href="/index.html" class="brand" aria-label="Tradelia.org - Homepage">
        <span class="brand-word">TRADELIA</span>
        <span class="brand-dot" aria-hidden="true"></span>
        <span class="brand-suffix">AI</span>
      </a>
      <a href="/dashboard.html" class="header-dashboard-link" aria-label="Dashboard">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Dashboard</span>
      </a>
    </div>
  `;
}

// ===== MOUNT =====
function mount(containerEl) {
  if (!containerEl) {
    Logger.error('SiteHeader', 'mount: containerEl non fornito');
    return null;
  }
  
  if (HEADER._node) {
    Logger.warn('SiteHeader', 'Header già montato');
    return HEADER._node;
  }
  
  const node = createEl('header', 'hdr');
  node.innerHTML = render();
  
  containerEl.appendChild(node);
  
  HEADER._node = node;
  HEADER._container = containerEl;
  
  Logger.debug('SiteHeader', 'Header montato');
  return node;
}

// ===== UPDATE =====
function update(data = {}) {
  if (!HEADER._node) {
    Logger.warn('SiteHeader', 'update: header non montato');
    return;
  }
  
  // Header è statico, ma possiamo aggiornare link o altri elementi se necessario
  Logger.debug('SiteHeader', 'Header aggiornato');
}

// ===== PUBLIC API =====
export const siteHeader = {
  mount,
  update
};

