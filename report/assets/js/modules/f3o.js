// /report/assets/js/modules/f3o.js
// F3O · Options Overlay - Design Unificato
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

function normalizeDataPublicF3O(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? "—",
    module: src?.meta?.module ?? "F3O · Options Overlay",
    moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
    freshness: src?.meta?.freshness ?? "≤ T-1",
    hero_intro: src?.meta?.hero_intro ?? "",
    hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F3O',
    hero_title: 'Volatilità, curva IV, skew e posizionamento',
    hero_subtitle: 'Options Overlay · Orizzonte 3–10 giorni',
    hero_desc: 'Analisi opzioni: volatilità implicita, gamma, vega, skew e posizionamento. Nessun contenuto operativo.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles
    tab_kpi: 'Quadro rapido',
    tab_em: 'Range atteso (EM)',
    tab_term: 'Curva IV (scadenze)',
    tab_skew: 'Skew 25Δ (asimmetria)',
    tab_pcr: 'Put/Call & OI',
    tab_gamma: 'Gamma · Max Pain · Dealer',
    tab_flow: 'Flussi opzioni (istituzionali)',
    tab_sintesi: 'Sintesi educativa',
    tab_governance: 'Governance',
    // Metric labels
    label_iv_atm: 'IV (ATM)',
    label_iv_rank: 'IV Rank / %tile',
    label_gsr: 'GSR (Γ/Vega)',
    label_dealer: 'Dealer Regime',
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
    tab_kpi: uiFromS('tab_kpi', defaults.tab_kpi),
    tab_em: uiFromS('tab_em', defaults.tab_em),
    tab_term: uiFromS('tab_term', defaults.tab_term),
    tab_skew: uiFromS('tab_skew', defaults.tab_skew),
    tab_pcr: uiFromS('tab_pcr', defaults.tab_pcr),
    tab_gamma: uiFromS('tab_gamma', defaults.tab_gamma),
    tab_flow: uiFromS('tab_flow', defaults.tab_flow),
    tab_sintesi: uiFromS('tab_sintesi', defaults.tab_sintesi),
    tab_governance: uiFromS('tab_governance', defaults.tab_governance)
  };

  return {
    meta,
    labels,
    head: src.head || src.options || {},
    expected_move: src.expected_move || {},
    term_structure: src.term_structure || {},
    skew: src.skew || {},
    pcr: src.pcr || {},
    gamma: src.gamma || {},
    flow: src.flow || {},
    sintesi_ai: src.sintesi_ai || {},
    audit_quality: src.audit_quality || {},
    mifid: src.mifid || {}
  };
}

/**
 * Genera rows + parts per riassunto AI (sempre visibile)
 */
function generateAISummaryRows(data) {
  const rows = [];
  const d = data;
  const labels = d.labels || {};
  
  // ROW 1: IV_ATM + IV_rank_pct
  const ivAtm = d.head?.IV_ATM?.raw || d.head?.IV_ATM || '—';
  const ivRank = d.head?.IV_rank_pct?.raw || d.head?.IV_rank_pct || '—';
  
  rows.push({
    id: 'f3o-summary-iv',
    parts: [
      { kind: 'text', text: `${labels.label_iv_atm || 'IV (ATM)'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'IV_ATM',
        value: String(ivAtm),
        label: labels.label_iv_atm || 'IV_ATM',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_iv_rank || 'IV Rank / %tile'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'IV_rank_pct',
        value: String(ivRank),
        label: labels.label_iv_rank || 'IV_rank_pct',
        tone: 'neutral'
      }
    ]
  });
  
  // ROW 2: GSR_tkr + DealerGamma
  const gsr = d.head?.GSR_tkr?.raw || d.head?.GSR_tkr || '—';
  const dealer = d.head?.DealerGamma?.raw || d.head?.DealerGamma || '—';
  
  rows.push({
    id: 'f3o-summary-gsr',
    parts: [
      { kind: 'text', text: `${labels.label_gsr || 'GSR (Γ/Vega)'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'GSR_tkr',
        value: String(gsr),
        label: labels.label_gsr || 'GSR_tkr',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_dealer || 'Dealer Regime'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'DealerGamma',
        value: String(dealer),
        label: labels.label_dealer || 'DealerGamma',
        tone: 'neutral'
      }
    ]
  });
  
  return rows;
}

/**
 * Genera rows + parts per tab KPI
 */
function generateKPITabRows(data) {
  const rows = [];
  const d = data.head || {};
  const labels = data.labels || {};
  
  if (d.IV_ATM) {
    rows.push({
      id: 'kpi-iv-atm',
      parts: [
        { kind: 'text', text: `${labels.label_iv_atm || 'IV (ATM)'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'IV_ATM',
          value: String(d.IV_ATM?.raw || d.IV_ATM || '—'),
          label: labels.label_iv_atm || 'IV_ATM',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.IV_rank_pct) {
    rows.push({
      id: 'kpi-iv-rank',
      parts: [
        { kind: 'text', text: `${labels.label_iv_rank || 'IV Rank / %tile'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'IV_rank_pct',
          value: String(d.IV_rank_pct?.raw || d.IV_rank_pct || '—'),
          label: labels.label_iv_rank || 'IV_rank_pct',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF3O(rawData);
  const labels = d.labels || {};
  
  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F3O',
    subtitle: labels.hero_subtitle || 'Options Overlay · Orizzonte 3–10 giorni',
    title: labels.hero_title || 'Volatilità, curva IV, skew e posizionamento',
    desc: labels.hero_desc || 'Analisi opzioni: volatilità implicita, gamma, vega, skew e posizionamento. Nessun contenuto operativo.',
    status: d.meta.moduleStatus,
    freshness: d.meta.freshness
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
  
  // Tab 1: KPI
  if (d.head && Object.keys(d.head).length > 0) {
    tabs.push({
      id: 'kpi',
      title: labels.tab_kpi || 'Quadro rapido',
      content: '<div data-tab-ticker="kpi"></div>',
      active: false,
      rows: generateKPITabRows(d)
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
  const data = normalizeDataPublicF3O(rawData);
  
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
        if (tabId === 'kpi') {
          rows = generateKPITabRows(data);
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
                Logger.debug('F3O', `Metriche montate nel drawer: ${metricButtons.length}`);
              }
            }, 50);
          }
        }
      }).catch(err => {
        Logger.warn('F3O', `Errore caricamento header-ticker per drawer tab ${tabId}`, err);
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
      Logger.warn('F3O', 'Errore caricamento header-ticker per AI summary', err);
    });
  }
}
