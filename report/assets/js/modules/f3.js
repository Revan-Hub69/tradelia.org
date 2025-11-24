// /report/assets/js/modules/f3.js
// F3 · Analisi Tecnica Multi-TF - Design Unificato
// Usa stessa logica di header-ticker: riassunto AI sempre visibile + tabs laterali

import {
  renderModuleHeader,
  renderModuleTabsSidebar,
  bindModuleTabs,
} from '../components/module-header.js';
import Logger from '../utils/logger.js';
// header-ticker viene importato dinamicamente quando necessario

// Helper functions
function escapeHtml(str) {
  if (str == null) {return '';}
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  if (str == null) {return '';}
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalizeDataPublicF3(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? '—',
    module: src?.meta?.module ?? 'F3 · Analisi Tecnica MTF',
    moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness: src?.meta?.freshness ?? '≤ T-1',
    hero_intro: src?.meta?.hero_intro ?? '',
    hero_disclaimer:
      src?.meta?.hero_disclaimer ??
      'Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II).',
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F3',
    hero_title: 'Struttura tecnica multi-timeframe (volumetrico-first)',
    hero_subtitle: 'Analisi Tecnica MTF · Orizzonte 3–10 giorni',
    hero_desc:
      'Lettura istituzionale W1→D1→H4→H1 e sintesi probabilistica. Nessun contenuto operativo.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles
    tab_dataset: 'Dataset & Sync',
    tab_w1: 'W1 · Direzionale',
    tab_d1: 'D1 · Swing',
    tab_h4: 'H4 · Validazione',
    tab_h1: 'H1 · Timing',
    tab_price: 'Price History',
    tab_patterns: 'Pattern MTF',
    tab_mtf: 'Consolidamento & Prob',
    tab_governance: 'Governance',
    // Metric labels
    label_bias_mtf: 'Bias MTF',
    label_mtf_score: 'MTF Score',
    label_p_swing_up: 'P(SwingUp)',
    // Separatori
    separator_dot: ' · ',
    separator_colon: ': ',
    separator_comma: ', ',
  };

  // Mappa dinamicamente ui_labels → labels
  const UL = src?.ui_labels || {};
  const uiFromS = (k, fallback) =>
    typeof UL[k] === 'string' && UL[k].trim() ? UL[k].trim() : fallback;

  const labels = {
    ...defaults,
    ...UL,
    badge: UL?.badge || defaults.badge,
    hero_title: UL?.hero_title || defaults.hero_title,
    hero_subtitle: UL?.hero_subtitle || defaults.hero_subtitle,
    hero_desc: UL?.hero_desc || defaults.hero_desc,
    ai_summary_label: uiFromS('ai_summary_label', defaults.ai_summary_label),
    tab_dataset: uiFromS('tab_dataset', defaults.tab_dataset),
    tab_w1: uiFromS('tab_w1', defaults.tab_w1),
    tab_d1: uiFromS('tab_d1', defaults.tab_d1),
    tab_h4: uiFromS('tab_h4', defaults.tab_h4),
    tab_h1: uiFromS('tab_h1', defaults.tab_h1),
    tab_price: uiFromS('tab_price', defaults.tab_price),
    tab_patterns: uiFromS('tab_patterns', defaults.tab_patterns),
    tab_mtf: uiFromS('tab_mtf', defaults.tab_mtf),
    tab_governance: uiFromS('tab_governance', defaults.tab_governance),
  };

  return {
    meta,
    labels,
    head: src.head || {},
    dataset: src.dataset || {},
    W1: src.W1 || {},
    D1: src.D1 || {},
    H4: src.H4 || {},
    H1: src.H1 || {},
    price_history: src.price_history || {},
    pattern_mtf: src.pattern_mtf || {},
    mtf_consolidation: src.mtf_consolidation || {},
    governance: src.governance || {},
  };
}

/**
 * Genera rows + parts per riassunto AI (sempre visibile)
 */
