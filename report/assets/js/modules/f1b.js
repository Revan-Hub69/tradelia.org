// /report/assets/js/modules/f1b.js
// F1B · Market Regime - Design Unificato
// Usa stessa logica di header-ticker: riassunto AI sempre visibile + tabs laterali

import { renderModuleHeader, renderModuleTabsSidebar, bindModuleTabs } from '../components/module-header.js';
// header-ticker viene importato dinamicamente quando necessario (non modificato)

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

function normalizeDataPublicF1B(src = {}) {
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? "—",
      module: src?.meta?.module ?? "F1B · Market Regime",
      moduleVersion: src?.meta?.moduleVersion ?? "v19-Dynamic",
      moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
      freshness: src?.meta?.freshness ?? "≤ T-1",
      hero_intro: src?.meta?.hero_intro ?? "",
      hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
    },
    regime_and_risk: src.regime_and_risk || {},
    breadth_rotation: src.breadth_rotation || {},
    internals_raw: src.internals_raw || {},
    street_view: src.street_view || {},
    sintesi_ai: src.sintesi_ai || {},
    finvizFilters: src.finvizFilters || null,
    bridgeF2: src.bridgeF2 || null,
    audit_quality: src.audit_quality || {},
    mifid: src.mifid || {}
  };
}

/**
 * Genera rows + parts per riassunto AI (sempre visibile)
 * Usa stessa logica di header-ticker
 */
