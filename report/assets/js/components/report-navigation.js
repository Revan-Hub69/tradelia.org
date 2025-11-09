// /report/assets/js/components/report-navigation.js
// Navigazione Report - Indice Interattivo, Breadcrumb, Ricerca
// Versione 2025 - Design Istituzionale

import Logger from '../utils/logger.js';
import { userPreferences } from '../utils/user-preferences.js';

const REPORT_NAVIGATION = {
  _indexContainer: null,
  _breadcrumbContainer: null,
  _searchContainer: null,
  _modules: [],
  _currentModule: null,
  _searchResults: []
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
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ===== INDICE INTERATTIVO =====
function renderIndex(modules) {
  if (!modules || modules.length === 0) return '';

  const indexHTML = modules.map((module, index) => {
    const modId = module.id || `module-${index}`;
    const modTitle = module.title || module.badge || `Modulo ${index + 1}`;
    const modStatus = module.status || 'ACTIVE';
    const isActive = module.isActive || false;

    return `
      <a href="#${modId}" 
         class="report-index-item ${isActive ? 'is-active' : ''}" 
         data-module-id="${modId}"
         data-status="${modStatus}">
        <span class="report-index-badge">${escapeHtml(module.badge || '')}</span>
        <span class="report-index-title-text">${escapeHtml(modTitle)}</span>
        <span class="report-index-status" data-status="${modStatus}"></span>
      </a>
    `;
  }).join('');

  return `
    <nav class="report-index" role="navigation" aria-label="Indice moduli report">
      <div class="report-index-header">
        <h3 class="report-index-title">Indice Moduli</h3>
        <button class="report-index-toggle" aria-label="Espandi/Comprimi indice" type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="report-index-list">
        ${indexHTML}
      </div>
    </nav>
  `;
}

// ===== BREADCRUMB =====
function renderBreadcrumb(module) {
  if (!module) return '';

  return `
    <nav class="report-breadcrumb" role="navigation" aria-label="Breadcrumb">
      <ol class="report-breadcrumb-list">
        <li class="report-breadcrumb-item">
          <a href="/report" class="report-breadcrumb-link">Report</a>
        </li>
        <li class="report-breadcrumb-item" aria-current="page">
          <span class="report-breadcrumb-separator">/</span>
          <span class="report-breadcrumb-current">${escapeHtml(module.title || module.badge || 'Modulo')}</span>
        </li>
      </ol>
    </nav>
  `;
}

// ===== RICERCA FULL-TEXT =====
function renderSearch() {
  return `
    <div class="report-search">
      <div class="report-search-input-wrapper">
        <svg class="report-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM13 13l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input 
          type="search" 
          class="report-search-input" 
          placeholder="Cerca nel report..." 
          aria-label="Cerca nel report"
          autocomplete="off"
        />
        <button class="report-search-clear" aria-label="Cancella ricerca" type="button" hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="report-search-results" hidden></div>
    </div>
  `;
}

// ===== RICERCA NEI MODULI =====
function searchInModules(query, modules) {
  if (!query || query.length < 2) return [];

  const results = [];
  const lowerQuery = query.toLowerCase();

  modules.forEach((module, moduleIndex) => {
    // Cerca nel titolo
    if (module.title && module.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        type: 'title',
        module: moduleIndex,
        moduleId: module.id,
        text: module.title,
        match: query
      });
    }

    // Cerca nella descrizione
    if (module.desc && module.desc.toLowerCase().includes(lowerQuery)) {
      results.push({
        type: 'desc',
        module: moduleIndex,
        moduleId: module.id,
        text: module.desc,
        match: query
      });
    }

    // Cerca nelle metriche (se disponibili)
    if (module.metrics) {
      module.metrics.forEach((metric, metricIndex) => {
        const metricText = `${metric.key || ''} ${metric.value || ''} ${metric.label || ''}`.toLowerCase();
        if (metricText.includes(lowerQuery)) {
          results.push({
            type: 'metric',
            module: moduleIndex,
            moduleId: module.id,
            metricIndex,
            text: `${metric.label || metric.key}: ${metric.value}`,
            match: query
          });
        }
      });
    }
  });

  return results;
}

