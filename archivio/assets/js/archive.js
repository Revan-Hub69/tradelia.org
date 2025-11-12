// /archivio/assets/js/archive.js
// Archivio Pubblico - Logica principale

import Logger from '/report/assets/js/utils/logger.js';
import { siteHeader } from '/report/assets/js/components/site-header.js';
import { siteFooter } from '/report/assets/js/components/site-footer.js';
import { supabase } from '/report/assets/js/supabase-client.js';

// ===== STATE =====
const STATE = {
  reports: [],
  tutorials: [],
  currentTab: 'reports',
  sortBy: 'date',
  sortOrder: 'desc'
};

// ===== INIT =====
async function init() {
  Logger.debug('Archive', 'Inizializzazione archivio');

  await mountHeaderFooter();
  await checkAdminAccess();
  await loadData();
  setupTabs();
  setupFilters();

  Logger.debug('Archive', 'Archivio inizializzato');
}

// ===== MOUNT HEADER & FOOTER =====
async function mountHeaderFooter() {
  // Assicura tema dark
  document.documentElement.setAttribute('data-theme', 'dark');
  
  try {
    const headerSlot = document.getElementById('site-header-slot');
    if (headerSlot) {
      siteHeader.mount(headerSlot);
    }
    
    const footerSlot = document.getElementById('site-footer-slot');
    if (footerSlot) {
      siteFooter.mount(footerSlot);
    }
  } catch (err) {
    Logger.warn('Archive', 'Errore montaggio header/footer', err);
  }
}

async function checkAdminAccess() {
  const actions = document.getElementById('archive-admin-actions');
  const button = document.getElementById('archive-admin-button');
  if (!actions || !button) return;

  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) {
      actions.hidden = true;
      return;
    }

    const { data: adminRecord, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (adminRecord) {
      actions.hidden = false;
      button.addEventListener('click', () => {
        window.location.href = '/report/admin/dashboard.html';
      }, { once: true });
    } else {
      actions.hidden = true;
    }
  } catch (err) {
    Logger.warn('Archive', 'Errore verifica admin', err);
  }
}

// ===== LOAD DATA =====
async function loadData() {
  try {
    await loadReportsFromSupabase();
    await loadTutorialsManifest();
    renderReports();
    renderTutorials();
  } catch (err) {
    Logger.error('Archive', 'Errore caricamento dati', err);
    showError('Errore nel caricamento dei dati');
  }
}

async function loadReportsFromSupabase() {
  const now = new Date();
  const { data, error } = await supabase
    .from('reports')
    .select('id, slug, title, status, report_type, chart_path, notes, created_at, updated_at, published_at, report_modules!inner(module_key, content)')
    .eq('status', 'active')
    .eq('report_modules.module_key', 'header')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  const drafts = Array.isArray(data) ? data : [];
  const parsed = drafts
    .map(row => {
      const headerContent = row.report_modules?.find(mod => mod.module_key === 'header')?.content || {};
      const header = normalizeHeaderContent(headerContent);
      const ticker = extractHeaderMetric(header, ['Ticker']);
      const companyName = extractHeaderMetric(header, ['CompanyName', 'Company']);
      const frameworkMetric = extractHeaderMetric(header, ['Framework', 'FrameworkName']);
      const tipologia = extractHeaderMetric(header, ['Tipologia', 'Typology', 'Categoria', 'Category']);
      const exchange = extractHeaderMetric(header, ['Exchange', 'Venue', 'Market']);
      const sector = extractHeaderMetric(header, ['Settore', 'Sector', 'Industry', 'SectorName']);
      const createdAt = row.published_at || row.created_at;
      if (!createdAt) return null;

      const publicAfter = new Date(createdAt);
      publicAfter.setHours(publicAfter.getHours() + 24);

      return {
        id: row.slug,
        slug: row.slug,
        title: row.title || `${ticker || 'Report'} • Swing Master 5.0`,
        assetSymbol: ticker || '—',
        assetName: companyName || row.title || '—',
        framework: frameworkMetric || row.report_type || 'swing_master_5_0',
        typology: tipologia || null,
        exchange: exchange || null,
        sector: sector || null,
        status: row.status || 'active',
        created_at: createdAt,
        published_at: createdAt,
        updated_at: row.updated_at,
        public_after: publicAfter.toISOString(),
        chart_path: row.chart_path || null
      };
    })
    .filter(Boolean)
    .filter(report => {
      const publicDate = new Date(report.public_after);
      return now >= publicDate;
    });

  STATE.reports = parsed;
  Logger.debug('Archive', `Caricati ${STATE.reports.length} report da Supabase`);
}