function generateAISummaryRows(data) {
  const rows = [];
  const d = data;
  
  // ROW 1: StrategyMode + RegimeScore
  const strategyMode = d.regime_and_risk?.StrategyMode_macro?.raw || d.regime_and_risk?.StrategyMode_macro || '—';
  const regimeScore = d.regime_and_risk?.RegimeScore?.raw || d.regime_and_risk?.RegimeScore || '—';
  
  rows.push({
    id: 'f1b-summary-strategy',
    parts: [
      { kind: 'text', text: 'StrategyMode: ' },
      {
        kind: 'metric',
        key: 'StrategyMode_macro',
        value: String(strategyMode),
        label: 'StrategyMode',
        tone: getToneForStrategyMode(strategyMode)
      },
      { kind: 'text', text: ' · RegimeScore: ' },
      {
        kind: 'metric',
        key: 'RegimeScore',
        value: formatRegimeScore(regimeScore),
        label: 'RegimeScore',
        tone: getToneForRegimeScore(regimeScore)
      }
    ]
  });
  
  // ROW 2: Volatilità + Breadth
  const volRegime = d.regime_and_risk?.VolRegime?.raw || d.regime_and_risk?.VolRegime || '—';
  const breadth = d.breadth_rotation?.Breadth_1M?.raw || d.breadth_rotation?.Breadth_1M || '—';
  
  rows.push({
    id: 'f1b-summary-vol-breadth',
    parts: [
      { kind: 'text', text: 'Volatilità: ' },
      {
        kind: 'metric',
        key: 'VolRegime',
        value: String(volRegime),
        label: 'VolRegime',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · Breadth 1M: ' },
      {
        kind: 'metric',
        key: 'Breadth_1M',
        value: formatBreadth(breadth),
        label: 'Breadth 1M',
        tone: getToneForBreadth(breadth)
      }
    ]
  });
  
  // ROW 3: RiskTilt + Leaders
  const riskTilt = d.breadth_rotation?.RiskTilt_1M?.raw || d.breadth_rotation?.RiskTilt_1M || '—';
  const leaders = d.breadth_rotation?.Leadership?.LeadersMultiTF?.items || [];
  const leadersText = Array.isArray(leaders) && leaders.length > 0 
    ? leaders.slice(0, 3).join(', ') 
    : '—';
  
  rows.push({
    id: 'f1b-summary-risk-tilt',
    parts: [
      { kind: 'text', text: 'RiskTilt: ' },
      {
        kind: 'metric',
        key: 'RiskTilt_1M',
        value: String(riskTilt),
        label: 'RiskTilt 1M',
        tone: getToneForRiskTilt(riskTilt)
      },
      { kind: 'text', text: ' · Leaders: ' },
      { kind: 'text', text: leadersText }
    ]
  });
  
  // ROW 4: Size Bias + SmallCap
  const sizeBias = d.breadth_rotation?.SizeBias?.raw || d.breadth_rotation?.SizeBias || '—';
  const smallCap = d.breadth_rotation?.SmallCapPressure_1W?.raw || d.breadth_rotation?.SmallCapPressure_1W || '—';
  
  rows.push({
    id: 'f1b-summary-size',
    parts: [
      { kind: 'text', text: 'Size Bias: ' },
      {
        kind: 'metric',
        key: 'SizeBias',
        value: String(sizeBias),
        label: 'SizeBias',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · SmallCap Pressure: ' },
      {
        kind: 'metric',
        key: 'SmallCapPressure_1W',
        value: String(smallCap),
        label: 'SmallCap Pressure 1W',
        tone: 'neutral'
      }
    ]
  });
  
  // ROW 5: Credito + FX
  const credit = d.regime_and_risk?.CreditRiskBlock?.raw || d.regime_and_risk?.CreditRiskBlock || '—';
  const fx = d.regime_and_risk?.FX_Regime?.raw || d.regime_and_risk?.FX_Regime || '—';
  
  rows.push({
    id: 'f1b-summary-credit-fx',
    parts: [
      { kind: 'text', text: 'Credito: ' },
      {
        kind: 'metric',
        key: 'CreditRiskBlock',
        value: String(credit),
        label: 'CreditRiskBlock',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · FX: ' },
      {
        kind: 'metric',
        key: 'FX_Regime',
        value: String(fx),
        label: 'FX_Regime',
        tone: 'neutral'
      }
    ]
  });
  
  // ROW 6: Risk Window
  const riskWindow = d.regime_and_risk?.RiskWindow?.raw || d.regime_and_risk?.RiskWindow || '—';
  if (riskWindow !== '—') {
    rows.push({
      id: 'f1b-summary-risk-window',
      parts: [
        { kind: 'text', text: 'Risk Window (3–10g): ' },
        {
          kind: 'metric',
          key: 'RiskWindow',
          value: String(riskWindow),
          label: 'RiskWindow',
          tone: 'yellow'
        }
      ]
    });
  }
  
  // ROW 7: Liquidity + Index Momentum
  const liquidity = d.regime_and_risk?.LiquidityRegimeScore?.raw || d.regime_and_risk?.LiquidityRegimeScore || '—';
  const indexMomentum = d.breadth_rotation?.IndexMomentum_1W?.raw || d.breadth_rotation?.IndexMomentum_1W || '—';
  
  rows.push({
    id: 'f1b-summary-liquidity-momentum',
    parts: [
      { kind: 'text', text: 'Liquidità: ' },
      {
        kind: 'metric',
        key: 'LiquidityRegimeScore',
        value: formatRegimeScore(liquidity),
        label: 'LiquidityRegimeScore',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · Index Momentum 1W: ' },
      {
        kind: 'metric',
        key: 'IndexMomentum_1W',
        value: formatRegimeScore(indexMomentum),
        label: 'Index Momentum 1W',
        tone: 'neutral'
      }
    ]
  });
  
  // ROW 8: Defensivi + Lagging
  const defensive = d.breadth_rotation?.Leadership?.DefensiveLeadership?.items || [];
  const lagging = d.breadth_rotation?.Leadership?.Lagging?.items || [];
  const defensiveText = Array.isArray(defensive) && defensive.length > 0 
    ? defensive.slice(0, 2).join(', ') 
    : '—';
  const laggingText = Array.isArray(lagging) && lagging.length > 0 
    ? lagging.slice(0, 2).join(', ') 
    : '—';
  
  if (defensiveText !== '—' || laggingText !== '—') {
    rows.push({
      id: 'f1b-summary-defensive-lagging',
      parts: [
        { kind: 'text', text: 'Defensivi: ' },
        { kind: 'text', text: defensiveText },
        { kind: 'text', text: ' · In ritardo: ' },
        { kind: 'text', text: laggingText }
      ]
    });
  }
  
  // ROW 9: Street View (troncato)
  const streetView = d.street_view?.T1_MacroNews || '';
  if (streetView) {
    const streetPreview = streetView.length > 80 
      ? streetView.substring(0, 80) + '...' 
      : streetView;
    rows.push({
      id: 'f1b-summary-street-view',
      parts: [
        { kind: 'text', text: 'Street View: ' },
        { kind: 'text', text: streetPreview }
      ]
    });
  }
  
  return rows;
}

/**
 * Genera rows + parts per tab Regime & Rischio
 */
function generateRegimeTabRows(data) {
  const rows = [];
  const d = data.regime_and_risk || {};
  
  // Stessa logica di header-ticker: rows con metriche cliccabili
  if (d.StrategyMode_macro) {
    rows.push({
      id: 'regime-strategy',
      parts: [
        { kind: 'text', text: 'StrategyMode: ' },
        {
          kind: 'metric',
          key: 'StrategyMode_macro',
          value: String(d.StrategyMode_macro?.raw || d.StrategyMode_macro || '—'),
          label: 'StrategyMode',
          tone: getToneForStrategyMode(d.StrategyMode_macro?.raw || d.StrategyMode_macro)
        }
      ]
    });
  }
  
  if (d.RegimeScore) {
    rows.push({
      id: 'regime-score',
      parts: [
        { kind: 'text', text: 'RegimeScore: ' },
        {
          kind: 'metric',
          key: 'RegimeScore',
          value: formatRegimeScore(d.RegimeScore?.raw || d.RegimeScore),
          label: 'RegimeScore',
          tone: getToneForRegimeScore(d.RegimeScore?.raw || d.RegimeScore)
        }
      ]
    });
  }
  
  // Aggiungi altre metriche regime...
  if (d.VolRegime) {
    rows.push({
      id: 'regime-vol',
      parts: [
        { kind: 'text', text: 'Volatilità: ' },
        {
          kind: 'metric',
          key: 'VolRegime',
          value: String(d.VolRegime?.raw || d.VolRegime || '—'),
          label: 'VolRegime',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.LiquidityRegimeScore) {
    rows.push({
      id: 'regime-liquidity',
      parts: [
        { kind: 'text', text: 'Liquidità: ' },
        {
          kind: 'metric',
          key: 'LiquidityRegimeScore',
          value: formatRegimeScore(d.LiquidityRegimeScore?.raw || d.LiquidityRegimeScore),
          label: 'LiquidityRegimeScore',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.CreditRiskBlock) {
    rows.push({
      id: 'regime-credit',
      parts: [
        { kind: 'text', text: 'Credito: ' },
        {
          kind: 'metric',
          key: 'CreditRiskBlock',
          value: String(d.CreditRiskBlock?.raw || d.CreditRiskBlock || '—'),
          label: 'CreditRiskBlock',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.FX_Regime) {
    rows.push({
      id: 'regime-fx',
      parts: [
        { kind: 'text', text: 'FX: ' },
        {
          kind: 'metric',
          key: 'FX_Regime',
          value: String(d.FX_Regime?.raw || d.FX_Regime || '—'),
          label: 'FX_Regime',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.RiskWindow) {
    rows.push({
      id: 'regime-risk-window',
      parts: [
        { kind: 'text', text: 'Risk Window (3–10g): ' },
        {
          kind: 'metric',
          key: 'RiskWindow',
          value: String(d.RiskWindow?.raw || d.RiskWindow || '—'),
          label: 'RiskWindow',
          tone: 'yellow'
        }
      ]
    });
  }
  
  return rows;
}

/**
 * Genera rows + parts per tab Breadth & Rotazione
 */
function generateBreadthTabRows(data) {
  const rows = [];
  const d = data.breadth_rotation || {};
  
  if (d.Breadth_1M) {
    rows.push({
      id: 'breadth-1m',
      parts: [
        { kind: 'text', text: 'Breadth 1M: ' },
        {
          kind: 'metric',
          key: 'Breadth_1M',
          value: formatBreadth(d.Breadth_1M?.raw || d.Breadth_1M),
          label: 'Breadth 1M',
          tone: getToneForBreadth(d.Breadth_1M?.raw || d.Breadth_1M)
        }
      ]
    });
  }
  
  if (d.RiskTilt_1M) {
    rows.push({
      id: 'breadth-risk-tilt',
      parts: [
        { kind: 'text', text: 'RiskTilt 1M: ' },
        {
          kind: 'metric',
          key: 'RiskTilt_1M',
          value: String(d.RiskTilt_1M?.raw || d.RiskTilt_1M || '—'),
          label: 'RiskTilt 1M',
          tone: getToneForRiskTilt(d.RiskTilt_1M?.raw || d.RiskTilt_1M)
        }
      ]
    });
  }
  
  if (d.SmallCapPressure_1W) {
    rows.push({
      id: 'breadth-smallcap',
      parts: [
        { kind: 'text', text: 'SmallCap Pressure 1W: ' },
        {
          kind: 'metric',
          key: 'SmallCapPressure_1W',
          value: String(d.SmallCapPressure_1W?.raw || d.SmallCapPressure_1W || '—'),
          label: 'SmallCap Pressure 1W',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.IndexMomentum_1W) {
    rows.push({
      id: 'breadth-momentum',
      parts: [
        { kind: 'text', text: 'Index Momentum 1W: ' },
        {
          kind: 'metric',
          key: 'IndexMomentum_1W',
          value: formatRegimeScore(d.IndexMomentum_1W?.raw || d.IndexMomentum_1W),
          label: 'Index Momentum 1W',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.SizeBias) {
    rows.push({
      id: 'breadth-size-bias',
      parts: [
        { kind: 'text', text: 'Size Bias: ' },
        {
          kind: 'metric',
          key: 'SizeBias',
          value: String(d.SizeBias?.raw || d.SizeBias || '—'),
          label: 'SizeBias',
          tone: 'neutral'
        }
      ]
    });
  }
  
  // Leadership
  if (d.Leadership?.LeadersMultiTF?.items) {
    const leaders = d.Leadership.LeadersMultiTF.items;
    rows.push({
      id: 'breadth-leaders',
      parts: [
        { kind: 'text', text: 'Leaders: ' },
        { kind: 'text', text: Array.isArray(leaders) ? leaders.join(', ') : String(leaders) }
      ]
    });
  }
  
  if (d.Leadership?.DefensiveLeadership?.items) {
    const defensive = d.Leadership.DefensiveLeadership.items;
    rows.push({
      id: 'breadth-defensive',
      parts: [
        { kind: 'text', text: 'Defensivi: ' },
        { kind: 'text', text: Array.isArray(defensive) ? defensive.join(', ') : String(defensive) }
      ]
    });
  }
  
  if (d.Leadership?.Lagging?.items) {
    const lagging = d.Leadership.Lagging.items;
    rows.push({
      id: 'breadth-lagging',
      parts: [
        { kind: 'text', text: 'In ritardo: ' },
        { kind: 'text', text: Array.isArray(lagging) ? lagging.join(', ') : String(lagging) }
      ]
    });
  }
  
  return rows;
}

/**
 * Genera rows + parts per tab Street View
 */
function generateStreetTabRows(data) {
  const rows = [];
  const d = data.street_view || {};
  
  if (d.T1_MacroNews) {
    rows.push({
      id: 'street-macro-news',
      parts: [
        { kind: 'text', text: 'Macro News: ' },
        { kind: 'text', text: String(d.T1_MacroNews) }
      ]
    });
  }
  
  if (d.T1_SellSideNotes) {
    rows.push({
      id: 'street-sellside',
      parts: [
        { kind: 'text', text: 'Sell-Side Notes: ' },
        { kind: 'text', text: String(d.T1_SellSideNotes) }
      ]
    });
  }
  
  if (d.T1_ConsensusTone) {
    rows.push({
      id: 'street-consensus',
      parts: [
        { kind: 'text', text: 'Consensus Tone: ' },
        {
          kind: 'metric',
          key: 'T1_ConsensusTone',
          value: String(d.T1_ConsensusTone?.raw || d.T1_ConsensusTone || '—'),
          label: 'Consensus Tone',
          tone: d.T1_ConsensusTone?.tone || 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

// Helper functions per formattazione
function getToneForStrategyMode(mode) {
  if (typeof mode !== 'string') return 'neutral';
  if (mode.includes('Momentum')) return 'green';
  if (mode.includes('Pullback')) return 'red';
  return 'neutral';
}

function getToneForRegimeScore(score) {
  if (typeof score === 'string') {
    const num = parseFloat(score.replace(/[^0-9.-]/g, ''));
    if (num > 0.3) return 'green';
    if (num < -0.3) return 'red';
    return 'neutral';
  }
  if (typeof score === 'number') {
    if (score > 0.3) return 'green';
    if (score < -0.3) return 'red';
    return 'neutral';
  }
  return 'neutral';
}

function formatRegimeScore(score) {
  if (score === null || score === undefined || score === '—') return '—';
  if (typeof score === 'number') {
    return score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  }
  if (typeof score === 'string') {
    return score;
  }
  return String(score);
}

function formatBreadth(breadth) {
  if (breadth === null || breadth === undefined || breadth === '—') return '—';
  if (typeof breadth === 'number') {
    return (breadth * 100).toFixed(0) + '%';
  }
  if (typeof breadth === 'string') {
    return breadth;
  }
  return String(breadth);
}

function getToneForBreadth(breadth) {
  if (typeof breadth === 'number') {
    if (breadth > 0.6) return 'green';
    if (breadth < 0.4) return 'red';
    return 'neutral';
  }
  return 'neutral';
}

function getToneForRiskTilt(tilt) {
  if (typeof tilt !== 'string') return 'neutral';
  if (tilt.includes('Pro-rischio') || tilt.includes('risk-on')) return 'green';
  if (tilt.includes('Difensivo') || tilt.includes('risk-off')) return 'red';
  return 'neutral';
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1B(rawData);
  
  // Header modulo
  const headerHTML = renderModuleHeader({
    badge: 'F1B',
    subtitle: 'Regime di mercato · Orizzonte 3–10 giorni',
    title: 'Contesto rischio & ampiezza del mercato',
    desc: 'Lettura di contesto. Non è un\'istruzione operativa.',
    status: d.meta.moduleStatus,
    freshness: d.meta.freshness
  });
  
  // Riassunto AI sempre visibile (usa header-ticker)
  const aiSummaryRows = generateAISummaryRows(d);
  const aiSummaryContainer = `
    <div class="module-ai-summary">
      <div class="module-ai-summary-label">Riassunto AI</div>
      <div data-ai-summary-ticker="true"></div>
    </div>
  `;
  
  // Tabs per sezioni (menu laterale, nessuna visibile di default)
  const tabs = [];
  
  // Tab 1: Regime & Rischio
  if (d.regime_and_risk && Object.keys(d.regime_and_risk).length > 0) {
    tabs.push({
      id: 'regime',
      title: 'Regime & Rischio',
      content: '<div data-tab-ticker="regime"></div>',
      active: false,
      rows: generateRegimeTabRows(d)
    });
  }
  
  // Tab 2: Breadth & Rotazione
  if (d.breadth_rotation && Object.keys(d.breadth_rotation).length > 0) {
    tabs.push({
      id: 'breadth',
      title: 'Breadth & Rotazione',
      content: '<div data-tab-ticker="breadth"></div>',
      active: false,
      rows: generateBreadthTabRows(d)
    });
  }
  
  // Tab 3: Street View
  if (d.street_view && Object.keys(d.street_view).length > 0) {
    tabs.push({
      id: 'street',
      title: 'Street View',
      content: '<div data-tab-ticker="street"></div>',
      active: false,
      rows: generateStreetTabRows(d)
    });
  }
  
  // Genera menu laterale + content
  const { sidebarHTML, contentHTML } = renderModuleTabsSidebar(tabs);
  
  return `
    <section class="module-card" data-state="${escapeAttr(d.meta.moduleStatus)}">
      ${headerHTML}
      ${aiSummaryContainer}
      <div class="module-tabs-wrapper">
        ${sidebarHTML}
        ${contentHTML}
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublicF1B(rawData);
  
  // Bind tabs laterali
  const tabsWrapper = node.querySelector('.module-tabs-wrapper');
  if (tabsWrapper) {
    bindModuleTabs(tabsWrapper);
  }
  
  // Monta header-ticker per AI Summary (sempre visibile) - import dinamico
  const aiSummaryTicker = node.querySelector('[data-ai-summary-ticker="true"]');
  if (aiSummaryTicker) {
    import('../components/header-ticker.js').then(({ headerTicker }) => {
      const aiSummaryRows = generateAISummaryRows(data);
      if (aiSummaryRows.length > 0) {
        const tickerNode = headerTicker.mount(aiSummaryTicker);
        if (tickerNode) {
          headerTicker.update(tickerNode, {
            ...rawData.meta,
            rows: aiSummaryRows,
            metricsPanel: rawData?.metricsPanel || []
          });
        }
      }
    }).catch(err => {
      console.warn('F1B: Errore caricamento header-ticker per AI summary', err);
    });
  }
  
  // Monta header-ticker per ogni tab (solo quando selezionata) - import dinamico
  import('../components/header-ticker.js').then(({ headerTicker }) => {
    const regimeTicker = node.querySelector('[data-tab-ticker="regime"]');
    if (regimeTicker) {
      const regimeRows = generateRegimeTabRows(data);
      if (regimeRows.length > 0) {
        const tickerNode = headerTicker.mount(regimeTicker);
        if (tickerNode) {
          headerTicker.update(tickerNode, {
            ...rawData.meta,
            rows: regimeRows,
            metricsPanel: rawData?.metricsPanel || []
          });
        }
      }
    }
    
    const breadthTicker = node.querySelector('[data-tab-ticker="breadth"]');
    if (breadthTicker) {
      const breadthRows = generateBreadthTabRows(data);
      if (breadthRows.length > 0) {
        const tickerNode = headerTicker.mount(breadthTicker);
        if (tickerNode) {
          headerTicker.update(tickerNode, {
            ...rawData.meta,
            rows: breadthRows,
            metricsPanel: rawData?.metricsPanel || []
          });
        }
      }
    }
    
    const streetTicker = node.querySelector('[data-tab-ticker="street"]');
    if (streetTicker) {
      const streetRows = generateStreetTabRows(data);
      if (streetRows.length > 0) {
        const tickerNode = headerTicker.mount(streetTicker);
        if (tickerNode) {
          headerTicker.update(tickerNode, {
            ...rawData.meta,
            rows: streetRows,
            metricsPanel: rawData?.metricsPanel || []
          });
        }
      }
    }
  }).catch(err => {
    console.warn('F1B: Errore caricamento header-ticker per tabs', err);
  });
  
  // Bind metric info buttons (per popup glossario)
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (e) {
      console.warn('F1B: Errore bind metric info buttons', e);
    }
  }
}
