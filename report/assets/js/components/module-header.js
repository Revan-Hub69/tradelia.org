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
 * Genera HTML tab (accordion)
 * @param {Object} config - Configurazione tab
 * @param {string} config.id - ID tab
 * @param {string} config.title - Titolo tab
 * @param {string} config.content - Contenuto tab (HTML)
 * @param {boolean} config.expanded - Se espanso di default
 * @returns {string} HTML tab
 */
export function renderModuleTab(config = {}) {
  const {
    id = '',
    title = '',
    content = '',
    expanded = false
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
    <div class="module-tab" data-tab-id="${escapeAttr(id)}" data-expanded="${expanded}">
      <button class="module-tab-header" type="button" aria-expanded="${expanded}" aria-controls="tab-content-${escapeAttr(id)}">
        <span class="module-tab-title">
          ${escapeHtml(title)}
        </span>
        <svg class="module-tab-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="module-tab-content" id="tab-content-${escapeAttr(id)}" role="region">
        ${content}
      </div>
    </div>
  `;
}

/**
 * Bind eventi per tabs (accordion)
 * @param {HTMLElement} container - Container con tabs
 */
export function bindModuleTabs(container) {
  if (!container) return;

  const tabs = container.querySelectorAll('.module-tab-header');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabEl = tab.closest('.module-tab');
      if (!tabEl) return;

      const isExpanded = tabEl.dataset.expanded === 'true';
      const newState = !isExpanded;

      // Aggiorna stato
      tabEl.dataset.expanded = newState;
      tab.setAttribute('aria-expanded', newState);

      // Opzionale: chiudi altri tabs (accordion)
      // Se vuoi solo uno aperto alla volta, decommenta:
      /*
      if (newState) {
        const allTabs = container.querySelectorAll('.module-tab');
        allTabs.forEach(t => {
          if (t !== tabEl && t.dataset.expanded === 'true') {
            t.dataset.expanded = 'false';
            const header = t.querySelector('.module-tab-header');
            if (header) header.setAttribute('aria-expanded', 'false');
          }
        });
      }
      */
    });
  });
}