function renderSearchResults(results, query) {
  if (results.length === 0) {
    return `
      <div class="report-search-results-empty">
        Nessun risultato per "${escapeHtml(query)}"
      </div>
    `;
  }

  const resultsHTML = results.map(result => {
    const module = REPORT_NAVIGATION._modules[result.module];
    return `
      <a href="#${result.moduleId}" 
         class="report-search-result-item" 
         data-module-id="${result.moduleId}"
         data-result-type="${result.type}">
        <span class="report-search-result-badge">${escapeHtml(module?.badge || '')}</span>
        <span class="report-search-result-text">
          <strong>${escapeHtml(result.type === 'title' ? 'Titolo' : result.type === 'desc' ? 'Descrizione' : 'Metrica')}:</strong>
          ${highlightMatch(result.text, query)}
        </span>
      </a>
    `;
  }).join('');

  return `
    <div class="report-search-results-list">
      ${resultsHTML}
    </div>
    <div class="report-search-results-count">
      ${results.length} risultato${results.length !== 1 ? 'i' : ''} trovato${results.length !== 1 ? 'i' : ''}
    </div>
  `;
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== SCROLL TRACKING =====
function updateActiveModule() {
  const modules = REPORT_NAVIGATION._modules;
  if (!modules || modules.length === 0) return;

  const scrollPosition = window.scrollY + 100; // Offset per header
  let activeModule = null;

  modules.forEach(module => {
    const element = document.getElementById(module.id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementBottom = elementTop + rect.height;

      if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
        activeModule = module.id;
      }
    }
  });

  if (activeModule && activeModule !== REPORT_NAVIGATION._currentModule) {
    REPORT_NAVIGATION._currentModule = activeModule;
    updateIndexActiveState(activeModule);
  }
}

function updateIndexActiveState(activeModuleId) {
  const indexItems = document.querySelectorAll('.report-index-item');
  indexItems.forEach(item => {
    const moduleId = item.getAttribute('data-module-id');
    if (moduleId === activeModuleId) {
      item.classList.add('is-active');
      // Scroll indice per mostrare elemento attivo
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      item.classList.remove('is-active');
    }
  });
}

// ===== EVENT HANDLERS =====
function setupEventHandlers() {
  // Ricerca
  const searchInput = document.querySelector('.report-search-input');
  const searchClear = document.querySelector('.report-search-clear');
  const searchResults = document.querySelector('.report-search-results');

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        searchResults.hidden = true;
        searchClear.hidden = true;
        REPORT_NAVIGATION._searchResults = [];
        return;
      }

      searchClear.hidden = false;

      searchTimeout = setTimeout(() => {
        const results = searchInModules(query, REPORT_NAVIGATION._modules);
        REPORT_NAVIGATION._searchResults = results;
        
        // Salva in storia ricerca
        userPreferences.addSearchHistory(query);
        
        if (results.length > 0) {
          searchResults.innerHTML = renderSearchResults(results, query);
          searchResults.hidden = false;
        } else {
          searchResults.innerHTML = renderSearchResults([], query);
          searchResults.hidden = false;
        }
      }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchResults.hidden = true;
        searchClear.hidden = true;
        REPORT_NAVIGATION._searchResults = [];
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchResults.hidden = true;
      searchClear.hidden = true;
      REPORT_NAVIGATION._searchResults = [];
      searchInput.focus();
    });
  }

  // Click su risultati ricerca
  if (searchResults) {
    searchResults.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.report-search-result-item');
      if (resultItem) {
        const moduleId = resultItem.getAttribute('data-module-id');
        scrollToModule(moduleId);
        searchResults.hidden = true;
      }
    });
  }

  // Toggle indice
  const indexToggle = document.querySelector('.report-index-toggle');
  if (indexToggle) {
    indexToggle.addEventListener('click', () => {
      const index = document.querySelector('.report-index');
      if (index) {
        index.classList.toggle('is-collapsed');
        const isCollapsed = index.classList.contains('is-collapsed');
        indexToggle.setAttribute('aria-expanded', !isCollapsed);
        // Salva preferenza
        userPreferences.set('indexCollapsed', isCollapsed);
      }
    });
  }

  // Click su indice
  const indexItems = document.querySelectorAll('.report-index-item');
  indexItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const moduleId = item.getAttribute('data-module-id');
      scrollToModule(moduleId);
    });
  });

  // Scroll tracking
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveModule, 100);
  });

  // Hash change (per deep linking)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      scrollToModule(hash);
    }
  });
}

