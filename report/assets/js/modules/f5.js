// /report/assets/js/modules/f5.js
// F5 · Analisi Configurazione Tecnica - Design Unificato
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

function normalizeDataPublicF5(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? '—',
    module: src?.meta?.module ?? 'F5 · Analisi Configurazione Tecnica',
    moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness: src?.meta?.freshness ?? '≤ T-1',
    hero_intro: src?.meta?.hero_intro ?? '',
    hero_disclaimer:
      src?.meta?.hero_disclaimer ??
      'Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II).',
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F5',
    hero_title: 'Configurazione tecnica esemplificativa, coerente con bias e rischio',
    hero_subtitle: 'Analisi Configurazione Tecnica · Orizzonte 3–10 giorni',
    hero_desc:
      'Analisi educativa di configurazioni tecniche esemplificative, coerenti con bias e rischio. Nessun contenuto operativo o raccomandativo.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles (terminologia educativa, non operativa)
    tab_entry: 'Punto di Riferimento Iniziale',
    tab_stop: 'Soglia di Monitoraggio',
    tab_tp: 'Obiettivo Esemplificativo',
    tab_flow: 'FlowScore',
    tab_setup: 'Dettagli Configurazione',
    tab_governance: 'Governance',
    // Metric labels (terminologia educativa, non operativa)
    label_entry: 'Punto di Riferimento',
    label_stop: 'Soglia Monitoraggio',
    label_tp: 'Obiettivo Esemplificativo',
    label_flow_score: 'FlowScore',
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
    tab_entry: uiFromS('tab_entry', defaults.tab_entry),
    tab_stop: uiFromS('tab_stop', defaults.tab_stop),
    tab_tp: uiFromS('tab_tp', defaults.tab_tp),
    tab_flow: uiFromS('tab_flow', defaults.tab_flow),
    tab_setup: uiFromS('tab_setup', defaults.tab_setup),
    tab_governance: uiFromS('tab_governance', defaults.tab_governance),
  };

  return {
    meta,
    labels,
    entry: src.entry || {},
    stop: src.stop || {},
    tp: src.tp || {},
    flow_score: src.flow_score || src.FlowScore || {},
    setup_details: src.setup_details || {},
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

  // ROW 1: Punto di Riferimento + Soglia di Monitoraggio
  const entry = d.entry?.Entry?.raw || d.entry?.Entry || '—';
  const stop = d.stop?.Stop?.raw || d.stop?.Stop || '—';

  rows.push({
    id: 'f5-summary-entry-stop',
    parts: [
      {
        kind: 'text',
        text: `${labels.label_entry || 'Punto di Riferimento'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'Entry',
        value: String(entry),
        label: labels.label_entry || 'Punto di Riferimento',
        tone: 'neutral',
      },
      {
        kind: 'text',
        text: `${labels.separator_dot || ' · '}${labels.label_stop || 'Soglia Monitoraggio'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'Stop',
        value: String(stop),
        label: labels.label_stop || 'Soglia Monitoraggio',
        tone: 'neutral',
      },
    ],
  });

  // ROW 2: Obiettivo Esemplificativo + FlowScore
  const tp = d.tp?.TP?.raw || d.tp?.TP || '—';
  const flowScore = d.flow_score?.FlowScore?.raw || d.flow_score?.FlowScore || '—';

  rows.push({
    id: 'f5-summary-tp-flow',
    parts: [
      {
        kind: 'text',
        text: `${labels.label_tp || 'Obiettivo Esemplificativo'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'TP',
        value: String(tp),
        label: labels.label_tp || 'Obiettivo Esemplificativo',
        tone: 'neutral',
      },
      {
        kind: 'text',
        text: `${labels.separator_dot || ' · '}${labels.label_flow_score || 'FlowScore'}${labels.separator_colon || ': '}`,
      },
      {
        kind: 'metric',
        key: 'FlowScore',
        value: String(flowScore),
        label: labels.label_flow_score || 'FlowScore',
        tone: 'neutral',
      },
    ],
  });

  return rows;
}

/**
 * Genera rows + parts per tab Punto di Riferimento Iniziale
 */
function generateEntryTabRows(data) {
  const rows = [];
  const d = data.entry || {};
  const labels = data.labels || {};

  if (d.Entry) {
    rows.push({
      id: 'entry-price',
      parts: [
        {
          kind: 'text',
          text: `${labels.label_entry || 'Punto di Riferimento'}${labels.separator_colon || ': '}`,
        },
        {
          kind: 'metric',
          key: 'Entry',
          value: String(d.Entry?.raw || d.Entry || '—'),
          label: labels.label_entry || 'Punto di Riferimento',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

/**
 * Genera rows + parts per tab Soglia di Monitoraggio
 */
function generateStopTabRows(data) {
  const rows = [];
  const d = data.stop || {};
  const labels = data.labels || {};

  if (d.Stop) {
    rows.push({
      id: 'stop-price',
      parts: [
        {
          kind: 'text',
          text: `${labels.label_stop || 'Soglia Monitoraggio'}${labels.separator_colon || ': '}`,
        },
        {
          kind: 'metric',
          key: 'Stop',
          value: String(d.Stop?.raw || d.Stop || '—'),
          label: labels.label_stop || 'Soglia Monitoraggio',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

/**
 * Genera rows + parts per tab Obiettivo Esemplificativo
 */
function generateTPTabRows(data) {
  const rows = [];
  const d = data.tp || {};
  const labels = data.labels || {};

  if (d.TP) {
    rows.push({
      id: 'tp-price',
      parts: [
        {
          kind: 'text',
          text: `${labels.label_tp || 'Obiettivo Esemplificativo'}${labels.separator_colon || ': '}`,
        },
        {
          kind: 'metric',
          key: 'TP',
          value: String(d.TP?.raw || d.TP || '—'),
          label: labels.label_tp || 'Obiettivo Esemplificativo',
          tone: 'neutral',
        },
      ],
    });
  }

  return rows;
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF5(rawData);
  const labels = d.labels || {};

  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F5',
    subtitle: labels.hero_subtitle || 'Analisi Configurazione Tecnica · Orizzonte 3–10 giorni',
    title:
      labels.hero_title || 'Configurazione tecnica esemplificativa, coerente con bias e rischio',
    desc:
      labels.hero_desc ||
      'Analisi educativa di configurazioni tecniche esemplificative, coerenti con bias e rischio. Nessun contenuto operativo o raccomandativo.',
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

  // Tab 1: Punto di Riferimento Iniziale
  if (d.entry && Object.keys(d.entry).length > 0) {
    tabs.push({
      id: 'entry',
      title: labels.tab_entry || 'Punto di Riferimento Iniziale',
      content: '<div data-tab-ticker="entry"></div>',
      active: false,
      rows: generateEntryTabRows(d),
    });
  }

  // Tab 2: Soglia di Monitoraggio
  if (d.stop && Object.keys(d.stop).length > 0) {
    tabs.push({
      id: 'stop',
      title: labels.tab_stop || 'Soglia di Monitoraggio',
      content: '<div data-tab-ticker="stop"></div>',
      active: false,
      rows: generateStopTabRows(d),
    });
  }

  // Tab 3: Obiettivo Esemplificativo
  if (d.tp && Object.keys(d.tp).length > 0) {
    tabs.push({
      id: 'tp',
      title: labels.tab_tp || 'Obiettivo Esemplificativo',
      content: '<div data-tab-ticker="tp"></div>',
      active: false,
      rows: generateTPTabRows(d),
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
  const data = normalizeDataPublicF5(rawData);

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
          if (tabId === 'entry') {
            rows = generateEntryTabRows(data);
          } else if (tabId === 'stop') {
            rows = generateStopTabRows(data);
          } else if (tabId === 'tp') {
            rows = generateTPTabRows(data);
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
                  Logger.debug('F5', `Metriche montate nel drawer: ${metricButtons.length}`);
                }
              }, 50);
            }
          }
        })
        .catch((err) => {
          Logger.warn('F5', `Errore caricamento header-ticker per drawer tab ${tabId}`, err);
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
        Logger.warn('F5', 'Errore caricamento header-ticker per AI summary', err);
      });
  }
}
