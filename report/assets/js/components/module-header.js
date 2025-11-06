// /report/assets/js/components/module-header.js
// Helper per generare header moduli unificato
// -----------------------------------------------------------

/**
 * Genera HTML header per modulo
 * @param {Object} config - Configurazione header
 * @param {string} config.badge - Badge modulo (es: "F1B", "F2")
 * @param {string} config.subtitle - Sottotitolo (es: "Regime di mercato · Orizzonte 3–10 giorni")
 * @param {string} config.title - Titolo principale
 * @param {string} config.desc - Descrizione
 * @param {string} config.status - Status (ACTIVE/HOLD/REVIEW)
 * @param {string} config.freshness - Freshness (es: "≤ T-1")
 * @returns {string} HTML header
 */
export function renderModuleHeader(config = {}) {
  const {
    badge = '',
    subtitle = '',
    title = '',
    desc = '',
    status = 'ACTIVE',
    freshness = '≤ T-1'
  } = config;

  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (str == null) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return `
    <header class="module-header">
      <div class="module-header-topline">
        ${badge ? `<span class="module-badge">${escapeHtml(badge)}</span>` : ''}
        ${subtitle ? `<span class="module-subtitle">${escapeHtml(subtitle)}</span>` : ''}
        <span class="module-status-pill" data-state="${escapeAttr(status)}">
          ${escapeHtml(status)}
        </span>
        <span class="module-freshness">${escapeHtml(freshness)}</span>
      </div>
      ${title ? `<div class="module-title">${escapeHtml(title)}</div>` : ''}
      ${desc ? `<div class="module-desc">${escapeHtml(desc)}</div>` : ''}
    </header>
  `;
}

/**
 * Genera HTML AI Summary box
 * @param {string} summaryText - Testo riassunto AI
 * @param {string} label - Label (default: "Riassunto AI")
 * @returns {string} HTML summary box
 */
export function renderAISummary(summaryText = '', label = 'Riassunto AI') {
  if (!summaryText) return '';

  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  return `
    <div class="module-ai-summary">
      <div class="module-ai-summary-label">${escapeHtml(label)}</div>
      <div class="module-ai-summary-text">${escapeHtml(summaryText)}</div>
    </div>
  `;
}

/**
 * Genera HTML menu laterale tabs + content area
 * @param {Array} tabs - Array di configurazioni tab
 * @param {string} tabs[].id - ID tab
 * @param {string} tabs[].title - Titolo tab
 * @param {string} tabs[].content - Contenuto tab (HTML)
 * @param {boolean} tabs[].active - Se attivo di default
 * @returns {Object} { sidebarHTML, contentHTML }
 */
export function renderModuleTabsSidebar(tabs = []) {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return { sidebarHTML: '', contentHTML: '' };
  }

  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (str == null) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Trova tab attivo (solo se esplicitamente active=true, altrimenti nessuna)
  const activeTabId = tabs.find(t => t.active === true)?.id || '';

  // Sidebar buttons
  const sidebarHTML = `
    <div class="module-tabs-sidebar">
      ${tabs.map(tab => `
        <button 
          class="module-tab-button" 
          type="button"
          data-tab-id="${escapeAttr(tab.id)}"
          data-active="${tab.id === activeTabId}"
          aria-controls="tab-panel-${escapeAttr(tab.id)}"
          aria-selected="${tab.id === activeTabId}">
          ${escapeHtml(tab.title)}
        </button>
      `).join('')}
    </div>
  `;

  // Content panels
  const contentHTML = `
    <div class="module-tabs-content">
      ${tabs.map(tab => `
        <div 
          class="module-tab-panel" 
          id="tab-panel-${escapeAttr(tab.id)}"
          data-tab-id="${escapeAttr(tab.id)}"
          data-active="${tab.id === activeTabId}"
          role="tabpanel"
          aria-labelledby="tab-button-${escapeAttr(tab.id)}">
          <div class="module-tab-panel-content">
            ${tab.content}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return { sidebarHTML, contentHTML };
}

/**
 * Bind eventi per tabs laterali
 * @param {HTMLElement} container - Container con tabs wrapper
 */
export function bindModuleTabs(container) {
  if (!container) return;

  const buttons = container.querySelectorAll('.module-tab-button');
  const panels = container.querySelectorAll('.module-tab-panel');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tabId;
      if (!tabId) return;

      // Aggiorna buttons
      buttons.forEach(btn => {
        btn.dataset.active = btn.dataset.tabId === tabId;
        btn.setAttribute('aria-selected', btn.dataset.tabId === tabId);
      });

      // Aggiorna panels
      panels.forEach(panel => {
        panel.dataset.active = panel.dataset.tabId === tabId;
        if (panel.dataset.tabId === tabId) {
          panel.setAttribute('aria-hidden', 'false');
        } else {
          panel.setAttribute('aria-hidden', 'true');
        }
      });
    });
  });
}

