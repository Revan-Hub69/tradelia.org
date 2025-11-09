// /report/assets/js/components/metrics-drawer.js
// Metrics Drawer Unificato - Navigazione Gerarchica Accademica
// - Categorie → Gruppi → Metriche
// - Ricerca globale sempre disponibile
// - Filtri per tone/categoria
// - Breadcrumb per navigazione
// - Funziona mobile e desktop

import Logger from '../utils/logger.js';
import { registerOverlay, unregisterOverlay, OVERLAY_TYPES } from '../utils/overlay-manager.js';
import { i18n } from '../utils/i18n.js';

const DRAWER = {
  _overlay: null,
  _panel: null,
  _isOpen: false,
  _currentView: 'categories', // 'categories' | 'group' | 'metric'
  _currentPath: [], // breadcrumb path
  _allMetrics: [],
  _filteredMetrics: [],
  _searchQuery: '',
  _activeFilter: null,
  _glossary: null,
  _selectedMetricKey: null, // metric key da evidenziare
  _overlayId: 'metrics-drawer' // ID univoco per overlay manager
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

function getToneClass(tone) {
  switch (tone) {
    case 'ok': return 'metric-tone--ok';
    case 'warn': return 'metric-tone--warn';
    case 'err': return 'metric-tone--err';
    default: return 'metric-tone--neutral';
  }
}

function formatValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? String(value)
      : Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(value);
}

// ===== GLOSSARY =====
async function loadGlossary() {
  if (DRAWER._glossary) return DRAWER._glossary;
  
  try {
    const res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    if (res.ok) {
      DRAWER._glossary = await res.json();
      Logger.debug('MetricsDrawer', 'Glossario caricato');
      return DRAWER._glossary;
    }
  } catch (err) {
    Logger.warn('MetricsDrawer', 'Errore caricamento glossario', err);
  }
  
  DRAWER._glossary = {};
  return DRAWER._glossary;
}

function getGlossaryEntry(key) {
  if (!DRAWER._glossary) return null;
  return DRAWER._glossary[key] || null;
}

function enrichMetricWithGlossary(metric) {
  const entry = getGlossaryEntry(metric.key);
  if (!entry) return metric;
  
  return {
    ...metric,
    description: metric.description || entry.what || '',
    how: entry.how || '',
    source: entry.source || ''
  };
}

// ===== ORGANIZZAZIONE METRICHE =====
function organizeMetrics(metrics) {
  const organized = {
    categories: {},
    flat: []
  };
  
  if (!Array.isArray(metrics) || metrics.length === 0) {
    return organized;
  }
  
  metrics.forEach(metric => {
    organized.flat.push(metric);
    
    const category = metric.category || 'Generale';
    if (!organized.categories[category]) {
      organized.categories[category] = [];
    }
    organized.categories[category].push(metric);
  });
  
  return organized;
}

