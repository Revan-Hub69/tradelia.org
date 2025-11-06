// /report/assets/js/components/module-header.js
// Helper per generare header moduli unificato
// -----------------------------------------------------------

import { unifiedDrawer } from './unified-drawer.js';

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
 * Genera HTML drawer laterale per tabs + content area
 * @param {Array} tabs - Array di configurazioni tab
 * @param {string} tabs[].id - ID tab
 * @param {string} tabs[].title - Titolo tab
 * @param {string} tabs[].content - Contenuto tab (HTML)
 * @param {boolean} tabs[].active - Se attivo di default
 * @returns {Object} { drawerHTML, contentHTML }
 */
export function renderModuleTabsSidebar(tabs = []) {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return { drawerHTML: '', contentHTML: '' };
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

  // Menu tabs orizzontale (sotto la card)
  const menuHTML = `
    <div class="module-tabs-menu">
      ${tabs.map(tab => `
        <button 
          class="module-tab-button" 
          type="button"
          data-tab-id="${escapeAttr(tab.id)}"
          data-active="false"
          aria-label="Apri ${escapeHtml(tab.title)}">
          ${escapeHtml(tab.title)}
        </button>
      `).join('')}
    </div>
  `;

  // Drawer HTML rimosso - ora usiamo unified-drawer (stessa struttura del glossary-drawer che funziona)
  // Il drawer viene creato dinamicamente da unified-drawer.js
  const drawerHTML = ``;

  // Content panels (nascosti, usati solo per generare contenuto drawer)
  const contentHTML = `
    <div class="module-tabs-content" style="display: none;">
      ${tabs.map(tab => `
        <div 
          class="module-tab-panel" 
          id="tab-panel-${escapeAttr(tab.id)}"
          data-tab-id="${escapeAttr(tab.id)}"
          data-active="false">
          ${tab.content}
        </div>
      `).join('')}
    </div>
  `;

  return { drawerHTML, contentHTML, menuHTML };
}

/**
 * Bind eventi per tabs drawer
 * @param {HTMLElement} container - Container con tabs wrapper
 */
export function bindModuleTabs(container) {
  if (!container) return;

  const wrapper = container.closest('.module-tabs-wrapper');
  if (!wrapper) return;

  // Evita binding multipli
  if (wrapper.dataset.bound === 'true') return;
  wrapper.dataset.bound = 'true';

  const buttons = wrapper.querySelectorAll('.module-tab-button');
  const panels = container.querySelectorAll('.module-tab-panel');
  const moduleCard = wrapper.closest('.module-card');
  const moduleBadge = moduleCard?.querySelector('.module-badge');
  const badgeText = moduleBadge?.textContent || '';

  let isOpening = false; // Flag per prevenire click multipli rapidi

  // Apri drawer usando unified-drawer (stessa struttura del glossary-drawer che funziona)
  function openDrawer(tabId, tabTitle) {
    // Preveni apertura multipla
    if (isOpening) return;
    isOpening = true;

    // Trova il panel corrispondente
    const panel = Array.from(panels).find(p => p.dataset.tabId === tabId);
    if (!panel) {
      isOpening = false;
      return;
    }

    // Prepara contenuto (copia HTML del panel)
    const content = panel.innerHTML;

    // Apri unified drawer (stessa struttura del glossary-drawer che funziona)
    unifiedDrawer.open({
      id: `module-tabs-${badgeText}-${tabId}`,
      title: tabTitle || 'Sezioni',
      breadcrumb: badgeText ? `${badgeText} > ${tabTitle}` : tabTitle,
      content: content
    });

    // Se c'è un container per header-ticker, montalo dopo che il drawer è aperto
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const drawerContent = document.querySelector('.glossary-drawer-content');
        if (drawerContent) {
          const tickerContainer = drawerContent.querySelector('[data-tab-ticker]');
          if (tickerContainer && !tickerContainer.querySelector('.header-ticker')) {
            // Trigger evento custom per montare header-ticker (gestito da f1b.js)
            const event = new CustomEvent('drawer-tab-opened', {
              detail: { tabId, container: tickerContainer }
            });
            wrapper.dispatchEvent(event);
          }
        }
        isOpening = false;
      });
    });
  }

  // Gestione click su tab button (apre drawer)
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tabId;
      const tabTitle = button.textContent.trim();
      if (!tabId) return;

      // Aggiorna stato button (per evidenziare)
      buttons.forEach(btn => {
        btn.dataset.active = btn.dataset.tabId === tabId ? 'true' : 'false';
      });

      // Apri drawer con contenuto tab
      openDrawer(tabId, tabTitle);
    });
    
    // Keyboard navigation
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      } else if (e.key === 'ArrowRight' && index < buttons.length - 1) {
        e.preventDefault();
        buttons[index + 1].focus();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        buttons[index - 1].focus();
      }
    });
  });
}

