// /report/assets/js/modules/f5lt.js
// F5-LT+ · Layer Long-Term - Design Unificato
// Usa stessa logica di header-ticker: riassunto AI sempre visibile + tabs laterali

import { renderModuleHeader, renderModuleTabsSidebar, bindModuleTabs } from '../components/module-header.js';
import Logger from '../utils/logger.js';
// header-ticker viene importato dinamicamente quando necessario

// Helper functions
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

function normalizeDataPublicF5LT(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? "—",
    module: src?.meta?.module ?? "F5-LT+ · Layer Long-Term",
    moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
    freshness: src?.meta?.freshness ?? "≤ T-1",
    hero_intro: src?.meta?.hero_intro ?? "",
    hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F5-LT+',
    hero_title: 'Layer long-term integrato per coerenza ciclica e fondamentale',
    hero_subtitle: 'Layer Long-Term · Orizzonte 3–10 giorni',
    hero_desc: 'Strato long-term integrato per coerenza ciclica e fondamentale. Nessun contenuto operativo.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles
    tab_lt_code: 'LT Code',
    tab_lt_composite: 'LT Composite',
    tab_cyclical: 'Coerenza Ciclica',
    tab_fundamental: 'Coerenza Fondamentale',
    tab_governance: 'Governance',
    // Metric labels
    label_lt_code: 'LT_Code',
    label_lt_composite: 'LTComposite_total',
    // Separatori
    separator_dot: ' · ',
    separator_colon: ': ',
    separator_comma: ', '
  };

  // Mappa dinamicamente ui_labels → labels
  const UL = src?.ui_labels || {};
  const uiFromS = (k, fallback) => (typeof UL[k] === 'string' && UL[k].trim()) ? UL[k].trim() : fallback;

  const labels = {
    ...defaults,
    ...UL,
    badge: UL?.badge || defaults.badge,
    hero_title: UL?.hero_title || defaults.hero_title,
    hero_subtitle: UL?.hero_subtitle || defaults.hero_subtitle,
    hero_desc: UL?.hero_desc || defaults.hero_desc,
    ai_summary_label: uiFromS('ai_summary_label', defaults.ai_summary_label),
    tab_lt_code: uiFromS('tab_lt_code', defaults.tab_lt_code),
    tab_lt_composite: uiFromS('tab_lt_composite', defaults.tab_lt_composite),
    tab_cyclical: uiFromS('tab_cyclical', defaults.tab_cyclical),
    tab_fundamental: uiFromS('tab_fundamental', defaults.tab_fundamental),
    tab_governance: uiFromS('tab_governance', defaults.tab_governance)
  };

  return {
    meta,
    labels,
    lt_code: src.lt_code || src.LT_Code || {},
    lt_composite: src.lt_composite || src.LTComposite_total || {},
    cyclical: src.cyclical || {},
    fundamental: src.fundamental || {},
    governance: src.governance || {}
  };
}

/**
 * Genera rows + parts per riassunto AI (sempre visibile)
 */
