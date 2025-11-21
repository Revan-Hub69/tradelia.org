// /report/assets/js/modules/f4.js
// F4 · Intermarket & Strutturale - Design Unificato
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
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalizeDataPublicF4(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? '—',
    module: src?.meta?.module ?? 'F4 · Intermarket & Strutturale',
    moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness: src?.meta?.freshness ?? '≤ T-1',
    hero_intro: src?.meta?.hero_intro ?? '',
    hero_disclaimer:
      src?.meta?.hero_disclaimer ??
      'Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II).',
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F4',
    hero_title: 'Verifica coerenza cross-asset e macro con il bias tecnico',
    hero_subtitle: 'Intermarket & Strutturale · Orizzonte 3–10 giorni',
    hero_desc:
      'Validazione coerenza cross-asset e macro con il bias tecnico. Nessun contenuto operativo.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles
    tab_intermarket: 'Intermarket Score',
    tab_concordance: 'Concordance',
    tab_cross_asset: 'Cross-Asset',
    tab_structural: 'Strutturale',
    tab_governance: 'Governance',
    // Metric labels
    label_bias_intermarket: 'BiasIntermarketScore',
    label_concordance: 'Concordance',
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
    tab_intermarket: uiFromS('tab_intermarket', defaults.tab_intermarket),
    tab_concordance: uiFromS('tab_concordance', defaults.tab_concordance),
    tab_cross_asset: uiFromS('tab_cross_asset', defaults.tab_cross_asset),
    tab_structural: uiFromS('tab_structural', defaults.tab_structural),
    tab_governance: uiFromS('tab_governance', defaults.tab_governance),
  };

  return {
    meta,
    labels,
    intermarket: src.intermarket || {},
    concordance: src.concordance || {},
    cross_asset: src.cross_asset || {},
    structural: src.structural || {},
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

  // ROW 1: BiasIntermarketScore + Concordance
  const biasIntermarket =
    d.intermarket?.BiasIntermarketScore?.raw || d.intermarket?.BiasIntermarketScore || '—';
  const concordance = d.concordance?.Concordance?.raw || d.concordance?.Concordance || '—';

  rows.push({
    id: 'f4-summary-bias',
    parts: [
      {
        kind: 'text',
        text: `${labels.label_bias_intermarket || 'BiasIntermarketScore'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'BiasIntermarketScore',
        value: String(biasIntermarket),
        label: labels.label_bias_intermarket || 'BiasIntermarketScore',
        tone: 'neutral',
      },
      {
        kind: 'text',
        text: `${labels.separator_dot || ' · '}${labels.label_concordance || 'Concordance'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'Concordance',
        value: String(concordance),
        label: labels.label_concordance || 'Concordance',
        tone: 'neutral',
      },
    ],
  });

  return rows;
}

/**
 * Genera rows + parts per tab Intermarket
 */
function generateIntermarketTabRows(data) {
  const rows = [];
  const d = data.intermarket || {};
  const labels = data.labels || {};

  if (d.BiasIntermarketScore) {
    rows.push({
      id: 'intermarket-bias',
      parts: [
        {
          kind: 'text',
          text: `${labels.label_bias_intermarket || 'BiasIntermarketScore'}${labels.separator_colon || ': '}`,
        },
        {
          kind: 'metric',
          key: 'BiasIntermarketScore',
          value: String(d.BiasIntermarketScore?.raw || d.BiasIntermarketScore || '—'),
          label: labels.label_bias_intermarket || 'BiasIntermarketScore',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

/**
 * Genera rows + parts per tab Concordance
 */
function generateConcordanceTabRows(data) {
  const rows = [];
  const d = data.concordance || {};
  const labels = data.labels || {};

  if (d.Concordance) {
    rows.push({
      id: 'concordance-score',
      parts: [
        {
          kind: 'text',
          text: `${labels.label_concordance || 'Concordance'}${labels.separator_colon || ': '}`,
        },
        {
          kind: 'metric',
          key: 'Concordance',
          value: String(d.Concordance?.raw || d.Concordance || '—'),
          label: labels.label_concordance || 'Concordance',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF4(rawData);
  const labels = d.labels || {};

  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F4',
    subtitle: labels.hero_subtitle || 'Intermarket & Strutturale · Orizzonte 3–10 giorni',
    title: labels.hero_title || 'Verifica coerenza cross-asset e macro con il bias tecnico',
    desc:
      labels.hero_desc ||
      'Validazione coerenza cross-asset e macro con il bias tecnico. Nessun contenuto operativo.',
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

  // Tab 1: Intermarket
  if (d.intermarket && Object.keys(d.intermarket).length > 0) {
    tabs.push({
      id: 'intermarket',
      title: labels.tab_intermarket || 'Intermarket Score',
      content: '<div data-tab-ticker="intermarket"></div>',
      active: false,
      rows: generateIntermarketTabRows(d),
    });
  }

  // Tab 2: Concordance
  if (d.concordance && Object.keys(d.concordance).length > 0) {
    tabs.push({
      id: 'concordance',
      title: labels.tab_concordance || 'Concordance',
      content: '<div data-tab-ticker="concordance"></div>',
      active: false,
      rows: generateConcordanceTabRows(d),
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
  const data = normalizeDataPublicF4(rawData);

  // Bind tabs menu + drawer
  const tabsWrapper = node.querySelector('.module-tabs-wrapper');
  if (tabsWrapper) {
    bindModuleTabs(tabsWrapper);

    // Listener per quando si apre una tab nel drawer
    tabsWrapper.addEventListener('drawer-tab-opened', (e) => {
      const { tabId, container } = e.detail;
      if (!container) return;

      // Monta header-ticker nel drawer
      import('../components/header-ticker.js')
        .then(({ headerTicker }) => {
          let rows = [];
          if (tabId === 'intermarket') {
            rows = generateIntermarketTabRows(data);
          } else if (tabId === 'concordance') {
            rows = generateConcordanceTabRows(data);
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
                  Logger.debug('F4', `Metriche montate nel drawer: ${metricButtons.length}`);
                }
              }, 50);
            }
          }
        })
        .catch((err) => {
          Logger.warn('F4', `Errore caricamento header-ticker per drawer tab ${tabId}`, err);
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
        Logger.warn('F4', 'Errore caricamento header-ticker per AI summary', err);
      });
  }
}