function scrollToModule(moduleId) {
  const element = document.getElementById(moduleId);
  if (element) {
    const headerHeight = 64; // Altezza header fisso
    const offset = element.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
    
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });

    // Aggiorna hash (senza triggerare hashchange)
    if (window.location.hash !== `#${moduleId}`) {
      history.pushState(null, '', `#${moduleId}`);
    }

    REPORT_NAVIGATION._currentModule = moduleId;
    updateIndexActiveState(moduleId);
  }
}

// ===== PUBLIC API =====
export const reportNavigation = {
  /**
   * Inizializza navigazione report
   * @param {Object} config - Configurazione
   * @param {Array} config.modules - Array moduli con {id, badge, title, desc, status}
   * @param {HTMLElement} config.indexContainer - Container per indice
   * @param {HTMLElement} config.breadcrumbContainer - Container per breadcrumb
   * @param {HTMLElement} config.searchContainer - Container per ricerca
   */
  init(config = {}) {
    const { modules = [], indexContainer, breadcrumbContainer, searchContainer } = config;

    REPORT_NAVIGATION._modules = modules;

    // Render indice
    if (indexContainer) {
      REPORT_NAVIGATION._indexContainer = indexContainer;
      indexContainer.innerHTML = renderIndex(modules);
      
      // Ripristina stato collassato da preferenze
      const isCollapsed = userPreferences.get('indexCollapsed', false);
      if (isCollapsed) {
        const index = indexContainer.querySelector('.report-index');
        if (index) {
          index.classList.add('is-collapsed');
          const toggle = indexContainer.querySelector('.report-index-toggle');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    }

    // Render breadcrumb (solo se c'è un modulo corrente)
    if (breadcrumbContainer && modules.length > 0) {
      REPORT_NAVIGATION._breadcrumbContainer = breadcrumbContainer;
      const currentModule = modules.find(m => m.isActive) || modules[0];
      breadcrumbContainer.innerHTML = renderBreadcrumb(currentModule);
    }

    // Render ricerca
    if (searchContainer) {
      REPORT_NAVIGATION._searchContainer = searchContainer;
      searchContainer.innerHTML = renderSearch();
    }

    // Setup event handlers
    setupEventHandlers();

    // Inizializza scroll tracking
    updateActiveModule();

    Logger.debug('ReportNavigation', 'Navigazione inizializzata', { modulesCount: modules.length });
  },

  /**
   * Aggiorna modulo corrente
   * @param {string} moduleId - ID modulo corrente
   */
  setCurrentModule(moduleId) {
    REPORT_NAVIGATION._currentModule = moduleId;
    updateIndexActiveState(moduleId);

    // Aggiorna breadcrumb
    if (REPORT_NAVIGATION._breadcrumbContainer) {
      const module = REPORT_NAVIGATION._modules.find(m => m.id === moduleId);
      if (module) {
        REPORT_NAVIGATION._breadcrumbContainer.innerHTML = renderBreadcrumb(module);
      }
    }
  },

  /**
   * Aggiungi moduli alla navigazione
   * @param {Array} modules - Array moduli
   */
  addModules(modules) {
    REPORT_NAVIGATION._modules.push(...modules);
    
    if (REPORT_NAVIGATION._indexContainer) {
      REPORT_NAVIGATION._indexContainer.innerHTML = renderIndex(REPORT_NAVIGATION._modules);
      setupEventHandlers();
    }
  }
};

