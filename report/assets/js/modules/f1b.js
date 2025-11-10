// /report/assets/js/modules/f1b.js
// F1B · Market Regime v19 Dynamic – nuova orchestrazione con riassunto AI fluido,
// 2 chart istituzionali sempre visibili e drawer per sezione con chart dedicato.

import { renderModuleHeader, renderModuleTabsSidebar, bindModuleTabs } from '../components/module-header.js';
import Logger from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

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

function coalesce(...values) {
  for (const val of values) {
    if (val === 0) return 0;
    if (val === false) return false;
    if (val === true) return true;
    if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
      return val;
    }
  }
  return undefined;
}

function toNumber(value, fallback = 0) {
  if (value == null) return fallback;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const parsed = parseFloat(String(value).replace(/[^0-9+-.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPercent(value, opts = {}) {
  const { decimals = 0, fallback = '—', suffix = '%' } = opts;
  if (value == null || value === '—' || value === '') return fallback;
  const num = typeof value === 'number' ? value : toNumber(value, Number.NaN);
  if (!Number.isFinite(num)) return fallback;
  const pct = (opts.asFraction ? num : num * 100);
  return `${pct.toFixed(decimals)}${suffix}`;
}

function formatSigned(value, decimals = 2) {
  if (value == null || value === '—') return '—';
  const num = typeof value === 'number' ? value : toNumber(value, Number.NaN);
  if (!Number.isFinite(num)) return String(value);
  const fixed = num.toFixed(decimals);
  return num > 0 ? `+${fixed}` : fixed;
}

function boolLabel(value, { trueLabel = 'Yes', falseLabel = 'No' } = {}) {
  if (value === true) return trueLabel;
  if (value === false) return falseLabel;
  return '—';
}

function determineTone({ type, value }) {
  if (value == null || value === '—' || value === '') return 'neutral';
  if (type === 'strategy') {
    const str = String(value).toLowerCase();
    if (str.includes('momentum')) return 'ok';
    if (str.includes('pullback') || str.includes('risk-off')) return 'err';
    return 'neutral';
  }
  if (type === 'score') {
    const num = toNumber(value, 0);
    if (num > 0.3) return 'ok';
    if (num < -0.3) return 'err';
    return 'neutral';
  }
  if (type === 'breadth') {
    const num = toNumber(value, Number.NaN);
    if (Number.isFinite(num)) {
      const pct = num > 1 ? num : num * 100;
      if (pct >= 60) return 'ok';
      if (pct <= 40) return 'err';
    }
    return 'neutral';
  }
  if (type === 'boolean') {
    return value === true ? 'err' : 'neutral';
  }
  return 'neutral';
}

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function wrapMetric({ id, label, value, definition, tone, hint }) {
  return {
    id,
    label,
    value: value ?? '—',
    definition: definition ? String(definition) : '',
    tone: tone || 'neutral',
    hint: hint ? String(hint) : ''
  };
}

function extractAnalysisHeadlines(raw) {
  const swingPacket = raw?.swingPacket || {};
  const snapshot = swingPacket?.f1bSnapshot || {};

  return coalesce(
    swingPacket?.analysisHeadlines,
    swingPacket?.analysis_t1_headlines,
    snapshot?.analysis_t1_headlines,
    raw?.analysis_headlines,
    raw?.ANALYSIS_T1_HEADLINES,
    raw?.F1B_ANALYSIS_T1_HEADLINES,
    {}
  ) || {};
}

function extractFinvizFilters(raw) {
  const swingPacket = raw?.swingPacket || {};
  const snapshot = swingPacket?.f1bSnapshot || {};
  return coalesce(
    swingPacket?.finvizFilters,
    swingPacket?.FINVIZ_FILTERS,
    snapshot?.finvizFilters,
    raw?.finvizFilters,
    raw?.F1B_FINVIZ_FILTERS,
    null
  );
}

function normalizeDataPublicF1B(raw = {}) {
  const swingPacket = raw?.swingPacket || {};
  const snapshot = swingPacket?.f1bSnapshot || {};
  const metaRaw = swingPacket?.meta || raw?.meta || {};

  const meta = {
    timestampET: metaRaw.timestampET || '—',
    module: metaRaw.moduleSource || 'F1B · Market Regime',
    moduleVersion: metaRaw.moduleVersion || 'v19-Dynamic',
    moduleStatus: metaRaw.moduleStatus || 'ACTIVE',
    freshness: metaRaw.dataLagLabel || '≤ T-1',
    hero_disclaimer: firstNonEmptyString(
      metaRaw.hero_disclaimer,
      raw?.meta?.hero_disclaimer,
      'Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II).'
    ),
    hero_intro: metaRaw.hero_intro || '',
    hero_title: firstNonEmptyString(metaRaw.hero_title, 'Contesto rischio & ampiezza del mercato'),
    hero_subtitle: firstNonEmptyString(metaRaw.hero_subtitle, 'Regime di mercato · Orizzonte 3–10 giorni'),
    hero_desc: firstNonEmptyString(metaRaw.hero_desc, 'Lettura istituzionale. Non istruzione operativa.')
  };

  const regimeState = snapshot?.regime_state || {};
  const breadthState = snapshot?.breadth_and_rotation || {};
  const microState = snapshot?.market_microstructure || {};
  const sizeState = snapshot?.size_distribution || {};
  const riskWindow = snapshot?.risk_window || {};
  const analysisHeadlines = extractAnalysisHeadlines(raw);
  const finvizFilters = extractFinvizFilters(raw);
  const bridgeF2 = swingPacket?.bridgeF2 || raw?.bridgeF2 || {};
  const handoffGuidance = swingPacket?.handoffGuidance || raw?.handoffGuidance || {};

  const chartContext = {
    meta,
    regime_and_risk: {
      StrategyMode_macro: { raw: regimeState.StrategyMode_macro },
      RegimeScore: { raw: regimeState.RegimeScore },
      VolRegime: { raw: microState.VolRegime_comment },
      LiquidityRegimeScore: { raw: riskWindow?.RiskWindow_F1?.Score },
      CreditRiskBlock: { raw: microState?.CreditRiskBlock },
      FX_Regime: { raw: microState?.FX_Regime_comment },
      RiskWindow: { raw: riskWindow?.RiskWindow_F1?.Score }
    },
    breadth_rotation: {
      Breadth_1M: { raw: breadthState.Breadth_1M_pctSectorsGreen },
      RiskTilt_1M: { raw: breadthState.RiskTilt_1M },
      SmallCapPressure_1W: { raw: sizeState.SmallCapPressure_1W_comment },
      IndexMomentum_1W: { raw: breadthState.IndexMomentum_1W },
      SizeBias: { raw: sizeState.SizeBiasPattern },
      Leadership: {
        LeadersMultiTF: { items: safeArray(breadthState.LeadersMultiTF) },
        DefensiveLeadership: { items: safeArray(breadthState.DefensiveLeadership) },
        Lagging: { items: safeArray(breadthState.LaggingSectors) }
      }
    },
    analysis_headlines: analysisHeadlines,
    market_microstructure: microState,
    size_distribution: sizeState,
    risk_window: riskWindow,
    finvizFilters,
    bridgeF2,
    handoffGuidance
  };

  const summary = buildSummary(regimeState, breadthState, microState, sizeState, riskWindow);
  const primaryCharts = buildPrimaryChartsDescriptors(regimeState, breadthState, riskWindow);
  const sections = buildSections({
    regimeState,
    breadthState,
    microState,
    sizeState,
    riskWindow,
    analysisHeadlines,
    finvizFilters,
    bridgeF2,
    handoffGuidance
  });

  const sectionsMap = {};
  sections.forEach(section => { sectionsMap[section.id] = section; });

  return {
    meta,
    summary,
    primaryCharts,
    sections,
    sectionsMap,
    chartContext
  };
}

// ---------------------------------------------------------------------------
// Narrative builders
// ---------------------------------------------------------------------------

function buildSummary(regimeState, breadthState, microState, sizeState, riskWindow) {
  const strategy = regimeState.StrategyMode_macro || '—';
  const regimeScore = regimeState.RegimeScore;
  const breadthPct = breadthState.Breadth_1M_pctSectorsGreen;
  const riskTilt = breadthState.RiskTilt_1M || 'Neutro';
  const volComment = microState.VolRegime_comment || 'Volatilità neutra';
  const sizeBias = sizeState.SizeBiasPattern || 'Mixed';
  const riskScore = riskWindow?.RiskWindow_F1?.Score;

  const narrativeParts = [];
  narrativeParts.push(`Mercato in modalità ${strategy || '—'} con RegimeScore ${formatSigned(regimeScore, 2)}.`);
  if (Number.isFinite(breadthPct)) {
    narrativeParts.push(`Breadth 1M ${toPercent(breadthPct, { asFraction: breadthPct <= 1, decimals: 0 })} e RiskTilt ${riskTilt}.`);
  } else if (riskTilt) {
    narrativeParts.push(`RiskTilt ${riskTilt}.`);
  }
  narrativeParts.push(`Volatilità: ${volComment}.`);
  narrativeParts.push(`Size bias: ${sizeBias}.`);
  if (Number.isFinite(riskScore)) {
    narrativeParts.push(`Risk Window Score ${formatSigned(riskScore, 2)} sullo swing 3–10g.`);
  }

  const metrics = [
    wrapMetric({
      id: 'StrategyMode_macro',
      label: 'Strategy Mode',
      value: strategy,
      definition: regimeState.StrategyMode_definition,
      tone: determineTone({ type: 'strategy', value: strategy })
    }),
    wrapMetric({
      id: 'RegimeScore',
      label: 'RegimeScore',
      value: formatSigned(regimeScore, 2),
      definition: regimeState.RegimeScore_definition,
      tone: determineTone({ type: 'score', value: regimeScore })
    }),
    wrapMetric({
      id: 'Breadth_1M',
      label: 'Breadth 1M',
      value: toPercent(breadthPct, { asFraction: true }),
      definition: breadthState.Breadth_definition,
      tone: determineTone({ type: 'breadth', value: breadthPct })
    }),
    wrapMetric({
      id: 'RiskTilt_1M',
      label: 'Risk Tilt',
      value: riskTilt,
      definition: breadthState.RiskTilt_definition,
      tone: determineTone({ type: 'strategy', value: riskTilt })
    }),
    wrapMetric({
      id: 'VolRegime',
      label: 'Volatilità',
      value: microState.VolRegime_comment || microState.VIX_level || '—',
      definition: 'Sintesi su volatilità implicita e segnali di stress.'
    })
  ];

  return {
    label: 'Riassunto AI',
    narrative: narrativeParts.join(' '),
    metrics
  };
}

function buildPrimaryChartsDescriptors(regimeState, breadthState, riskWindow) {
  const regimeScore = formatSigned(regimeState.RegimeScore, 2);
  const strategy = regimeState.StrategyMode_macro || '—';
  const breadthPct = toPercent(breadthState.Breadth_1M_pctSectorsGreen, { asFraction: true });
  const riskTilt = breadthState.RiskTilt_1M || 'Neutro';

  return [
    {
      id: 'regime-overview',
      title: 'RegimeScore & Risk Appetite',
      description: `Strategy Mode ${strategy} · RegimeScore ${regimeScore}`
    },
    {
      id: 'breadth-overview',
      title: 'Breadth & Leadership',
      description: `Breadth 1M ${breadthPct} · RiskTilt ${riskTilt}`
    }
  ];
}

function buildSections({
  regimeState,
  breadthState,
  microState,
  sizeState,
  riskWindow,
  analysisHeadlines,
  finvizFilters,
  bridgeF2,
  handoffGuidance
}) {
  const sections = [];

  sections.push({
    id: 'regime',
    title: 'Regime & Risk Appetite',
    narrative: `Modalità ${regimeState.StrategyMode_macro || '—'} con RegimeScore ${formatSigned(regimeState.RegimeScore, 2)} e tono volatilità ${microState.VolRegime_comment || 'neutro'}.`,
    metrics: [
      wrapMetric({
        id: 'StrategyMode_macro',
        label: 'Strategy Mode',
        value: regimeState.StrategyMode_macro,
        definition: regimeState.StrategyMode_definition,
        tone: determineTone({ type: 'strategy', value: regimeState.StrategyMode_macro })
      }),
      wrapMetric({
        id: 'RegimeScore',
        label: 'RegimeScore',
        value: formatSigned(regimeState.RegimeScore, 2),
        definition: regimeState.RegimeScore_definition,
        tone: determineTone({ type: 'score', value: regimeState.RegimeScore })
      }),
      wrapMetric({
        id: 'VolRegime_comment',
        label: 'Volatilità (VIX)',
        value: microState.VolRegime_comment || microState.VIX_level || '—',
        definition: 'Commento sintetico sulla volatilità implicita e la sua variazione.'
      }),
      wrapMetric({
        id: 'FX_Regime_comment',
        label: 'FX Regime',
        value: microState.FX_Regime_comment || '—',
        definition: 'Lettura qualitativa della domanda di USD / FX risk-on risk-off.'
      })
    ],
    chart: { type: 'regime-gauge' }
  });

  sections.push({
    id: 'breadth',
    title: 'Breadth & Rotazione',
    narrative: `Breadth 1M ${toPercent(breadthState.Breadth_1M_pctSectorsGreen, { asFraction: true })} con RiskTilt ${breadthState.RiskTilt_1M || '—'} e leadership su ${safeArray(breadthState.LeadersMultiTF).slice(0, 3).join(', ') || '—'}.`,
    metrics: [
      wrapMetric({
        id: 'Breadth_1M_pctSectorsGreen',
        label: 'Breadth 1M',
        value: toPercent(breadthState.Breadth_1M_pctSectorsGreen, { asFraction: true }),
        definition: breadthState.Breadth_definition,
        tone: determineTone({ type: 'breadth', value: breadthState.Breadth_1M_pctSectorsGreen })
      }),
      wrapMetric({
        id: 'RiskTilt_1M',
        label: 'Risk Tilt',
        value: breadthState.RiskTilt_1M || '—',
        definition: breadthState.RiskTilt_definition,
        tone: determineTone({ type: 'strategy', value: breadthState.RiskTilt_1M })
      }),
      wrapMetric({
        id: 'LeadersMultiTF',
        label: 'Leaders Multi-TF',
        value: safeArray(breadthState.LeadersMultiTF).join(', ') || '—',
        definition: 'Settori GICS con forza coerente multi-timeframe.'
      }),
      wrapMetric({
        id: 'DefensiveLeadership',
        label: 'Difensivi in Leadership',
        value: safeArray(breadthState.DefensiveLeadership).join(', ') || '—',
        definition: 'Settori difensivi che assumono leadership relativa.'
      }),
      wrapMetric({
        id: 'LaggingSectors',
        label: 'Settori in Ritardo',
        value: safeArray(breadthState.LaggingSectors).join(', ') || '—',
        definition: breadthState.Lagging_definition
      })
    ],
    chart: { type: 'breadth-leadership' }
  });

  sections.push({
    id: 'market-micro',
    title: 'Market Microstructure',
    narrative: `VIX ${microState.VIX_level ?? '—'} · ${microState.VolRegime_comment || 'Volatilità neutra'} · Curva ${microState.Curve_state?.CurveShape_comment || '—'} · Commodities ${microState.MacroShock_Commodities?.Comment || '—'}.`,
    metrics: [
      wrapMetric({
        id: 'VIX_level',
        label: 'VIX livello',
        value: microState.VIX_level ?? microState.VolRegime_comment ?? '—',
        definition: microState.VolRegime_comment
      }),
      wrapMetric({
        id: 'CurveShape',
        label: 'Curva 2s10s',
        value: microState.Curve_state?.CurveShape_comment || '—',
        definition: 'Commento sulla pendenza della curva tassi USA.'
      }),
      wrapMetric({
        id: 'MacroShock_Commodities',
        label: 'Commodities shock',
        value: microState.MacroShock_Commodities?.Comment || '—',
        definition: 'Variazioni settimanali rilevanti su Oil, Gold e principali commodity.'
      }),
      wrapMetric({
        id: 'FX_Regime_comment',
        label: 'FX Regime',
        value: microState.FX_Regime_comment || '—',
        definition: 'Segnale sintetico su USD risk-on/off e pressioni FX.'
      })
    ],
    chart: { type: 'volatility-curve' }
  });

  sections.push({
    id: 'size',
    title: 'Size Distribution & Liquidity',
    narrative: `Bias dimensionale ${sizeState.SizeBiasPattern || '—'}; Stress microcap ${boolLabel(sizeState.StressMicroCap, { trueLabel: 'Elevato', falseLabel: 'Assente' })}.`,
    metrics: [
      wrapMetric({
        id: 'SizeBiasPattern',
        label: 'Size Bias',
        value: sizeState.SizeBiasPattern || '—',
        definition: sizeState.SizeBias_definition
      }),
      wrapMetric({
        id: 'StressMicroCap',
        label: 'Stress MicroCap',
        value: boolLabel(sizeState.StressMicroCap, { trueLabel: 'True', falseLabel: 'False' }),
        definition: sizeState.StressMicroCap_definition,
        tone: determineTone({ type: 'boolean', value: sizeState.StressMicroCap })
      }),
      wrapMetric({
        id: 'SmallCapPressure_1W',
        label: 'SmallCap Pressure',
        value: sizeState.SmallCapPressure_1W_comment || '—',
        definition: 'Commento su pressione relativa small/micro cap (1W).'
      })
    ],
    chart: { type: 'size-distribution' }
  });

  sections.push({
    id: 'risk-window',
    title: 'Risk Window 3–10 giorni',
    narrative: riskWindow?.RiskWindow_definition || 'Snapshot macro per valutare rischi su 3–10 giorni.',
    metrics: [
      wrapMetric({
        id: 'RiskWindowScore',
        label: 'Score',
        value: formatSigned(riskWindow?.RiskWindow_F1?.Score, 2),
        definition: riskWindow?.RiskWindow_definition,
        tone: determineTone({ type: 'score', value: riskWindow?.RiskWindow_F1?.Score })
      }),
      wrapMetric({
        id: 'RiskWindowVol',
        label: 'Volatilità',
        value: riskWindow?.RiskWindow_F1?.Vol || '—',
        definition: 'Componente volatilità del risk window.'
      }),
      wrapMetric({
        id: 'RiskWindowRates',
        label: 'Tassi',
        value: riskWindow?.RiskWindow_F1?.Rates || '—',
        definition: 'Componente curve/tassi del risk window.'
      }),
      wrapMetric({
        id: 'RiskWindowCommodities',
        label: 'Commodities',
        value: riskWindow?.RiskWindow_F1?.Commodities || '—',
        definition: 'Componente commodities del risk window.'
      }),
      wrapMetric({
        id: 'RiskWindowEvent',
        label: 'Eventi',
        value: riskWindow?.RiskWindow_F1?.Event || '—',
        definition: 'Eventi macro imminenti rilevanti.'
      })
    ],
    chart: { type: 'risk-window' }
  });

  sections.push({
    id: 'street',
    title: 'Narrativa Istituzionale (T-1)',
    narrative: 'Sintesi giornaliera da fonti Tier-1 su macro news, sell-side e consensus tone.',
    metrics: [
      wrapMetric({
        id: 'T1_MacroNews',
        label: 'Macro News',
        value: analysisHeadlines?.T1_MacroNews || '—',
        definition: 'Headline macro principali (Bloomberg / Reuters).'
      }),
      wrapMetric({
        id: 'T1_SellSideNotes',
        label: 'Sell-Side Notes',
        value: analysisHeadlines?.T1_SellSideNotes || '—',
        definition: 'Punti chiave dalle note sell-side Tier-1.'
      }),
      wrapMetric({
        id: 'T1_ConsensusTone',
        label: 'Consensus Tone',
        value: analysisHeadlines?.T1_ConsensusTone || '—',
        definition: 'Tono sintetico del consensus istituzionale.'
      }),
      wrapMetric({
        id: 'T1_AuditSrc',
        label: 'Audit Sources',
        value: safeArray(analysisHeadlines?.T1_AuditSrc).join(' · ') || '—',
        definition: 'Fonti con timestamp per audit trail.'
      })
    ],
    chart: { type: 'street-tone' }
  });

  if (finvizFilters) {
    sections.push({
      id: 'finviz',
      title: 'Finviz Filters (Dynamic)',
      narrative: 'Query Finviz Premium generata automaticamente da StrategyMode, leadership e size bias.',
      metrics: [
        wrapMetric({
          id: 'FilterType',
          label: 'Filtro',
          value: finvizFilters.FilterType || '—',
          definition: 'Cluster dinamico: Momentum / Momentum-light / Pullback.'
        }),
        wrapMetric({
          id: 'GeneratedFrom',
          label: 'Generato Da',
          value: finvizFilters.GeneratedFrom || '—',
          definition: 'Logica dinamica e input utilizzati per la query.'
        }),
        wrapMetric({
          id: 'AuditSrc',
          label: 'Audit Src',
          value: safeArray(finvizFilters.AuditSrc).join(' · ') || '—',
          definition: 'Fonti e timestamp Finviz / ETFdb.'
        })
      ],
      extraBlocks: finvizFilters.QueryString ? [{
        type: 'code',
        label: 'QueryString',
        value: finvizFilters.QueryString
      }] : [],
      chart: { type: 'finviz-focus' }
    });
  }

  if (bridgeF2 && Object.keys(bridgeF2).length > 0) {
    sections.push({
      id: 'bridge',
      title: 'Bridge verso F2 · universe & governance',
      narrative: 'Universe consegnato a F2 con filtri di liquidità, risk window e flag governance.',
      metrics: [
        wrapMetric({
          id: 'FocusSectors',
          label: 'Focus Sectors',
          value: safeArray(bridgeF2?.universe_for_F2?.FocusSectors).join(', ') || '—',
          definition: bridgeF2?.universe_for_F2?.FocusSectors_comment
        }),
        wrapMetric({
          id: 'IncludeMarketCap',
          label: 'Include Market Cap',
          value: safeArray(bridgeF2?.universe_for_F2?.IncludeMarketCap).join(', ') || '—',
          definition: bridgeF2?.universe_for_F2?.IncludeMarketCap_comment
        }),
        wrapMetric({
          id: 'LiquidityFilters',
          label: 'Liquidity Filters',
          value: bridgeF2?.universe_for_F2?.LiquidityFilters
            ? `minAvgVolume ${bridgeF2.universe_for_F2.LiquidityFilters.minAvgVolume} · minPrice ${bridgeF2.universe_for_F2.LiquidityFilters.minPrice}`
            : '—',
          definition: 'Requisiti minimi di liquidità per l’universo swing.'
        }),
        wrapMetric({
          id: 'StrategyMode_macro',
          label: 'Strategy Mode',
          value: bridgeF2?.handoffSignals?.StrategyMode_macro || '—',
          definition: 'Segnale trasmesso ai moduli successivi per coerenza narrativa.',
          tone: determineTone({ type: 'strategy', value: bridgeF2?.handoffSignals?.StrategyMode_macro })
        }),
        wrapMetric({
          id: 'RegimeScore_bridge',
          label: 'RegimeScore',
          value: formatSigned(bridgeF2?.handoffSignals?.RegimeScore, 2),
          definition: 'Score finale usato per sizing risk by desk.'
        })
      ],
      extraBlocks: bridgeF2?.universe_for_F2?.FinvizQuery ? [{
        type: 'code',
        label: 'Finviz Query (Feed to F2)',
        value: bridgeF2.universe_for_F2.FinvizQuery
      }] : [],
      chart: { type: 'bridge-handsoff' }
    });
  }

  return sections;
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function renderSummaryHTML(summary) {
  return `
    <section class="module-ai-summary f1b-summary-block">
      <div class="module-ai-summary-label">${escapeHtml(summary.label || 'Riassunto AI')}</div>
      <p class="f1b-summary-narrative">${escapeHtml(summary.narrative || '')}</p>
      <div class="f1b-summary-metrics">
        ${(summary.metrics || []).map(metric => `
          <div class="f1b-summary-metric" data-tone="${escapeAttr(metric.tone || 'neutral')}">
            <div class="f1b-summary-metric-label">${escapeHtml(metric.label)}</div>
            <div class="f1b-summary-metric-value">${escapeHtml(metric.value)}</div>
            ${metric.definition ? `<div class="f1b-summary-metric-note">${escapeHtml(metric.definition)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPrimaryChartsHTML(primaryCharts) {
  if (!Array.isArray(primaryCharts) || primaryCharts.length === 0) return '';
  return `
    <section class="f1b-primary-charts">
      ${primaryCharts.map(chart => `
        <article class="f1b-primary-chart-card">
          <header class="f1b-primary-chart-header">
            <h3 class="f1b-primary-chart-title">${escapeHtml(chart.title)}</h3>
            <p class="f1b-primary-chart-desc">${escapeHtml(chart.description || '')}</p>
          </header>
          <div class="f1b-primary-chart-canvas" data-primary-chart="${escapeAttr(chart.id)}"></div>
        </article>
      `).join('')}
    </section>
  `;
}

function buildTabs(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  return sections.map(section => ({
    id: section.id,
    title: section.title,
    active: false,
    content: `
      <div class="f1b-drawer-section" data-tab-ticker="${escapeAttr(section.id)}" data-section-id="${escapeAttr(section.id)}"></div>
    `
  }));
}

function renderExtraBlocks(extraBlocks) {
  if (!Array.isArray(extraBlocks) || extraBlocks.length === 0) return '';
  return extraBlocks.map(block => {
    if (block.type === 'code') {
      return `
        <div class="f1b-drawer-block f1b-drawer-block--code">
          <div class="f1b-drawer-block-label">${escapeHtml(block.label || '')}</div>
          <pre class="f1b-drawer-code">${escapeHtml(block.value || '')}</pre>
        </div>
      `;
    }
    if (block.type === 'list') {
      return `
        <div class="f1b-drawer-block">
          <div class="f1b-drawer-block-label">${escapeHtml(block.label || '')}</div>
          <ul class="f1b-drawer-list">
            ${(block.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    return '';
  }).join('');
}

function renderSectionContent(container, section, normalized) {
  if (!container || !section) return;
  if (container.dataset.rendered === 'true') return;

  container.innerHTML = `
    <div class="f1b-drawer-section-inner">
      ${section.narrative ? `<p class="f1b-drawer-narrative">${escapeHtml(section.narrative)}</p>` : ''}
      <div class="f1b-drawer-metrics">
        ${(section.metrics || []).map(metric => `
          <div class="f1b-metric" data-tone="${escapeAttr(metric.tone || 'neutral')}">
            <div class="f1b-metric-header">
              <span class="f1b-metric-label">${escapeHtml(metric.label)}</span>
              <span class="f1b-metric-value">${escapeHtml(metric.value)}</span>
            </div>
            ${metric.definition ? `<p class="f1b-metric-definition">${escapeHtml(metric.definition)}</p>` : ''}
            ${metric.hint ? `<p class="f1b-metric-hint">${escapeHtml(metric.hint)}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ${section.extraBlocks ? renderExtraBlocks(section.extraBlocks) : ''}
      ${section.chart ? `<div class="f1b-drawer-chart" data-section-chart="${escapeAttr(section.chart.type)}"></div>` : ''}
    </div>
  `;

  container.dataset.rendered = 'true';

  if (section.chart) {
    import('../components/f1b-charts.js')
      .then(({ renderF1BSectionChart }) => {
        const chartNode = container.querySelector('[data-section-chart]');
        if (!chartNode) return;
        renderF1BSectionChart(section.chart.type, chartNode, normalized.chartContext, { section });
      })
      .catch(err => {
        Logger.error('F1B', `Errore caricamento chart per sezione ${section.id}`, err);
        const chartNode = container.querySelector('[data-section-chart]');
        if (chartNode) {
          chartNode.innerHTML = `
            <div class="error-state">
              <div class="error-state-title">Chart non disponibile</div>
              <div class="error-state-message">${escapeHtml(err?.message || 'Errore sconosciuto')}</div>
            </div>
          `;
        }
      });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function renderCard(rawData, ctx = {}) {
  const normalized = normalizeDataPublicF1B(rawData);
  const headerHTML = renderModuleHeader({
    badge: 'F1B',
    subtitle: normalized.meta.hero_subtitle,
    title: normalized.meta.hero_title,
    desc: normalized.meta.hero_desc,
    status: normalized.meta.moduleStatus,
    freshness: normalized.meta.freshness,
    disclaimer: normalized.meta.hero_disclaimer
  });

  const summaryHTML = renderSummaryHTML(normalized.summary);
  const primaryChartsHTML = renderPrimaryChartsHTML(normalized.primaryCharts);
  const tabsConfig = buildTabs(normalized.sections);
  const { drawerHTML, contentHTML, menuHTML } = renderModuleTabsSidebar(tabsConfig);

  return `
    <section class="module-card" data-state="${escapeAttr(normalized.meta.moduleStatus)}">
      ${headerHTML}
      ${summaryHTML}
      ${primaryChartsHTML}
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

  const normalized = normalizeDataPublicF1B(rawData);
  node.__f1bNormalized = normalized;

  // Bind drawer tabs
  const tabsWrapper = node.querySelector('.module-tabs-wrapper');
  if (tabsWrapper) {
    bindModuleTabs(tabsWrapper);
    tabsWrapper.addEventListener('drawer-tab-opened', (event) => {
      const { tabId, container } = event.detail || {};
      if (!tabId || !container) return;
      const section = normalized.sectionsMap[tabId];
      if (!section) return;
      renderSectionContent(container, section, normalized);
    });
  }

  // Render primary charts
  const chartNodes = node.querySelectorAll('[data-primary-chart]');
  if (chartNodes.length > 0) {
    import('../components/f1b-charts.js')
      .then(({ renderF1BPrimaryChart }) => {
        chartNodes.forEach(chartNode => {
          const chartId = chartNode.dataset.primaryChart;
          if (!chartId) return;
          renderF1BPrimaryChart(chartId, chartNode, normalized.chartContext);
        });
      })
      .catch(err => {
        Logger.error('F1B', 'Errore caricamento chart principali', err);
        chartNodes.forEach(chartNode => {
          chartNode.innerHTML = `
            <div class="error-state">
              <div class="error-state-title">Chart non disponibile</div>
              <div class="error-state-message">${escapeHtml(err?.message || 'Errore sconosciuto')}</div>
            </div>
          `;
        });
      });
  }

  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === 'function') {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (error) {
      Logger.warn('F1B', 'Errore binding metric info buttons', error);
    }
  }
}
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
    tab_charts: 'Chart',
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
  
  // Tab 4: Chart (Verifica Tecnica)
  tabs.push({
    id: 'charts',
    title: labels.tab_charts || 'Chart',
    content: '<div data-tab-charts="true"></div>',
    active: false,
    rows: []
  });
  
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
      
      // Tab Chart: renderizza chart
      if (tabId === 'charts') {
        Logger.debug('F1B', 'Tab Chart aperta, container:', container);
        if (!container) {
          Logger.error('F1B', 'Container non trovato per tab Chart');
          return;
        }
        
        // Importa e renderizza chart
        import('../components/f1b-charts.js').then(({ renderF1BCharts }) => {
          Logger.debug('F1B', 'Componente chart caricato, inizio rendering');
          renderF1BCharts(container, rawData).then(() => {
            Logger.debug('F1B', 'Chart renderizzati con successo');
          }).catch(err => {
            Logger.error('F1B', 'Errore rendering chart', err);
            container.innerHTML = `
              <div class="error-state">
                <div class="error-state-title">Errore caricamento chart</div>
                <div class="error-state-message">${escapeHtml(err.message)}</div>
              </div>
            `;
          });
        }).catch(err => {
          Logger.error('F1B', 'Errore caricamento componente chart', err);
          if (container) {
            container.innerHTML = `
              <div class="error-state">
                <div class="error-state-title">Errore caricamento componente chart</div>
                <div class="error-state-message">${escapeHtml(err.message)}</div>
              </div>
            `;
          }
        });
        return;
      }
      
      // Monta header-ticker nel drawer per altre tab
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
