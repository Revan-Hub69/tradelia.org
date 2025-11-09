// /report/assets/js/modules/f5b.js
// F5B · Analisi Strutture Opzioni - Design Unificato
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

function normalizeDataPublicF5B(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? "—",
    module: src?.meta?.module ?? "F5B · Analisi Strutture Opzioni",
    moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
    freshness: src?.meta?.freshness ?? "≤ T-1",
    hero_intro: src?.meta?.hero_intro ?? "",
    hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F5B',
    hero_title: 'Strutture opzioni esemplificative (CALL/PUT, spread)',
    hero_subtitle: 'Analisi Strutture Opzioni · Orizzonte 3–10 giorni',
    hero_desc: 'Analisi educativa di strutture opzioni esemplificative (CALL/PUT, spread), coerenti con bias e rischio. Nessun contenuto operativo o raccomandativo.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles (terminologia educativa, non operativa)
    tab_bias_option: 'Orientamento Strutturale',
    tab_iv_regime: 'Regime Volatilità Implicita',
    tab_setup_score: 'Score Configurazione F5B',
    tab_structures: 'Strutture Esemplificative',
    tab_governance: 'Governance',
    // Metric labels (terminologia educativa, non operativa)
    label_bias_option: 'Orientamento Strutturale',
    label_iv_regime: 'Regime Volatilità Implicita',
    label_setup_score: 'Score Configurazione F5B',
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
    tab_bias_option: uiFromS('tab_bias_option', defaults.tab_bias_option),
    tab_iv_regime: uiFromS('tab_iv_regime', defaults.tab_iv_regime),
    tab_setup_score: uiFromS('tab_setup_score', defaults.tab_setup_score),
    tab_structures: uiFromS('tab_structures', defaults.tab_structures),
    tab_governance: uiFromS('tab_governance', defaults.tab_governance)
  };

  return {
    meta,
    labels,
    bias_option: src.bias_option || src.BiasOption || {},
    iv_regime: src.iv_regime || src.IV_regime || {},
    setup_score: src.setup_score || src.SetupScore_F5B || {},
    structures: src.structures || {},
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
  
  // ROW 1: Orientamento Strutturale + Regime Volatilità Implicita
  const biasOption = d.bias_option?.BiasOption?.raw || d.bias_option?.BiasOption || '—';
  const ivRegime = d.iv_regime?.IV_regime?.raw || d.iv_regime?.IV_regime || '—';
  
  rows.push({
    id: 'f5b-summary-bias',
    parts: [
      { kind: 'text', text: `${labels.label_bias_option || 'Orientamento Strutturale'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'BiasOption',
        value: String(biasOption),
        label: labels.label_bias_option || 'Orientamento Strutturale',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_iv_regime || 'Regime Volatilità Implicita'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'IV_regime',
        value: String(ivRegime),
        label: labels.label_iv_regime || 'Regime Volatilità Implicita',
        tone: 'neutral'
      }
    ]
  });
  
  // ROW 2: Score Configurazione F5B
  const setupScore = d.setup_score?.SetupScore_F5B?.raw || d.setup_score?.SetupScore_F5B || '—';
  if (setupScore !== '—') {
    rows.push({
      id: 'f5b-summary-setup',
      parts: [
        { kind: 'text', text: `${labels.label_setup_score || 'Score Configurazione F5B'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'SetupScore_F5B',
          value: String(setupScore),
          label: labels.label_setup_score || 'Score Configurazione F5B',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

/**
 * Genera rows + parts per tab Orientamento Strutturale
 */
function generateBiasOptionTabRows(data) {
  const rows = [];
  const d = data.bias_option || {};
  const labels = data.labels || {};
  
  if (d.BiasOption) {
    rows.push({
      id: 'bias-option',
      parts: [
        { kind: 'text', text: `${labels.label_bias_option || 'Orientamento Strutturale'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'BiasOption',
          value: String(d.BiasOption?.raw || d.BiasOption || '—'),
          label: labels.label_bias_option || 'Orientamento Strutturale',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF5B(rawData);
  const labels = d.labels || {};
  
  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F5B',
    subtitle: labels.hero_subtitle || 'Analisi Strutture Opzioni · Orizzonte 3–10 giorni',
    title: labels.hero_title || 'Strutture opzioni esemplificative (CALL/PUT, spread)',
    desc: labels.hero_desc || 'Analisi educativa di strutture opzioni esemplificative (CALL/PUT, spread), coerenti con bias e rischio. Nessun contenuto operativo o raccomandativo.',
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
  
  // Tab 1: Orientamento Strutturale
  if (d.bias_option && Object.keys(d.bias_option).length > 0) {
    tabs.push({
      id: 'bias_option',
      title: labels.tab_bias_option || 'Orientamento Strutturale',
      content: '<div data-tab-ticker="bias_option"></div>',
      active: false,
      rows: generateBiasOptionTabRows(d)
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
  const data = normalizeDataPublicF5B(rawData);
  
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
        if (tabId === 'bias_option') {
          rows = generateBiasOptionTabRows(data);
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
                Logger.debug('F5B', `Metriche montate nel drawer: ${metricButtons.length}`);
              }
            }, 50);
          }
        }
      }).catch(err => {
        Logger.warn('F5B', `Errore caricamento header-ticker per drawer tab ${tabId}`, err);
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
      Logger.warn('F5B', 'Errore caricamento header-ticker per AI summary', err);
    });
  }
}