function generateAISummaryRows(data) {
  const rows = [];
  const d = data;
  const labels = d.labels || {};

  // ROW 1: BiasMTF + MTF_Score
  const biasMTF = d.head?.BiasMTF?.raw || d.head?.BiasMTF || '—';
  const mtfScore = d.head?.MTF_Score?.raw || d.head?.MTF_Score || '—';

  rows.push({
    id: 'f3-summary-bias',
    parts: [
      {
        kind: 'text',
        text: `${labels.label_bias_mtf || 'Bias MTF'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'BiasMTF',
        value: String(biasMTF),
        label: labels.label_bias_mtf || 'BiasMTF',
        tone: 'neutral',
      },
      {
        kind: 'text',
        text: `${labels.separator_dot || ' · '}${labels.label_mtf_score || 'MTF Score'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'MTF_Score',
        value: String(mtfScore),
        label: labels.label_mtf_score || 'MTF_Score',
        tone: 'neutral',
      },
    ],
  });

  // ROW 2: P_SwingUp
  const pSwingUp = d.head?.P_SwingUp?.raw || d.head?.P_SwingUp || '—';
  if (pSwingUp !== '—') {
    rows.push({
      id: 'f3-summary-prob',
      parts: [
        {
          kind: 'text',
          text: `${labels.label_p_swing_up || 'P(SwingUp)'}${labels.separator_colon || ': '}`,
        },
        {
          kind: 'metric',
          key: 'P_SwingUp',
          value: String(pSwingUp),
          label: labels.label_p_swing_up || 'P_SwingUp',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

/**
 * Genera rows + parts per tab W1
 */
function generateW1TabRows(data) {
  const rows = [];
  const d = data.W1 || {};
  const labels = data.labels || {};

  if (d.RSI14) {
    rows.push({
      id: 'w1-rsi',
      parts: [
        { kind: 'text', text: `RSI(14)${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'RSI14_W1',
          value: String(d.RSI14?.raw || d.RSI14 || '—'),
          label: 'RSI14',
          tone: 'neutral',
        },
      ],
    });
  }

  if (d.ADX14) {
    rows.push({
      id: 'w1-adx',
      parts: [
        { kind: 'text', text: `ADX(14)${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'ADX14_W1',
          value: String(d.ADX14?.raw || d.ADX14 || '—'),
          label: 'ADX14',
          tone: 'neutral',
        },
      ],
    });
  }

  if (d.MACD) {
    rows.push({
      id: 'w1-macd',
      parts: [
        { kind: 'text', text: `MACD(12,26,9)${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'MACD_W1',
          value: String(d.MACD?.raw || d.MACD || '—'),
          label: 'MACD',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

/**
 * Genera rows + parts per tab D1
 */
function generateD1TabRows(data) {
  const rows = [];
  const d = data.D1 || {};
  const labels = data.labels || {};

  if (d.RSI14) {
    rows.push({
      id: 'd1-rsi',
      parts: [
        { kind: 'text', text: `RSI(14)${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'RSI14_D1',
          value: String(d.RSI14?.raw || d.RSI14 || '—'),
          label: 'RSI14',
          tone: 'neutral',
        },
      ],
    });
  }

  if (d.ADX14) {
    rows.push({
      id: 'd1-adx',
      parts: [
        { kind: 'text', text: `ADX(14)${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'ADX14_D1',
          value: String(d.ADX14?.raw || d.ADX14 || '—'),
          label: 'ADX14',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF3(rawData);
  const labels = d.labels || {};

  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F3',
    subtitle: labels.hero_subtitle || 'Analisi Tecnica MTF · Orizzonte 3–10 giorni',
    title: labels.hero_title || 'Struttura tecnica multi-timeframe (volumetrico-first)',
    desc:
      labels.hero_desc ||
      'Lettura istituzionale W1→D1→H4→H1 e sintesi probabilistica. Nessun contenuto operativo.',
    status: d.meta.moduleStatus,
    freshness: d.meta.freshness,
    disclaimer: d.meta.hero_disclaimer || d.mifid?.disclaimer || '',
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

  // Tab 1: W1
  if (d.W1 && Object.keys(d.W1).length > 0) {
    tabs.push({
      id: 'w1',
      title: labels.tab_w1 || 'W1 · Direzionale',
      content: '<div data-tab-ticker="w1"></div>',
      active: false,
      rows: generateW1TabRows(d),
    });
  }

  // Tab 2: D1
  if (d.D1 && Object.keys(d.D1).length > 0) {
    tabs.push({
      id: 'd1',
      title: labels.tab_d1 || 'D1 · Swing',
      content: '<div data-tab-ticker="d1"></div>',
      active: false,
      rows: generateD1TabRows(d),
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
  if (!node || !rawData) {return;}
  const data = normalizeDataPublicF3(rawData);

  // Bind tabs menu + drawer
  const tabsWrapper = node.querySelector('.module-tabs-wrapper');
  if (tabsWrapper) {
    bindModuleTabs(tabsWrapper);

    // Listener per quando si apre una tab nel drawer
    tabsWrapper.addEventListener('drawer-tab-opened', (e) => {
      const { tabId, container } = e.detail;
      if (!container) {return;}

      // Monta header-ticker nel drawer
      import('../components/header-ticker.js')
        .then(({ headerTicker }) => {
          let rows = [];
          if (tabId === 'w1') {
            rows = generateW1TabRows(data);
          } else if (tabId === 'd1') {
            rows = generateD1TabRows(data);
          }

          if (rows.length > 0) {
            const tickerNode = headerTicker.mount(container);
            if (tickerNode) {
              headerTicker.update(tickerNode, {
                ...rawData.meta,
                rows: rows,
                metricsPanel: rawData?.metricsPanel || [],
              });

              setTimeout(() => {
                const metricButtons = tickerNode.querySelectorAll('.metric-inline[data-metric]');
                if (metricButtons.length > 0) {
                  Logger.debug('F3', `Metriche montate nel drawer: ${metricButtons.length}`);
                }
              }, 50);
            }
          }
        })
        .catch((err) => {
          Logger.warn('F3', `Errore caricamento header-ticker per drawer tab ${tabId}`, err);
        });
    });
  }

  // Monta header-ticker per AI Summary (sempre visibile) - import dinamico
  const aiSummaryTicker = node.querySelector('[data-ai-summary-ticker="true"]');
  if (aiSummaryTicker) {
    import('../components/header-ticker.js')
      .then(({ headerTicker }) => {
        const rows = generateAISummaryRows(data);
        if (rows.length > 0) {
          const tickerNode = headerTicker.mount(aiSummaryTicker);
          if (tickerNode) {
            headerTicker.update(tickerNode, {
              ...rawData.meta,
              rows: rows,
              metricsPanel: rawData?.metricsPanel || [],
            });
          }
        }
      })
      .catch((err) => {
        Logger.warn('F3', 'Errore caricamento header-ticker per AI summary', err);
      });
  }
}
