// /report/assets/js/modules/f2.js
// F2 · Macro & Sentiment - Design Unificato
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

function normalizeDataPublicF2(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? "—",
    module: src?.meta?.module ?? "F2 · Macro & Sentiment",
    moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
    freshness: src?.meta?.freshness ?? "≤ T-1",
    hero_intro: src?.meta?.hero_intro ?? "",
    hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F2',
    hero_title: 'Sentiment & overlay fondamentali (ticker‑level)',
    hero_subtitle: 'Macro & Sentiment · Orizzonte 3–10 giorni',
    hero_desc: 'Contesto sintetico non operativo su sentiment, fondamentali descrittivi e newsflow.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles
    tab_macro: 'Controlli Rischio',
    tab_sci: 'Sentiment Sintetico',
    tab_dpi: 'Fondamentali (profilo)',
    tab_fundamentals: 'Fondamentali · Trend',
    tab_icr: 'Confronto Peers & ETF',
    tab_etfpos: 'ETF & Posizionamento',
    tab_news: 'Newsflow 24–48h',
    tab_surveys: 'Sondaggi',
    tab_sintesi: 'Sintesi Educativa',
    tab_governance: 'Governance',
    // Metric labels
    label_macrogate: 'MacroGate',
    label_sentiment_composite: 'Sentiment',
    label_etf_flow_tone: 'ETF Flussi',
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
    tab_macro: uiFromS('tab_macro', defaults.tab_macro),
    tab_sci: uiFromS('tab_sci', defaults.tab_sci),
    tab_dpi: uiFromS('tab_dpi', defaults.tab_dpi),
    tab_fundamentals: uiFromS('tab_fundamentals', defaults.tab_fundamentals),
    tab_icr: uiFromS('tab_icr', defaults.tab_icr),
    tab_etfpos: uiFromS('tab_etfpos', defaults.tab_etfpos),
    tab_news: uiFromS('tab_news', defaults.tab_news),
    tab_surveys: uiFromS('tab_surveys', defaults.tab_surveys),
    tab_sintesi: uiFromS('tab_sintesi', defaults.tab_sintesi),
    tab_governance: uiFromS('tab_governance', defaults.tab_governance)
  };

  return {
    meta,
    labels,
    step1: src.step1_f2_webprobe || src.step1 || {},
    sci_dpi: src.SCI_tkr || src.sci_dpi || {},
    dpi: src.DPI_context || src.dpi || {},
    icr: src.ICR_tkr || src.icr || {},
    metadata: src.metadata || {},
    etf_exposure: src.etf_exposure || {},
    newsflow: src.news_stream || src.newsflow || {},
    positioning: src.positioning || {},
    surveys: src.surveys || {},
    sentiment_flows: src.sentiment_flows || {},
    audit_quality: src.audit_quality || {},
    mifid: src.mifid || {},
    sintesi_ai: src.sintesi_ai || {}
  };
}

/**
 * Genera rows + parts per riassunto AI (sempre visibile)
 */
