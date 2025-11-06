// /report/assets/js/modules/f1b.js
// F1B · Market Regime - Design Unificato
// Usa stessa logica di header-ticker: riassunto AI sempre visibile + tabs laterali

import { renderModuleHeader, renderModuleTabsSidebar, bindModuleTabs } from '../components/module-header.js';
import Logger from '../utils/logger.js';
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
  const meta = {
    timestampET: src?.meta?.timestampET ?? "—",
    module: src?.meta?.module ?? "F1B · Market Regime",
    moduleVersion: src?.meta?.moduleVersion ?? "v19-Dynamic",
    moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
    freshness: src?.meta?.freshness ?? "≤ T-1",
    hero_intro: src?.meta?.hero_intro ?? "",
    hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    badge: 'F1B',
    hero_title: 'Contesto rischio & ampiezza del mercato',
    hero_subtitle: 'Regime di mercato · Orizzonte 3–10 giorni',
    hero_desc: 'Lettura di contesto. Non è un\'istruzione operativa.',
    ai_summary_label: 'Riassunto AI',
    // Tab titles
    tab_regime: 'Regime & Rischio',
    tab_breadth: 'Breadth & Rotazione',
    tab_street: 'Street View',
    // Metric labels (per rows)
    label_strategy_mode: 'StrategyMode',
    label_regime_score: 'RegimeScore',
    label_volatility: 'Volatilità',
    label_vol_regime: 'VolRegime',
    label_breadth: 'Breadth 1M',
    label_risk_tilt: 'RiskTilt',
    label_risk_tilt_1m: 'RiskTilt 1M',
    label_leaders: 'Leaders',
    label_size_bias: 'Size Bias',
    label_smallcap_pressure: 'SmallCap Pressure',
    label_smallcap_pressure_1w: 'SmallCap Pressure 1W',
    label_credit: 'Credito',
    label_fx: 'FX',
    label_fx_regime: 'FX_Regime',
    label_risk_window: 'Risk Window (3–10g)',
    label_liquidity: 'Liquidità',
    label_index_momentum: 'Index Momentum 1W',
    label_defensive: 'Defensivi',
    label_lagging: 'In ritardo',
    label_street_view: 'Street View',
    label_macro_news: 'Macro News',
    label_sellside_notes: 'Sell-Side Notes',
    label_consensus_tone: 'Consensus Tone',
    // Separatori
    separator_dot: ' · ',
    separator_colon: ': ',
    separator_comma: ', '
  };

  // Mappa dinamicamente ui_labels → labels
  const UL = src?.ui_labels || {};
  const uiFromS = (k, fallback) => (typeof UL[k] === 'string' && UL[k].trim()) ? UL[k].trim() : fallback;

  // Hero title/subtitle/desc: fallback dall'input JSON se presente
  const hero_title = UL?.hero_title || defaults.hero_title;
  const hero_subtitle = UL?.hero_subtitle || defaults.hero_subtitle;
  const hero_desc = UL?.hero_desc || defaults.hero_desc;

  const labels = {
    ...defaults,
    ...UL,
    badge: UL?.badge || defaults.badge,
    hero_title,
    hero_subtitle,
    hero_desc,
    ai_summary_label: uiFromS('ai_summary_label', defaults.ai_summary_label),
    tab_regime: uiFromS('tab_regime', defaults.tab_regime),
    tab_breadth: uiFromS('tab_breadth', defaults.tab_breadth),
    tab_street: uiFromS('tab_street', defaults.tab_street)
  };

  return {
    meta,
    labels,
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
  const labels = d.labels || {};
  
  // ROW 1: StrategyMode + RegimeScore
  const strategyMode = d.regime_and_risk?.StrategyMode_macro?.raw || d.regime_and_risk?.StrategyMode_macro || '—';
  const regimeScore = d.regime_and_risk?.RegimeScore?.raw || d.regime_and_risk?.RegimeScore || '—';
  
  rows.push({
    id: 'f1b-summary-strategy',
    parts: [
      { kind: 'text', text: `${labels.label_strategy_mode || 'StrategyMode'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'StrategyMode_macro',
        value: String(strategyMode),
        label: labels.label_strategy_mode || 'StrategyMode',
        tone: getToneForStrategyMode(strategyMode)
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_regime_score || 'RegimeScore'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'RegimeScore',
        value: formatRegimeScore(regimeScore),
        label: labels.label_regime_score || 'RegimeScore',
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
      { kind: 'text', text: `${labels.label_volatility || 'Volatilità'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'VolRegime',
        value: String(volRegime),
        label: labels.label_vol_regime || 'VolRegime',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_breadth || 'Breadth 1M'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'Breadth_1M',
        value: formatBreadth(breadth),
        label: labels.label_breadth || 'Breadth 1M',
        tone: getToneForBreadth(breadth)
      }
    ]
  });
  
  // ROW 3: RiskTilt + Leaders
  const riskTilt = d.breadth_rotation?.RiskTilt_1M?.raw || d.breadth_rotation?.RiskTilt_1M || '—';
  const leaders = d.breadth_rotation?.Leadership?.LeadersMultiTF?.items || [];
  const leadersText = Array.isArray(leaders) && leaders.length > 0 
    ? leaders.slice(0, 3).join(labels.separator_comma || ', ') 
    : '—';
  
  rows.push({
    id: 'f1b-summary-risk-tilt',
    parts: [
      { kind: 'text', text: `${labels.label_risk_tilt || 'RiskTilt'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'RiskTilt_1M',
        value: String(riskTilt),
        label: labels.label_risk_tilt_1m || 'RiskTilt 1M',
        tone: getToneForRiskTilt(riskTilt)
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_leaders || 'Leaders'}${labels.separator_colon || ': '}` },
      { kind: 'text', text: leadersText }
    ]
  });
  
  // ROW 4: Size Bias + SmallCap
  const sizeBias = d.breadth_rotation?.SizeBias?.raw || d.breadth_rotation?.SizeBias || '—';
  const smallCap = d.breadth_rotation?.SmallCapPressure_1W?.raw || d.breadth_rotation?.SmallCapPressure_1W || '—';
  
  rows.push({
    id: 'f1b-summary-size',
    parts: [
      { kind: 'text', text: `${labels.label_size_bias || 'Size Bias'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'SizeBias',
        value: String(sizeBias),
        label: labels.label_size_bias || 'SizeBias',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_smallcap_pressure || 'SmallCap Pressure'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'SmallCapPressure_1W',
        value: String(smallCap),
        label: labels.label_smallcap_pressure_1w || 'SmallCap Pressure 1W',
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
      { kind: 'text', text: `${labels.label_credit || 'Credito'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'CreditRiskBlock',
        value: String(credit),
        label: labels.label_credit || 'CreditRiskBlock',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_fx || 'FX'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'FX_Regime',
        value: String(fx),
        label: labels.label_fx_regime || 'FX_Regime',
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
        { kind: 'text', text: `${labels.label_risk_window || 'Risk Window (3–10g)'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'RiskWindow',
          value: String(riskWindow),
          label: labels.label_risk_window || 'RiskWindow',
          tone: 'warn' // yellow -> warn
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
      { kind: 'text', text: `${labels.label_liquidity || 'Liquidità'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'LiquidityRegimeScore',
        value: formatRegimeScore(liquidity),
        label: labels.label_liquidity || 'LiquidityRegimeScore',
        tone: 'neutral'
      },
      { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_index_momentum || 'Index Momentum 1W'}${labels.separator_colon || ': '}` },
      {
        kind: 'metric',
        key: 'IndexMomentum_1W',
        value: formatRegimeScore(indexMomentum),
        label: labels.label_index_momentum || 'Index Momentum 1W',
        tone: 'neutral'
      }
    ]
  });
  
  // ROW 8: Defensivi + Lagging
  const defensive = d.breadth_rotation?.Leadership?.DefensiveLeadership?.items || [];
  const lagging = d.breadth_rotation?.Leadership?.Lagging?.items || [];
  const defensiveText = Array.isArray(defensive) && defensive.length > 0 
    ? defensive.slice(0, 2).join(labels.separator_comma || ', ') 
    : '—';
  const laggingText = Array.isArray(lagging) && lagging.length > 0 
    ? lagging.slice(0, 2).join(labels.separator_comma || ', ') 
    : '—';
  
  if (defensiveText !== '—' || laggingText !== '—') {
    rows.push({
      id: 'f1b-summary-defensive-lagging',
      parts: [
        { kind: 'text', text: `${labels.label_defensive || 'Defensivi'}${labels.separator_colon || ': '}` },
        { kind: 'text', text: defensiveText },
        { kind: 'text', text: `${labels.separator_dot || ' · '}${labels.label_lagging || 'In ritardo'}${labels.separator_colon || ': '}` },
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
        { kind: 'text', text: `${labels.label_street_view || 'Street View'}${labels.separator_colon || ': '}` },
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
  const labels = data.labels || {};
  
  // Stessa logica di header-ticker: rows con metriche cliccabili
  if (d.StrategyMode_macro) {
    rows.push({
      id: 'regime-strategy',
      parts: [
        { kind: 'text', text: `${labels.label_strategy_mode || 'StrategyMode'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'StrategyMode_macro',
          value: String(d.StrategyMode_macro?.raw || d.StrategyMode_macro || '—'),
          label: labels.label_strategy_mode || 'StrategyMode',
          tone: getToneForStrategyMode(d.StrategyMode_macro?.raw || d.StrategyMode_macro)
        }
      ]
    });
  }
  
  if (d.RegimeScore) {
    rows.push({
      id: 'regime-score',
      parts: [
        { kind: 'text', text: `${labels.label_regime_score || 'RegimeScore'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'RegimeScore',
          value: formatRegimeScore(d.RegimeScore?.raw || d.RegimeScore),
          label: labels.label_regime_score || 'RegimeScore',
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
        { kind: 'text', text: `${labels.label_volatility || 'Volatilità'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'VolRegime',
          value: String(d.VolRegime?.raw || d.VolRegime || '—'),
          label: labels.label_vol_regime || 'VolRegime',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.LiquidityRegimeScore) {
    rows.push({
      id: 'regime-liquidity',
      parts: [
        { kind: 'text', text: `${labels.label_liquidity || 'Liquidità'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'LiquidityRegimeScore',
          value: formatRegimeScore(d.LiquidityRegimeScore?.raw || d.LiquidityRegimeScore),
          label: labels.label_liquidity || 'LiquidityRegimeScore',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.CreditRiskBlock) {
    rows.push({
      id: 'regime-credit',
      parts: [
        { kind: 'text', text: `${labels.label_credit || 'Credito'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'CreditRiskBlock',
          value: String(d.CreditRiskBlock?.raw || d.CreditRiskBlock || '—'),
          label: labels.label_credit || 'CreditRiskBlock',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.FX_Regime) {
    rows.push({
      id: 'regime-fx',
      parts: [
        { kind: 'text', text: `${labels.label_fx || 'FX'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'FX_Regime',
          value: String(d.FX_Regime?.raw || d.FX_Regime || '—'),
          label: labels.label_fx_regime || 'FX_Regime',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.RiskWindow) {
    rows.push({
      id: 'regime-risk-window',
      parts: [
        { kind: 'text', text: `${labels.label_risk_window || 'Risk Window (3–10g)'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'RiskWindow',
          value: String(d.RiskWindow?.raw || d.RiskWindow || '—'),
          label: labels.label_risk_window || 'RiskWindow',
          tone: 'warn' // yellow -> warn
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
  const labels = data.labels || {};
  
  if (d.Breadth_1M) {
    rows.push({
      id: 'breadth-1m',
      parts: [
        { kind: 'text', text: `${labels.label_breadth || 'Breadth 1M'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'Breadth_1M',
          value: formatBreadth(d.Breadth_1M?.raw || d.Breadth_1M),
          label: labels.label_breadth || 'Breadth 1M',
          tone: getToneForBreadth(d.Breadth_1M?.raw || d.Breadth_1M)
        }
      ]
    });
  }
  
  if (d.RiskTilt_1M) {
    rows.push({
      id: 'breadth-risk-tilt',
      parts: [
        { kind: 'text', text: `${labels.label_risk_tilt_1m || 'RiskTilt 1M'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'RiskTilt_1M',
          value: String(d.RiskTilt_1M?.raw || d.RiskTilt_1M || '—'),
          label: labels.label_risk_tilt_1m || 'RiskTilt 1M',
          tone: getToneForRiskTilt(d.RiskTilt_1M?.raw || d.RiskTilt_1M)
        }
      ]
    });
  }
  
  if (d.SmallCapPressure_1W) {
    rows.push({
      id: 'breadth-smallcap',
      parts: [
        { kind: 'text', text: `${labels.label_smallcap_pressure_1w || 'SmallCap Pressure 1W'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'SmallCapPressure_1W',
          value: String(d.SmallCapPressure_1W?.raw || d.SmallCapPressure_1W || '—'),
          label: labels.label_smallcap_pressure_1w || 'SmallCap Pressure 1W',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.IndexMomentum_1W) {
    rows.push({
      id: 'breadth-momentum',
      parts: [
        { kind: 'text', text: `${labels.label_index_momentum || 'Index Momentum 1W'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'IndexMomentum_1W',
          value: formatRegimeScore(d.IndexMomentum_1W?.raw || d.IndexMomentum_1W),
          label: labels.label_index_momentum || 'Index Momentum 1W',
          tone: 'neutral'
        }
      ]
    });
  }
  
  if (d.SizeBias) {
    rows.push({
      id: 'breadth-size-bias',
      parts: [
        { kind: 'text', text: `${labels.label_size_bias || 'Size Bias'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'SizeBias',
          value: String(d.SizeBias?.raw || d.SizeBias || '—'),
          label: labels.label_size_bias || 'SizeBias',
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
        { kind: 'text', text: `${labels.label_leaders || 'Leaders'}${labels.separator_colon || ': '}` },
        { kind: 'text', text: Array.isArray(leaders) ? leaders.join(labels.separator_comma || ', ') : String(leaders) }
      ]
    });
  }
  
  if (d.Leadership?.DefensiveLeadership?.items) {
    const defensive = d.Leadership.DefensiveLeadership.items;
    rows.push({
      id: 'breadth-defensive',
      parts: [
        { kind: 'text', text: `${labels.label_defensive || 'Defensivi'}${labels.separator_colon || ': '}` },
        { kind: 'text', text: Array.isArray(defensive) ? defensive.join(labels.separator_comma || ', ') : String(defensive) }
      ]
    });
  }
  
  if (d.Leadership?.Lagging?.items) {
    const lagging = d.Leadership.Lagging.items;
    rows.push({
      id: 'breadth-lagging',
      parts: [
        { kind: 'text', text: `${labels.label_lagging || 'In ritardo'}${labels.separator_colon || ': '}` },
        { kind: 'text', text: Array.isArray(lagging) ? lagging.join(labels.separator_comma || ', ') : String(lagging) }
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
  const labels = data.labels || {};
  
  if (d.T1_MacroNews) {
    rows.push({
      id: 'street-macro-news',
      parts: [
        { kind: 'text', text: `${labels.label_macro_news || 'Macro News'}${labels.separator_colon || ': '}` },
        { kind: 'text', text: String(d.T1_MacroNews) }
      ]
    });
  }
  
  if (d.T1_SellSideNotes) {
    rows.push({
      id: 'street-sellside',
      parts: [
        { kind: 'text', text: `${labels.label_sellside_notes || 'Sell-Side Notes'}${labels.separator_colon || ': '}` },
        { kind: 'text', text: String(d.T1_SellSideNotes) }
      ]
    });
  }
  
  if (d.T1_ConsensusTone) {
    rows.push({
      id: 'street-consensus',
      parts: [
        { kind: 'text', text: `${labels.label_consensus_tone || 'Consensus Tone'}${labels.separator_colon || ': '}` },
        {
          kind: 'metric',
          key: 'T1_ConsensusTone',
          value: String(d.T1_ConsensusTone?.raw || d.T1_ConsensusTone || '—'),
          label: labels.label_consensus_tone || 'Consensus Tone',
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
  if (mode.includes('Momentum')) return 'ok'; // green -> ok
  if (mode.includes('Pullback')) return 'err'; // red -> err
  return 'neutral';
}

function getToneForRegimeScore(score) {
  if (typeof score === 'string') {
    const num = parseFloat(score.replace(/[^0-9.-]/g, ''));
    if (num > 0.3) return 'ok'; // green -> ok
    if (num < -0.3) return 'err'; // red -> err
    return 'neutral';
  }
  if (typeof score === 'number') {
    if (score > 0.3) return 'ok'; // green -> ok
    if (score < -0.3) return 'err'; // red -> err
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
    if (breadth > 0.6) return 'ok'; // green -> ok
    if (breadth < 0.4) return 'err'; // red -> err
    return 'neutral';
  }
  return 'neutral';
}

function getToneForRiskTilt(tilt) {
  if (typeof tilt !== 'string') return 'neutral';
  if (tilt.includes('Pro-rischio') || tilt.includes('risk-on')) return 'ok'; // green -> ok
  if (tilt.includes('Difensivo') || tilt.includes('risk-off')) return 'err'; // red -> err
  return 'neutral';
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1B(rawData);
  const labels = d.labels || {};
  
  // Header modulo (tutto da labels/JSON)
  const headerHTML = renderModuleHeader({
    badge: labels.badge || 'F1B',
    subtitle: labels.hero_subtitle || 'Regime di mercato · Orizzonte 3–10 giorni',
    title: labels.hero_title || 'Contesto rischio & ampiezza del mercato',
    desc: labels.hero_desc || 'Lettura di contesto. Non è un\'istruzione operativa.',
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
  
  // Tabs per sezioni (menu laterale, nessuna visibile di default)
  const tabs = [];
  
  // Tab 1: Regime & Rischio
  if (d.regime_and_risk && Object.keys(d.regime_and_risk).length > 0) {
    tabs.push({
      id: 'regime',
      title: labels.tab_regime || 'Regime & Rischio',
      content: '<div data-tab-ticker="regime"></div>',
      active: false,
      rows: generateRegimeTabRows(d)
    });
  }
  
  // Tab 2: Breadth & Rotazione
  if (d.breadth_rotation && Object.keys(d.breadth_rotation).length > 0) {
    tabs.push({
      id: 'breadth',
      title: labels.tab_breadth || 'Breadth & Rotazione',
      content: '<div data-tab-ticker="breadth"></div>',
      active: false,
      rows: generateBreadthTabRows(d)
    });
  }
  
  // Tab 3: Street View
  if (d.street_view && Object.keys(d.street_view).length > 0) {
    tabs.push({
      id: 'street',
      title: labels.tab_street || 'Street View',
      content: '<div data-tab-ticker="street"></div>',
      active: false,
      rows: generateStreetTabRows(d)
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
  const data = normalizeDataPublicF1B(rawData);
  
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
        if (tabId === 'regime') {
          rows = generateRegimeTabRows(data);
        } else if (tabId === 'breadth') {
          rows = generateBreadthTabRows(data);
        } else if (tabId === 'street') {
          rows = generateStreetTabRows(data);
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
            // Usa un piccolo delay per assicurarsi che il DOM sia completamente aggiornato
            setTimeout(() => {
              // Verifica che i click handler siano presenti
              const metricButtons = tickerNode.querySelectorAll('.metric-inline[data-metric]');
              if (metricButtons.length > 0) {
                Logger.debug('F1B', `Metriche montate nel drawer: ${metricButtons.length}`);
              }
            }, 50);
          }
        }
      }).catch(err => {
        console.warn(`F1B: Errore caricamento header-ticker per drawer tab ${tabId}`, err);
      });
    });
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
