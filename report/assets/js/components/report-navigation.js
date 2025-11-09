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
  _searchResults: [],
  _searchTimeout: null
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
// RIMOSSO: L'indice è stato rimosso per problemi di design e funzionalità
function renderIndex(modules) {
  return '';
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
        <button class="report-search-clear" aria-label="Chiudi" type="button" hidden>
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
    const typeLabels = {
      title: 'Titolo',
      desc: 'Descrizione',
      metric: 'Metrica'
    };
    const typeLabel = typeLabels[result.type] || result.type;
    return `
      <a href="#${result.moduleId}" 
         class="report-search-result-item" 
         data-module-id="${result.moduleId}"
         data-result-type="${result.type}">
        <span class="report-search-result-badge">${escapeHtml(module?.badge || '')}</span>
        <span class="report-search-result-text">
          <strong>${escapeHtml(typeLabel)}:</strong>
          ${highlightMatch(result.text, query)}
        </span>
      </a>
    `;
  }).join('');

  const resultsCount = results.length === 1 ? 'risultato' : 'risultati';
  const foundLabel = 'trovato';

  return `
    <div class="report-search-results-list">
      ${resultsHTML}
    </div>
    <div class="report-search-results-count">
      ${results.length} ${resultsCount} ${foundLabel}
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
  if (!modules || modules.length === 0) {
    Logger.debug('ReportNavigation', 'Nessun modulo disponibile per scroll tracking');
    return;
  }

  const headerHeight = 64; // Altezza header fisso
  const scrollPosition = window.scrollY + headerHeight + 100; // Offset per header + margine
  let activeModule = null;
  let closestDistance = Infinity;

  // Trova il modulo più vicino alla posizione di scroll
  modules.forEach(module => {
    const element = document.getElementById(module.id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementBottom = elementTop + rect.height;
      const elementCenter = elementTop + (rect.height / 2);

      // Se siamo dentro il modulo
      if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
        activeModule = module.id;
      } else {
        // Calcola distanza dal centro del modulo
        const distance = Math.abs(scrollPosition - elementCenter);
        if (distance < closestDistance && elementTop < scrollPosition) {
          closestDistance = distance;
          activeModule = module.id;
        }
      }
    } else {
      Logger.warn('ReportNavigation', `Elemento con ID ${module.id} non trovato`);
    }
  });

  if (activeModule && activeModule !== REPORT_NAVIGATION._currentModule) {
    REPORT_NAVIGATION._currentModule = activeModule;
    updateIndexActiveState(activeModule);
    Logger.debug('ReportNavigation', `Modulo attivo: ${activeModule}`);
  }
}

function updateIndexActiveState(activeModuleId) {
  // RIMOSSO: L'indice è stato rimosso
  return;
}

// ===== EVENT HANDLERS =====
// Flag per evitare listener multipli
let _handlersSetup = false;
let _scrollTimeout = null;

function setupEventHandlers() {
  // Evita di aggiungere listener multipli
  if (_handlersSetup) {
    Logger.debug('ReportNavigation', 'Event handlers già configurati, skip');
    return;
  }
  
  _handlersSetup = true;
  Logger.debug('ReportNavigation', 'Configurazione event handlers');

  // Ricerca - usa event delegation sul container
  const searchContainer = REPORT_NAVIGATION._searchContainer;
  if (searchContainer) {
    // Input search
    searchContainer.addEventListener('input', (e) => {
      if (e.target.matches('.report-search-input')) {
        const searchInput = e.target;
        const searchClear = searchContainer.querySelector('.report-search-clear');
        const searchResults = searchContainer.querySelector('.report-search-results');
        const query = searchInput.value.trim();

        if (query.length < 2) {
          if (searchResults) searchResults.hidden = true;
          if (searchClear) searchClear.hidden = true;
          REPORT_NAVIGATION._searchResults = [];
          return;
        }

        if (searchClear) searchClear.hidden = false;

        clearTimeout(REPORT_NAVIGATION._searchTimeout);
        REPORT_NAVIGATION._searchTimeout = setTimeout(() => {
          const results = searchInModules(query, REPORT_NAVIGATION._modules);
          REPORT_NAVIGATION._searchResults = results;
          
          userPreferences.addSearchHistory(query);
          
          if (searchResults) {
            searchResults.innerHTML = renderSearchResults(results, query);
            searchResults.hidden = false;
          }
        }, 300);
      }
    });

    // Clear search
    searchContainer.addEventListener('click', (e) => {
      if (e.target.matches('.report-search-clear') || e.target.closest('.report-search-clear')) {
        const searchInput = searchContainer.querySelector('.report-search-input');
        const searchClear = searchContainer.querySelector('.report-search-clear');
        const searchResults = searchContainer.querySelector('.report-search-results');
        
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.hidden = true;
        if (searchClear) searchClear.hidden = true;
        REPORT_NAVIGATION._searchResults = [];
        if (searchInput) searchInput.focus();
      }
    });

    // Click su risultati ricerca
    searchContainer.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.report-search-result-item');
      if (resultItem) {
        e.preventDefault();
        const moduleId = resultItem.getAttribute('data-module-id');
        if (moduleId) {
          scrollToModule(moduleId);
          const searchResults = searchContainer.querySelector('.report-search-results');
          const searchInput = searchContainer.querySelector('.report-search-input');
          const searchClear = searchContainer.querySelector('.report-search-clear');
          if (searchResults) searchResults.hidden = true;
          if (searchInput) searchInput.value = '';
          if (searchClear) searchClear.hidden = true;
        }
      }
    });

    // Escape key
    searchContainer.addEventListener('keydown', (e) => {
      if (e.target.matches('.report-search-input') && e.key === 'Escape') {
        const searchInput = e.target;
        const searchClear = searchContainer.querySelector('.report-search-clear');
        const searchResults = searchContainer.querySelector('.report-search-results');
        searchInput.value = '';
        if (searchResults) searchResults.hidden = true;
        if (searchClear) searchClear.hidden = true;
        REPORT_NAVIGATION._searchResults = [];
      }
    });
  }

  // Indice rimosso - nessun handler necessario
}

// RIMOSSO: scrollToModule non serve più senza indice
function scrollToModule(moduleId) {
  // RIMOSSO: L'indice è stato rimosso
  return;
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

    // Render indice - RIMOSSO
    if (indexContainer) {
      REPORT_NAVIGATION._indexContainer = indexContainer;
      indexContainer.innerHTML = '';
      // Nascondi il container dell'indice
      if (indexContainer.parentElement) {
        indexContainer.style.display = 'none';
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

    // Setup event handlers immediatamente - usa event delegation quindi funziona anche se elementi non sono ancora nel DOM
    setupEventHandlers();

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
    // RIMOSSO: L'indice è stato rimosso
  }
};