function generateAISummaryRows(data) {
  const rows = [];
  const d = data;
  const labels = d.labels || {};
  
  // ROW 1: MacroGate + SentimentComposite
  const macroGate = d.step1?.MacroGate?.raw || d.step1?.MacroGate || '—';
  const sentiment = d.sentiment_flows?.SentimentComposite?.raw || d.sentiment_flows?.SentimentComposite || '—';
  
  rows.push({
    id: 'f2-summary-macrogate',
    parts: [
      { kind: 'text', text: `${labels.label_macrogate || 'MacroGate'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'MacroGate',
        value: String(macroGate),
        label: labels.label_macrogate || 'MacroGate',
        tone: getToneForMacroGate(macroGate)
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_sentiment_composite || 'Sentiment'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'SentimentComposite',
        value: String(sentiment),
        label: labels.label_sentiment_composite || 'SentimentComposite',
        tone: 'neutral'
      }
    ]
  });
  
  // ROW 2: ETF Flow Tone
  const etfFlow = d.sentiment_flows?.ETF_FlowTone?.raw || d.sentiment_flows?.ETF_FlowTone || '—';
  if (etfFlow !== '—') {
    rows.push({
      id: 'f2-summary-etf-flow',
      parts: [
        { kind: 'text', text: `${labels.label_etf_flow_tone || 'ETF Flussi'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'ETF_FlowTone',
          value: String(etfFlow),
          label: labels.label_etf_flow_tone || 'ETF_FlowTone',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

/**
 * Genera rows + parts per tab Macro
 */
function generateMacroTabRows(data) {
  const rows = [];
  const d = data.step1 || {};
  const labels = data.labels || {};
  
  if (d.MacroGate) {
    rows.push({
      id: 'macro-gate',
      parts: [
        { kind: 'text', text: `${labels.label_macrogate || 'MacroGate'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'MacroGate',
          value: String(d.MacroGate?.raw || d.MacroGate || '—'),
          label: labels.label_macrogate || 'MacroGate',
          tone: getToneForMacroGate(d.MacroGate?.raw || d.MacroGate)
        }
      ]
    });
  }
  
  return rows;
}

/**
 * Genera rows + parts per tab SCI
 */
function generateSCITabRows(data) {
  const rows = [];
  const d = data.sci_dpi || {};
  const labels = data.labels || {};
  
  if (d.TECH_SIGNAL) {
    rows.push({
      id: 'sci-tech',
      parts: [
        { kind: 'text', text: `Tecnico (Barchart)${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'TECH_SIGNAL',
          value: String(d.TECH_SIGNAL?.raw || d.TECH_SIGNAL || '—'),
          label: 'TECH_SIGNAL',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.NEWS_TONE) {
    rows.push({
      id: 'sci-news',
      parts: [
        { kind: 'text', text: `News · Tono${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'NEWS_TONE',
          value: String(d.NEWS_TONE?.raw || d.NEWS_TONE || '—'),
          label: 'NEWS_TONE',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.CONSENSUS_LEVEL) {
    rows.push({
      id: 'sci-consensus',
      parts: [
        { kind: 'text', text: `Analyst · Consenso${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'CONSENSUS_LEVEL',
          value: String(d.CONSENSUS_LEVEL?.raw || d.CONSENSUS_LEVEL || '—'),
          label: 'CONSENSUS_LEVEL',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

/**
 * Genera rows + parts per tab DPI
 */
function generateDPITabRows(data) {
  const rows = [];
  const d = data.dpi || {};
  const labels = data.labels || {};
  
  if (d.PERF_VECTOR) {
    rows.push({
      id: 'dpi-perf',
      parts: [
        { kind: 'text', text: `Perf. vector (descrittivo)${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'PERF_VECTOR',
          value: String(d.PERF_VECTOR?.raw || d.PERF_VECTOR || '—'),
          label: 'PERF_VECTOR',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.VALUATION_SNAPSHOT) {
    rows.push({
      id: 'dpi-valuation',
      parts: [
        { kind: 'text', text: `Valuation snapshot${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'VALUATION_SNAPSHOT',
          value: String(d.VALUATION_SNAPSHOT?.raw || d.VALUATION_SNAPSHOT || '—'),
          label: 'VALUATION_SNAPSHOT',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

// Helper functions
function getToneForMacroGate(gate) {
  if (typeof gate !== 'string') return 'neutral';
  const g = gate.toUpperCase();
  if (g === 'PASS') return 'ok';
  if (g === 'REVIEW') return 'warn';
  if (g === 'FAIL') return 'err';
  return 'neutral';
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF2(rawData);
  const labels = d.labels || {};
  
  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F2',
    subtitle: labels.hero_subtitle || 'Macro & Sentiment · Orizzonte 3–10 giorni',
    title: labels.hero_title || 'Sentiment & overlay fondamentali (ticker‑level)',
    desc: labels.hero_desc || 'Contesto sintetico non operativo su sentiment, fondamentali descrittivi e newsflow.',
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
  
  // Tab 1: Macro
  if (d.step1 && Object.keys(d.step1).length > 0) {
    tabs.push({
      id: 'macro',
      title: labels.tab_macro || 'Controlli Rischio',
      content: '<div data-tab-ticker="macro"></div>',
      active: false,
      rows: generateMacroTabRows(d)
    });
  }
  
  // Tab 2: SCI
  if (d.sci_dpi && Object.keys(d.sci_dpi).length > 0) {
    tabs.push({
      id: 'sci',
      title: labels.tab_sci || 'Sentiment Sintetico',
      content: '<div data-tab-ticker="sci"></div>',
      active: false,
      rows: generateSCITabRows(d)
    });
  }
  
  // Tab 3: DPI
  if (d.dpi && Object.keys(d.dpi).length > 0) {
    tabs.push({
      id: 'dpi',
      title: labels.tab_dpi || 'Fondamentali (profilo)',
      content: '<div data-tab-ticker="dpi"></div>',
      active: false,
      rows: generateDPITabRows(d)
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
  const data = normalizeDataPublicF2(rawData);
  
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
        if (tabId === 'macro') {
          rows = generateMacroTabRows(data);
        } else if (tabId === 'sci') {
          rows = generateSCITabRows(data);
        } else if (tabId === 'dpi') {
          rows = generateDPITabRows(data);
        }
        
        if (rows.length > 0) {
          const tickerNode = headerTicker.mount(container);
          if (tickerNode) {
            headerTicker.update(tickerNode, {
              ...rawData.meta,
              rows: rows,
              metricsPanel: rawData?.metricsPanel || []
            });
            
            // IMPORTANTE: Assicurati che i click handler siano bindati dopo il rendering
            setTimeout(() => {
              const metricButtons = tickerNode.querySelectorAll('.metric-inline[data-metric]');
              if (metricButtons.length > 0) {
                Logger.debug('F2', `Metriche montate nel drawer: ${metricButtons.length}`);
              }
            }, 50);
          }
        }
      }).catch(err => {
        Logger.warn('F2', `Errore caricamento header-ticker per drawer tab ${tabId}`, err);
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
      Logger.warn('F2', 'Errore caricamento header-ticker per AI summary', err);
    });
  }
}
