// /report/assets/js/components/site-header.js
// Componente Header principale - Brand/Logo
// Coerente con architettura modulare

import Logger from '../utils/logger.js';
import { exportMenu } from './export-menu.js';
import { authModal } from './auth-modal.js';
import { supabase } from '../supabase-client.js';

const HEADER = {
  _node: null,
  _container: null,
  _authListener: null,
  _currentUser: null
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
        <a href="/dashboard.html" class="header-dashboard-link" aria-label="Dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Dashboard</span>
        </a>
        <div class="header-auth">
          <button type="button" class="header-user-link" data-auth-action="account" aria-label="Area utente">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span>Accedi</span>
          </button>
        </div>
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
  
  authModal.init();
  bindAuthActions(node);
  syncAuthState(node);

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
  update
};

function bindAuthActions(node) {
  const accountBtn = node.querySelector('[data-auth-action="account"]');

  if (accountBtn) {
    accountBtn.addEventListener('click', () => {
      if (HEADER._currentUser) {
        window.location.href = '/user/';
      } else {
        authModal.open('login');
      }
    });
  }
}

async function syncAuthState(node) {
  const accountBtn = node.querySelector('[data-auth-action="account"]');

  try {
    const { data } = await supabase.auth.getSession();
    HEADER._currentUser = data?.session?.user || null;
    toggleAccountButton(accountBtn, HEADER._currentUser);
  } catch (err) {
    Logger.warn('SiteHeader', 'Impossibile leggere sessione', err);
  }

  if (!HEADER._authListener) {
    HEADER._authListener = supabase.auth.onAuthStateChange((_event, session) => {
      HEADER._currentUser = session?.user || null;
      toggleAccountButton(accountBtn, HEADER._currentUser);
    }).data;
  }
}

function toggleAccountButton(accountBtn, user) {
  if (!accountBtn) return;
  const label = accountBtn.querySelector('span');
  if (user) {
    label && (label.textContent = 'Area');
    accountBtn.classList.add('header-user-link--auth');
    accountBtn.setAttribute('title', 'Vai alla tua area utente');
  } else {
    label && (label.textContent = 'Accedi');
    accountBtn.classList.remove('header-user-link--auth');
    accountBtn.setAttribute('title', 'Accedi con le credenziali Tradelia');
  }
}