function filterMetrics(metrics, searchQuery, toneFilter) {
  if (!searchQuery && !toneFilter) return metrics;
  
  return metrics.filter(metric => {
    const matchesSearch = !searchQuery || 
      String(metric.key || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(metric.label || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTone = !toneFilter || metric.tone === toneFilter;
    
    return matchesSearch && matchesTone;
  });
}

// ===== RENDERING =====
function renderBreadcrumb(container, path) {
  container.innerHTML = '';
  
  if (path.length === 0) {
    const home = createEl('span', 'breadcrumb-item breadcrumb-active', i18n.t('metrics.drawer.all'));
    container.appendChild(home);
    return;
  }
  
  const home = createEl('button', 'breadcrumb-item', i18n.t('metrics.drawer.all'));
  home.addEventListener('click', () => DRAWER.navigateTo('categories'));
  container.appendChild(home);
  
  path.forEach((item, idx) => {
    const sep = createEl('span', 'breadcrumb-sep', '→');
    container.appendChild(sep);
    
    const isLast = idx === path.length - 1;
    const itemEl = isLast
      ? createEl('span', 'breadcrumb-item breadcrumb-active', item.label || item)
      : createEl('button', 'breadcrumb-item', item.label || item);
    
    if (!isLast) {
      itemEl.addEventListener('click', () => {
        DRAWER.navigateTo(item.type, item.data);
      });
    }
    
    container.appendChild(itemEl);
  });
}

function renderSearch(container) {
  const searchWrapper = createEl('div', 'drawer-search');
  const searchInput = createEl('input', 'drawer-search-input');
  searchInput.type = 'text';
  searchInput.placeholder = i18n.t('metrics.drawer.search');
  searchInput.value = DRAWER._searchQuery;
  
  searchInput.addEventListener('input', (e) => {
    DRAWER._searchQuery = e.target.value;
    DRAWER.applyFilters();
  });
  
  searchWrapper.appendChild(searchInput);
  container.appendChild(searchWrapper);
}

function renderFilters(container) {
  const filtersWrapper = createEl('div', 'drawer-filters');
  
  const toneFilters = [
    { value: null, label: 'Tutti' },
    { value: 'ok', label: 'OK' },
    { value: 'warn', label: 'Warning' },
    { value: 'err', label: 'Errore' },
    { value: 'neutral', label: 'Neutro' }
  ];
  
  toneFilters.forEach(filter => {
    const btn = createEl('button', `drawer-filter-btn ${DRAWER._activeFilter === filter.value ? 'active' : ''}`, filter.label);
    btn.addEventListener('click', () => {
      DRAWER._activeFilter = filter.value === DRAWER._activeFilter ? null : filter.value;
      DRAWER.applyFilters();
    });
    filtersWrapper.appendChild(btn);
  });
  
  container.appendChild(filtersWrapper);
}

function renderCategories(organized) {
  const container = createEl('div', 'drawer-content');
  
  const categories = Object.keys(organized.categories).sort();
  
  if (categories.length === 0) {
    container.innerHTML = `<div class="drawer-empty">${i18n.t('metrics.drawer.empty')}</div>`;
    return container;
  }
  
  const list = createEl('div', 'drawer-categories-list');
  
  categories.forEach(categoryName => {
    const category = organized.categories[categoryName];
    const count = category.length;
    
    const item = createEl('button', 'drawer-category-item');
    item.innerHTML = `
      <div class="drawer-category-name">${escapeHtml(categoryName)}</div>
      <div class="drawer-category-count">${count} ${count === 1 ? i18n.t('metrics.drawer.metric') : i18n.t('metrics.drawer.metrics')}</div>
    `;
    
    item.addEventListener('click', () => {
      DRAWER.navigateTo('group', { category: categoryName, metrics: category });
    });
    
    list.appendChild(item);
  });
  
  container.appendChild(list);
  return container;
}

function renderGroup(groupData) {
  const container = createEl('div', 'drawer-content');
  
  if (!groupData || !groupData.metrics || groupData.metrics.length === 0) {
    container.innerHTML = `<div class="drawer-empty">${i18n.t('metrics.drawer.emptyGroup')}</div>`;
    return container;
  }
  
  const list = createEl('div', 'drawer-metrics-list');
  
  groupData.metrics.forEach(metric => {
    const isSelected = DRAWER._selectedMetricKey === metric.key;
    const item = createEl('button', `drawer-metric-item ${getToneClass(metric.tone)} ${isSelected ? 'drawer-metric-selected' : ''}`);
    item.dataset.metricKey = metric.key;
    
    item.innerHTML = `
      <div class="drawer-metric-header">
        <div class="drawer-metric-label">${escapeHtml(metric.label || metric.key)}</div>
        <div class="drawer-metric-value ${getToneClass(metric.tone)}">${escapeHtml(formatValue(metric.value))}</div>
      </div>
      <div class="drawer-metric-key">${escapeHtml(metric.key)}</div>
    `;
    
    item.addEventListener('click', () => {
      DRAWER._selectedMetricKey = metric.key;
      DRAWER.navigateTo('metric', metric);
    });
    
    list.appendChild(item);
  });
  
  container.appendChild(list);
  
  // Scroll to selected metric if exists
  if (DRAWER._selectedMetricKey) {
    setTimeout(() => {
      const selectedItem = container.querySelector(`[data-metric-key="${DRAWER._selectedMetricKey}"]`);
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
  
  return container;
}

function renderMetric(metric) {
  const container = createEl('div', 'drawer-content drawer-metric-detail');
  
  // Enrich with glossary
  const enriched = enrichMetricWithGlossary(metric);
  
  container.innerHTML = `
    <div class="drawer-metric-detail-header">
      <div class="drawer-metric-detail-label">${escapeHtml(enriched.label || enriched.key)}</div>
      <div class="drawer-metric-detail-value ${getToneClass(enriched.tone)}">${escapeHtml(formatValue(enriched.value))}</div>
    </div>
    <div class="drawer-metric-detail-key">
      <strong>Key:</strong> ${escapeHtml(enriched.key)}
    </div>
    ${enriched.description || enriched.what ? `
      <div class="drawer-metric-detail-desc">
        <strong>${i18n.t('metric.popup.what')}:</strong> ${escapeHtml(enriched.description || enriched.what)}
      </div>
    ` : ''}
    ${enriched.how ? `
      <div class="drawer-metric-detail-how">
        <strong>${i18n.t('metric.popup.how')}:</strong> ${escapeHtml(enriched.how)}
      </div>
    ` : ''}
    ${enriched.source ? `
      <div class="drawer-metric-detail-source">
        <strong>${i18n.t('metric.popup.source')}:</strong> ${escapeHtml(enriched.source)}
      </div>
    ` : ''}
    ${enriched.category ? `
      <div class="drawer-metric-detail-category">
        <strong>${i18n.t('metrics.drawer.category')}:</strong> ${escapeHtml(enriched.category)}
      </div>
    ` : ''}
    <div class="drawer-metric-detail-tone">
      <strong>Tone:</strong> <span class="${getToneClass(enriched.tone)}">${escapeHtml(enriched.tone || 'neutral')}</span>
    </div>
  `;
  
  // Scroll to top
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
  
  return container;
}

function renderView() {
  const body = DRAWER._panel.querySelector('.drawer-body');
  if (!body) return;
  
  const organized = organizeMetrics(DRAWER._filteredMetrics);
  const breadcrumb = DRAWER._panel.querySelector('.drawer-breadcrumb');
  const content = DRAWER._panel.querySelector('.drawer-content-wrapper');
  
  // Render breadcrumb
  if (breadcrumb) {
    renderBreadcrumb(breadcrumb, DRAWER._currentPath);
  }
  
  // Render content
  if (content) {
    content.innerHTML = '';
    
    if (DRAWER._currentView === 'categories') {
      content.appendChild(renderCategories(organized));
    } else if (DRAWER._currentView === 'group') {
      const groupData = DRAWER._currentPath[DRAWER._currentPath.length - 1]?.data;
      content.appendChild(renderGroup(groupData));
    } else if (DRAWER._currentView === 'metric') {
      const metric = DRAWER._currentPath[DRAWER._currentPath.length - 1]?.data;
      content.appendChild(renderMetric(metric));
    }
  }
}

// ===== NAVIGATION =====
function navigateTo(view, data = null) {
  DRAWER._currentView = view;
  
  if (view === 'categories') {
    DRAWER._currentPath = [];
  } else if (view === 'group' && data) {
    DRAWER._currentPath = [{
      type: 'group',
      label: data.category,
      data: data
    }];
  } else if (view === 'metric' && data) {
    const category = data.category || 'Generale';
    DRAWER._currentPath = [
      {
        type: 'group',
        label: category,
        data: { category, metrics: DRAWER._allMetrics.filter(m => m.category === category) }
      },
      {
        type: 'metric',
        label: data.label || data.key,
        data: data
      }
    ];
  }
  
  renderView();
}

function applyFilters() {
  DRAWER._filteredMetrics = filterMetrics(DRAWER._allMetrics, DRAWER._searchQuery, DRAWER._activeFilter);
  renderView();
}

// ===== PUBLIC API =====
function mount() {
  if (DRAWER._overlay) return;
  
  // Create overlay
  DRAWER._overlay = createEl('div', 'metrics-drawer-overlay');
  DRAWER._overlay.setAttribute('aria-modal', 'true');
  DRAWER._overlay.setAttribute('aria-hidden', 'true');
  DRAWER._overlay.hidden = true;
  
  // Create panel
  DRAWER._panel = createEl('div', 'metrics-drawer-panel');
  DRAWER._panel.setAttribute('role', 'dialog');
  DRAWER._panel.setAttribute('aria-labelledby', 'drawer-title');
  
  // Header
  const header = createEl('header', 'drawer-header');
  header.innerHTML = `
    <h2 id="drawer-title" class="drawer-title">${i18n.t('metrics.drawer.all')}</h2>
    <button class="drawer-close" aria-label="${i18n.t('common.close')}" type="button">×</button>
  `;
  DRAWER._panel.appendChild(header);
  
  // Search
  const searchContainer = createEl('div', 'drawer-search-container');
  renderSearch(searchContainer);
  DRAWER._panel.appendChild(searchContainer);
  
  // Filters
  const filtersContainer = createEl('div', 'drawer-filters-container');
  renderFilters(filtersContainer);
  DRAWER._panel.appendChild(filtersContainer);
  
  // Breadcrumb
  const breadcrumb = createEl('nav', 'drawer-breadcrumb', '');
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  DRAWER._panel.appendChild(breadcrumb);
  
  // Content
  const contentWrapper = createEl('div', 'drawer-content-wrapper');
  DRAWER._panel.appendChild(contentWrapper);
  
  // Close handlers
  header.querySelector('.drawer-close').addEventListener('click', () => DRAWER.close());
  DRAWER._overlay.addEventListener('click', (e) => {
    if (e.target === DRAWER._overlay) DRAWER.close();
  });
  
  // Listener per close request dall'overlay manager (ESC key)
  DRAWER._overlay.addEventListener('overlay-close-request', (e) => {
    if (e.detail.id === DRAWER._overlayId) {
      DRAWER.close();
    }
  });
  
  // ESC gestito da overlay-manager (rimosso listener duplicato)
  
  DRAWER._overlay.appendChild(DRAWER._panel);
  document.body.appendChild(DRAWER._overlay);
  
  Logger.debug('MetricsDrawer', 'Drawer montato');
}

async function open(metricsData) {
  if (!DRAWER._overlay) DRAWER.mount();
  
  // Load glossary
  await loadGlossary();
  
  const metrics = metricsData?.metricsPanel || metricsData?.metrics || [];
  DRAWER._allMetrics = Array.isArray(metrics) ? metrics : [];
  DRAWER._filteredMetrics = DRAWER._allMetrics;
  DRAWER._searchQuery = '';
  DRAWER._activeFilter = null;
  DRAWER._currentView = 'categories';
  DRAWER._currentPath = [];
  DRAWER._selectedMetricKey = null;
  
  DRAWER._overlay.hidden = false;
  DRAWER._overlay.setAttribute('aria-hidden', 'false');
  DRAWER._isOpen = true;
  
  // Registra overlay nello stack (gestisce z-index e overflow)
  registerOverlay(DRAWER._overlayId, OVERLAY_TYPES.METRICS_DRAWER, DRAWER._overlay);
  
  renderView();
  
  // Focus search
  const searchInput = DRAWER._panel.querySelector('.drawer-search-input');
  if (searchInput) {
    setTimeout(() => searchInput.focus(), 100);
  }
  
  Logger.debug('MetricsDrawer', `Drawer aperto con ${DRAWER._allMetrics.length} metriche`);
}

async function openFromMetric(metricKey, metricsData) {
  await DRAWER.open(metricsData);
  
  // Set selected metric
  DRAWER._selectedMetricKey = metricKey;
  
  // Find metric and navigate to it
  const metric = DRAWER._allMetrics.find(m => m.key === metricKey);
  if (metric) {
    setTimeout(() => {
      navigateTo('metric', metric);
    }, 150);
  } else {
    Logger.warn('MetricsDrawer', `Metrica ${metricKey} non trovata`);
  }
}

function close() {
  if (!DRAWER._overlay || !DRAWER._isOpen) return;
  
  DRAWER._overlay.hidden = true;
  DRAWER._overlay.setAttribute('aria-hidden', 'true');
  DRAWER._isOpen = false;
  
  // Rimuovi overlay dallo stack (gestisce overflow automaticamente)
  unregisterOverlay(DRAWER._overlayId);
  
  // Reset
  DRAWER._searchQuery = '';
  DRAWER._activeFilter = null;
  DRAWER._currentView = 'categories';
  DRAWER._currentPath = [];
  DRAWER._selectedMetricKey = null;
  
  Logger.debug('MetricsDrawer', 'Drawer chiuso');
}

// Export
DRAWER.mount = mount;
DRAWER.open = open;
DRAWER.openFromMetric = openFromMetric;
DRAWER.close = close;
DRAWER.navigateTo = navigateTo;
DRAWER.applyFilters = applyFilters;

export const metricsDrawer = DRAWER;