async function loadTutorialsManifest() {
  try {
    const docsResponse = await fetch('/archivio/documents.json');
    if (docsResponse.ok) {
      const docs = await docsResponse.json();
      STATE.tutorials = docs.documents || [];
      Logger.debug('Archive', `Caricati ${STATE.tutorials.length} tutorial`);
    }
  } catch (err) {
    Logger.warn('Archive', 'Impossibile caricare manifest tutorial', err);
    STATE.tutorials = [];
  }
}

function normalizeHeaderContent(header) {
  if (!header) return null;
  if (typeof header === 'string') {
    try {
      return JSON.parse(header);
    } catch (err) {
      Logger.warn('Archive', 'Header JSON non valido', err);
      return null;
    }
  }
  return header;
}

function extractHeaderMetric(header, metricKey) {
  if (!header) return null;
  const keys = Array.isArray(metricKey)
    ? metricKey.filter(Boolean).map(k => String(k).toLowerCase())
    : [String(metricKey).toLowerCase()];

  if (!keys.length) return null;

  const normalizeValue = (value) => {
    if (value == null) return null;
    if (typeof value === 'object') {
      if ('value' in value) return value.value;
      if ('raw' in value) return value.raw;
    }
    return value;
  };

  if (Array.isArray(header.rows)) {
    for (const row of header.rows) {
      for (const part of row.parts || []) {
        if (part.kind === 'metric') {
          const partKey = part.key ? String(part.key).toLowerCase() : null;
          const partLabel = part.label ? String(part.label).toLowerCase() : null;
          if ((partKey && keys.includes(partKey)) || (partLabel && keys.includes(partLabel))) {
            return normalizeValue(part.value);
          }
        }
      }
    }
  }

  if (Array.isArray(header.metricsPanel)) {
    for (const entry of header.metricsPanel) {
      const entryKey = entry.key ? String(entry.key).toLowerCase() : null;
      const entryLabel = entry.label ? String(entry.label).toLowerCase() : null;
      if ((entryKey && keys.includes(entryKey)) || (entryLabel && keys.includes(entryLabel))) {
        return normalizeValue(entry.value);
      }
    }
  }

  if (header.meta && typeof header.meta === 'object') {
    for (const [metaKey, metaValue] of Object.entries(header.meta)) {
      if (keys.includes(String(metaKey).toLowerCase())) {
        return normalizeValue(metaValue);
      }
    }
  }

  for (const [prop, value] of Object.entries(header)) {
    if (keys.includes(String(prop).toLowerCase())) {
      return normalizeValue(value);
    }
  }

  return null;
}

// ===== SETUP TABS =====
function setupTabs() {
  const tabs = document.querySelectorAll('.archive-tab');
  const sections = document.querySelectorAll('.archive-section');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      
      // Update sections
      sections.forEach(s => {
        s.classList.remove('active');
        s.hidden = true;
      });
      
      const section = document.getElementById(`${tabName}-section`);
      if (section) {
        section.classList.add('active');
        section.hidden = false;
      }
      
      STATE.currentTab = tabName;
    });
  });
}

