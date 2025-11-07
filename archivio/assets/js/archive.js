// /archivio/assets/js/archive.js
// Archivio Pubblico - Logica principale

import Logger from '/report/assets/js/utils/logger.js';
import { siteHeader } from '/report/assets/js/components/site-header.js';
import { siteFooter } from '/report/assets/js/components/site-footer.js';

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
  
  // Monta header e footer
  await mountHeaderFooter();
  
  // Carica dati
  await loadData();
  
  // Setup tabs
  setupTabs();
  
  // Setup filtri (solo per abbonati, nascosti di default)
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

// ===== LOAD DATA =====
async function loadData() {
  try {
    // Carica manifest report
    const manifestResponse = await fetch('/archivio/manifest.json');
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      STATE.reports = manifest.reports || [];
      Logger.debug('Archive', `Caricati ${STATE.reports.length} report`);
    }
    
    // Carica documenti tutorial
    const docsResponse = await fetch('/archivio/documents.json');
    if (docsResponse.ok) {
      const docs = await docsResponse.json();
      STATE.tutorials = docs.documents || [];
      Logger.debug('Archive', `Caricati ${STATE.tutorials.length} tutorial`);
    }
    
    // Filtra report pubblici (dopo 24h)
    const now = new Date();
    STATE.reports = STATE.reports.filter(report => {
      if (!report.public_after) return false;
      const publicAfter = new Date(report.public_after);
      return now >= publicAfter;
    });
    
    // Renderizza
    renderReports();
    renderTutorials();
    
  } catch (err) {
    Logger.error('Archive', 'Errore caricamento dati', err);
    showError('Errore nel caricamento dei dati');
  }
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
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
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
    const date = new Date(report.created_at).toLocaleDateString('it-IT');
    const statusBadge = `<span class="status-badge" data-status="${report.status || 'active'}">${(report.status || 'active').toUpperCase()}</span>`;
    
    return `
      <tr>
        <td>${date}</td>
        <td><strong>${report.ticker || '—'}</strong></td>
        <td>${report.company || '—'}</td>
        <td>${report.type || '—'}</td>
        <td>${report.version || '—'}</td>
        <td>${statusBadge}</td>
        <td><a href="/report/index.html?id=${report.id}" target="_blank">Apri Report</a></td>
      </tr>
    `;
  }).join('');
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
}

