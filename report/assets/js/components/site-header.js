// /report/assets/js/components/site-header.js
// Componente Header principale - Brand/Logo
// Coerente con architettura modulare

import Logger from '../utils/logger.js';
import { i18n } from '../utils/i18n.js';
import { exportMenu } from './export-menu.js';

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
function render(options = {}) {
  const currentLang = i18n.getLanguage();
  const showExport = options.showExport === true; // Solo per pagine report
  
  return `
    <div class="container">
      <a href="/index.html" class="brand" aria-label="Tradelia.org - Homepage">
        <span class="brand-word">TRADELIA</span>
        <span class="brand-dot" aria-hidden="true"></span>
        <span class="brand-suffix">AI</span>
      </a>
      <div class="header-actions">
        <a href="/dashboard.html" class="header-dashboard-link" aria-label="${i18n.t('nav.dashboard')}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span data-i18n="nav.dashboard">${i18n.t('nav.dashboard')}</span>
        </a>
        ${showExport ? '<div id="header-export-menu-slot"></div>' : ''}
        <div class="header-language-selector">
          <button class="header-lang-btn" type="button" aria-label="${i18n.t('prefs.language')}" aria-haspopup="true" aria-expanded="false">
            <span class="header-lang-flag">${currentLang === 'en' ? '🇬🇧' : '🇮🇹'}</span>
            <span class="header-lang-code">${currentLang.toUpperCase()}</span>
            <svg class="header-lang-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-lang-dropdown" hidden style="display: none !important;">
            <button class="header-lang-option ${currentLang === 'it' ? 'is-active' : ''}" data-lang="it" type="button">
              <span class="header-lang-flag">🇮🇹</span>
              <span class="header-lang-name">${i18n.t('prefs.language.it')}</span>
            </button>
            <button class="header-lang-option ${currentLang === 'en' ? 'is-active' : ''}" data-lang="en" type="button">
              <span class="header-lang-flag">🇬🇧</span>
              <span class="header-lang-name">${i18n.t('prefs.language.en')}</span>
            </button>
          </div>
        </div>
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
  
  // Setup event handlers per selettore lingua
  setupLanguageSelector(node);
  
  // Renderizza menu export solo se showExport è true
  const exportSlot = node.querySelector('#header-export-menu-slot');
  if (exportSlot) {
    exportMenu.render(exportSlot);
  }
  
  // Ascolta cambiamenti lingua per aggiornare UI
  window.addEventListener('languageChanged', () => {
    updateLanguageSelector(node);
    // Aggiorna anche menu export
    if (exportSlot) {
      exportMenu.render(exportSlot);
    }
    // Aggiorna traduzioni elementi dopo un breve delay
    setTimeout(() => {
      i18n.translatePage();
    }, 50);
  });
  
  Logger.debug('SiteHeader', 'Header montato');
  return node;
}

// ===== LANGUAGE SELECTOR =====
function setupLanguageSelector(headerNode) {
  const langBtn = headerNode.querySelector('.header-lang-btn');
  const langDropdown = headerNode.querySelector('.header-lang-dropdown');
  const langOptions = headerNode.querySelectorAll('.header-lang-option');
  
  if (!langBtn || !langDropdown) return;
  
  // FORZA chiusura dropdown all'inizio
  langDropdown.setAttribute('hidden', '');
  langDropdown.style.display = 'none';
  langBtn.setAttribute('aria-expanded', 'false');
  
  // Toggle dropdown
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = langBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      // Chiudi
      langDropdown.setAttribute('hidden', '');
      langDropdown.style.display = 'none';
      langBtn.setAttribute('aria-expanded', 'false');
    } else {
      // Apri
      langDropdown.removeAttribute('hidden');
      langDropdown.style.display = 'flex';
      langBtn.setAttribute('aria-expanded', 'true');
    }
  });
  
  // Click su opzione lingua
  langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = option.getAttribute('data-lang');
      if (lang && i18n.setLanguage(lang)) {
        langDropdown.setAttribute('hidden', '');
        langDropdown.style.display = 'none';
        langBtn.setAttribute('aria-expanded', 'false');
        updateLanguageSelector(headerNode);
      }
    });
  });
  
  // Chiudi dropdown quando si clicca fuori
  const closeDropdown = () => {
    langDropdown.setAttribute('hidden', '');
    langDropdown.style.display = 'none';
    langBtn.setAttribute('aria-expanded', 'false');
  };
  
  // Gestione click esterno
  const handleClickOutside = (e) => {
    // Se clic dentro header ma non dentro language selector, chiudi
    if (headerNode.contains(e.target)) {
      if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
        closeDropdown();
      }
    } else {
      // Clic fuori header, chiudi
      closeDropdown();
    }
  };
  
  // Usa capture per intercettare prima
  document.addEventListener('click', handleClickOutside, true);
  
  // Chiudi quando si apre export menu
  const exportMenuBtn = headerNode.querySelector('.export-menu-btn');
  if (exportMenuBtn) {
    exportMenuBtn.addEventListener('click', () => {
      closeDropdown();
    });
  }
  
  // Keyboard navigation
  langBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      langBtn.click();
    } else if (e.key === 'Escape') {
      langDropdown.hidden = true;
      langBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function updateLanguageSelector(headerNode) {
  const langBtn = headerNode.querySelector('.header-lang-btn');
  const langFlag = headerNode.querySelector('.header-lang-flag');
  const langCode = headerNode.querySelector('.header-lang-code');
  const langOptions = headerNode.querySelectorAll('.header-lang-option');
  
  if (!langBtn) return;
  
  const currentLang = i18n.getLanguage();
  
  // Aggiorna flag e codice
  if (langFlag) {
    langFlag.textContent = currentLang === 'en' ? '🇬🇧' : '🇮🇹';
  }
  if (langCode) {
    langCode.textContent = currentLang.toUpperCase();
  }
  
  // Aggiorna stato attivo opzioni
  langOptions.forEach(option => {
    const lang = option.getAttribute('data-lang');
    if (lang === currentLang) {
      option.classList.add('is-active');
    } else {
      option.classList.remove('is-active');
    }
  });
}

// ===== UPDATE =====
function update(data = {}) {
  if (!HEADER._node) {
    Logger.warn('SiteHeader', 'update: header non montato');
    return;
  }
  
  // Se richiesto, aggiorna header completo (es. cambio lingua)
  if (data.refresh) {
    const showExport = HEADER._node.querySelector('#header-export-menu-slot') !== null;
    HEADER._node.innerHTML = render({ showExport });
    setupLanguageSelector(HEADER._node);
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