function generateAISummaryRows(data) {
  const rows = [];
  const d = data;
  const labels = d.labels || {};
  
  // ROW 1: LT_Code + LTComposite_total
  const ltCode = d.lt_code?.LT_Code?.raw || d.lt_code?.LT_Code || '—';
  const ltComposite = d.lt_composite?.LTComposite_total?.raw || d.lt_composite?.LTComposite_total || '—';
  
  rows.push({
    id: 'f5lt-summary-lt',
    parts: [
      { kind: 'text', text: `${labels.label_lt_code || 'LT_Code'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'LT_Code',
        value: String(ltCode),
        label: labels.label_lt_code || 'LT_Code',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_lt_composite || 'LTComposite_total'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'LTComposite_total',
        value: String(ltComposite),
        label: labels.label_lt_composite || 'LTComposite_total',
        tone: 'neutral'
      }
    ]
  });
  
  return rows;
}

/**
 * Genera rows + parts per tab LT Code
 */
function generateLTCodeTabRows(data) {
  const rows = [];
  const d = data.lt_code || {};
  const labels = data.labels || {};
  
  if (d.LT_Code) {
    rows.push({
      id: 'lt-code',
      parts: [
        { kind: 'text', text: `${labels.label_lt_code || 'LT_Code'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'LT_Code',
          value: String(d.LT_Code?.raw || d.LT_Code || '—'),
          label: labels.label_lt_code || 'LT_Code',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF5LT(rawData);
  const labels = d.labels || {};
  
  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F5-LT+',
    subtitle: labels.hero_subtitle || 'Analisi Long-Term · Orizzonte 3–10 giorni',
    title: labels.hero_title || 'Analisi di coerenza long-term (ciclica e fondamentale)',
    desc: labels.hero_desc || 'Analisi educativa di coerenza long-term integrata (ciclica e fondamentale). Nessun contenuto operativo o raccomandativo.',
    status: d.meta.moduleStatus,
    freshness: d.meta.freshness,
    disclaimer: d.meta.hero_disclaimer || d.mifid?.disclaimer || ''
  });
  
  // Riassunto AI sempre visibile (usa header-ticker)
  const aiSummaryRows = generateAISummaryRows(d);
  const aiSummaryContainer = `
    <div class="module-ai-summary">
      <div class="module-ai-summary-label">${escapeHtml(labels.ai_summary_label || 'Riassunto AI')}</div>
      <div data-ai-summary-ticker="true"></div>
    </div>
  `;
  
  // Tabs per sezioni
  const tabs = [];
  
  // Tab 1: LT Code
  if (d.lt_code && Object.keys(d.lt_code).length > 0) {
    tabs.push({
      id: 'lt_code',
      title: labels.tab_lt_code || 'LT Code',
      content: '<div data-tab-ticker="lt_code"></div>',
      active: false,
      rows: generateLTCodeTabRows(d)
    });
  }
  
  // Genera menu tabs + drawer + content
  const { drawerHTML, contentHTML, menuHTML } = renderModuleTabsSidebar(tabs);
  
  return `
    <section class="module-card" data-state="${escapeAttr(d.meta.moduleStatus)}">
      ${headerHTML}
      ${aiSummaryContainer}
      <div class="module-tabs-wrapper" data-drawer-open="false">
        ${menuHTML}
        ${drawerHTML}
        ${contentHTML}
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublicF5LT(rawData);
  
  // Bind tabs menu + drawer
  const tabsWrapper = node.querySelector('.module-tabs-wrapper');
  if (tabsWrapper) {
    bindModuleTabs(tabsWrapper);
    
    // Listener per quando si apre una tab nel drawer
    tabsWrapper.addEventListener('drawer-tab-opened', (e) => {
      const { tabId, container } = e.detail;
      if (!container) return;
      
      // Monta header-ticker nel drawer
      import('../components/header-ticker.js').then(({ headerTicker }) => {
        let rows = [];
        if (tabId === 'lt_code') {
          rows = generateLTCodeTabRows(data);
        }
        
        if (rows.length > 0) {
          const tickerNode = headerTicker.mount(container);
          if (tickerNode) {
            headerTicker.update(tickerNode, {
              ...rawData.meta,
              rows: rows,
              metricsPanel: rawData?.metricsPanel || []
            });
            
            setTimeout(() => {
              const metricButtons = tickerNode.querySelectorAll('.metric-inline[data-metric]');
              if (metricButtons.length > 0) {
                Logger.debug('F5-LT+', `Metriche montate nel drawer: ${metricButtons.length}`);
              }
            }, 50);
          }
        }
      }).catch(err => {
        Logger.warn('F5-LT+', `Errore caricamento header-ticker per drawer tab ${tabId}`, err);
      });
    });
  }
  
  // Monta header-ticker per AI Summary (sempre visibile) - import dinamico
  const aiSummaryTicker = node.querySelector('[data-ai-summary-ticker="true"]');
  if (aiSummaryTicker) {
    import('../components/header-ticker.js').then(({ headerTicker }) => {
      const rows = generateAISummaryRows(data);
      if (rows.length > 0) {
        const tickerNode = headerTicker.mount(aiSummaryTicker);
        if (tickerNode) {
          headerTicker.update(tickerNode, {
            ...rawData.meta,
            rows: rows,
            metricsPanel: rawData?.metricsPanel || []
          });
        }
      }
    }).catch(err => {
      Logger.warn('F5-LT+', 'Errore caricamento header-ticker per AI summary', err);
    });
  }
}