// ===== SETUP FILTERS =====
function setupFilters() {
  const toggleBtn = document.querySelector('.btn-toggle-filters');
  const filtersPanel = document.querySelector('.filters-panel');
  
  if (toggleBtn && filtersPanel) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      filtersPanel.hidden = isExpanded;
    });
  }
}

// ===== RENDER REPORTS =====
function renderReports() {
  const tbody = document.getElementById('reports-tbody');
  const loading = document.getElementById('loading-state');
  const empty = document.getElementById('empty-state');
  
  if (!tbody) return;
  
  // Hide loading
  if (loading) loading.hidden = true;
  
  // Sort reports
  const sortedReports = [...STATE.reports].sort((a, b) => {
    const dateA = new Date(a.published_at || a.created_at);
    const dateB = new Date(b.published_at || b.created_at);
    return STATE.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
  
  if (sortedReports.length === 0) {
    if (empty) empty.hidden = false;
    tbody.innerHTML = '';
    return;
  }
  
  if (empty) empty.hidden = true;
  
  // Render rows
  tbody.innerHTML = sortedReports.map(report => {
    const frameworkLabel = formatReportType(report.framework);
    const date = formatDateTime(report.published_at || report.created_at);
    const assetSymbol = report.assetSymbol || '—';
    const assetName = report.assetName || '';
    const typology = report.typology || '—';
    const exchange = report.exchange || '—';
    const sector = report.sector || '—';

    return `
      <tr>
        <td class="archive-id">[ ${report.slug} ]</td>
        <td>
          <a class="archive-asset-symbol" href="/report/index.html?id=${encodeURIComponent(report.slug)}" target="_blank" rel="noopener">
            ${assetSymbol}
          </a>
          <span class="archive-asset-name">${assetName}</span>
        </td>
        <td>${frameworkLabel}</td>
        <td>${typology}</td>
        <td>${exchange}</td>
        <td>${sector}</td>
        <td>${date}</td>
      </tr>
    `;
  }).join('');
}

function formatReportType(type) {
  if (!type) return '—';
  switch (type) {
    case 'swing_master_5_0':
      return 'Swing Master 5.0';
    case 'daily_market_intel_3_1':
      return 'Daily Market Intelligence 3.1';
    case 'custom':
      return 'Custom';
    case 'legacy':
      return 'Legacy';
    default:
      return type;
  }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(iso);
  }
}

// ===== RENDER TUTORIALS =====
function renderTutorials() {
  const list = document.getElementById('tutorials-list');
  const loading = document.getElementById('tutorials-loading');
  
  if (!list) return;
  
  if (loading) loading.hidden = true;
  
  if (STATE.tutorials.length === 0) {
    list.innerHTML = '<p class="archive-empty">Nessun tutorial disponibile</p>';
    return;
  }
  
  list.innerHTML = STATE.tutorials.map(tutorial => {
    const tags = (tutorial.tags || []).map(tag => 
      `<span class="tutorial-tag">${tag}</span>`
    ).join('');
    
    return `
      <div class="tutorial-card">
        <h3 class="tutorial-card-title">${tutorial.title || 'Tutorial'}</h3>
        <div class="tutorial-card-meta">
          <span>${tutorial.category || 'Tutorial'}</span>
          <span>•</span>
          <span>${tutorial.version || '—'}</span>
          <span>•</span>
          <span>${new Date(tutorial.created_at || tutorial.updated_at).toLocaleDateString('it-IT')}</span>
        </div>
        <div class="tutorial-card-tags">${tags}</div>
        <a href="${tutorial.link}" target="_blank" class="btn btn-sm" style="margin-top: var(--sp-3);">Apri Tutorial</a>
      </div>
    `;
  }).join('');
}

// ===== SHOW ERROR =====
function showError(message) {
  const empty = document.getElementById('empty-state');
  if (empty) {
    empty.hidden = false;
    empty.innerHTML = `<p>${message}</p>`;
  }
}

// ===== AVVIO =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();

supabase.auth.onAuthStateChange(() => {
  checkAdminAccess();
});
}

