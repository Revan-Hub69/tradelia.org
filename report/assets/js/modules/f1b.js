// /report/assets/js/modules/f1b.js
// F1B · Market Regime v19 Dynamic – nuova orchestrazione con riassunto AI fluido,
// 2 chart istituzionali sempre visibili e drawer per sezione con chart dedicato.

import {
  renderModuleHeader,
  renderModuleTabsSidebar,
  bindModuleTabs,
} from '../components/module-header.js';
import Logger from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

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

function coalesce(...values) {
  for (const val of values) {
    if (val === 0) {return 0;}
    if (val === false) {return false;}
    if (val === true) {return true;}
    if (
      val !== undefined &&
      val !== null &&
      val !== '' &&
      !(Array.isArray(val) && val.length === 0)
    ) {
      return val;
    }
  }
  return undefined;
}

function toNumber(value, fallback = 0) {
  if (value == null) {return fallback;}
  if (typeof value === 'number') {return value;}
  if (typeof value === 'boolean') {return value ? 1 : 0;}
  const parsed = parseFloat(String(value).replace(/[^0-9+-.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPercent(value, opts = {}) {
  const { decimals = 0, fallback = '—', suffix = '%' } = opts;
  if (value == null || value === '—' || value === '') {return fallback;}
  const num = typeof value === 'number' ? value : toNumber(value, Number.NaN);
  if (!Number.isFinite(num)) {return fallback;}
  const pct = opts.asFraction ? num : num * 100;
  return `${pct.toFixed(decimals)}${suffix}`;
}

function formatSigned(value, decimals = 2) {
  if (value == null || value === '—') {return '—';}
  const num = typeof value === 'number' ? value : toNumber(value, Number.NaN);
  if (!Number.isFinite(num)) {return String(value);}
  const fixed = num.toFixed(decimals);
  return num > 0 ? `+${fixed}` : fixed;
}

function boolLabel(value, { trueLabel = 'Yes', falseLabel = 'No' } = {}) {
  if (value === true) {return trueLabel;}
  if (value === false) {return falseLabel;}
  return '—';
}

function determineTone({ type, value }) {
  if (value == null || value === '—' || value === '') {return 'neutral';}
  if (type === 'strategy') {
    const str = String(value).toLowerCase();
    if (str.includes('momentum')) {return 'ok';}
    if (str.includes('pullback') || str.includes('risk-off')) {return 'err';}
    return 'neutral';
  }
  if (type === 'score') {
    const num = toNumber(value, 0);
    if (num > 0.3) {return 'ok';}
    if (num < -0.3) {return 'err';}
    return 'neutral';
  }
  if (type === 'breadth') {
    const num = toNumber(value, Number.NaN);
    if (Number.isFinite(num)) {
      const pct = num > 1 ? num : num * 100;
      if (pct >= 60) {return 'ok';}
      if (pct <= 40) {return 'err';}
    }
    return 'neutral';
  }
  if (type === 'boolean') {
    return value === true ? 'err' : 'neutral';
  }
  return 'neutral';
}

function safeArray(value) {
  if (Array.isArray(value)) {return value;}
  if (typeof value === 'string' && value.trim())
    {return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);}
  return [];
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {return value.trim();}
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
    hint: hint ? String(hint) : '',
  };
}

function extractAnalysisHeadlines(raw) {
  const swingPacket = raw?.swingPacket || {};
  const snapshot = swingPacket?.f1bSnapshot || {};

  return (
    coalesce(
      raw?.['F1B|ANALYSIS_T1_HEADLINES'],
      raw?.F1B_ANALYSIS_T1_HEADLINES,
      swingPacket?.analysisHeadlines,
      swingPacket?.analysis_t1_headlines,
      snapshot?.analysis_t1_headlines,
      raw?.analysis_headlines,
      raw?.ANALYSIS_T1_HEADLINES,
      {}
    ) || {}
  );
}

function extractFinvizFilters(raw) {
  const swingPacket = raw?.swingPacket || {};
  const snapshot = swingPacket?.f1bSnapshot || {};
  return coalesce(
    raw?.['F1B|FINVIZ_FILTERS'],
    raw?.F1B_FINVIZ_FILTERS,
    swingPacket?.finvizFilters,
    swingPacket?.FINVIZ_FILTERS,
    snapshot?.finvizFilters,
    raw?.finvizFilters,
    null
  );
}

function normalizeDataPublicF1B(raw = {}) {
  // Nuovo formato: dati direttamente nel root
  // Retrocompatibilità: supporta anche swingPacket.f1bSnapshot
  const snapshot = raw?.f1bSnapshot || raw?.swingPacket?.f1bSnapshot || {};
  const swingPacket = raw?.swingPacket || {};
  const metaRaw = raw?.meta || swingPacket?.meta || {};

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
    hero_subtitle: firstNonEmptyString(
      metaRaw.hero_subtitle,
      'Regime di mercato · Orizzonte 3–10 giorni'
    ),
    hero_desc: firstNonEmptyString(
      metaRaw.hero_desc,
      'Lettura istituzionale. Non istruzione operativa.'
    ),
  };

  const regimeState = snapshot?.regime_state || {};
  const breadthState = snapshot?.breadth_and_rotation || {};
  const microState = snapshot?.market_microstructure || {};
  const sizeState = snapshot?.size_distribution || {};
  const riskWindow = snapshot?.risk_window || {};
  const analysisHeadlines = extractAnalysisHeadlines(raw);
  const finvizFilters = extractFinvizFilters(raw);
  const bridgeF2 = raw?.bridgeF2 || swingPacket?.bridgeF2 || {};
  const handoffGuidance = raw?.handoffGuidance || swingPacket?.handoffGuidance || {};

  // Nuovo formato: riassunto e sezioni già strutturati
  const riassuntoAI = raw?.riassuntoTradeliaAI || null;
  const riassuntoSezioni = raw?.riassuntoSezioniF1B || null;

  const chartContext = {
    meta,
    regime_and_risk: {
      StrategyMode_macro: { raw: regimeState.StrategyMode_macro },
      RegimeScore: { raw: regimeState.RegimeScore },
      VolRegime: { raw: microState.VolRegime_comment },
      LiquidityRegimeScore: { raw: riskWindow?.RiskWindow_F1?.Score },
      CreditRiskBlock: { raw: microState?.CreditRiskBlock },
      FX_Regime: { raw: microState?.FX_Regime_comment },
      RiskWindow: { raw: riskWindow?.RiskWindow_F1?.Score },
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
        Lagging: { items: safeArray(breadthState.LaggingSectors) },
      },
    },
    analysis_headlines: analysisHeadlines,
    market_microstructure: microState,
    size_distribution: sizeState,
    risk_window: riskWindow,
    finvizFilters,
    bridgeF2,
    handoffGuidance,
  };

  // Usa riassunto già strutturato se presente (nuovo formato), altrimenti costruisci
  const summary = riassuntoAI
    ? buildSummaryFromStructured(riassuntoAI)
    : buildSummary(regimeState, breadthState, microState, sizeState, riskWindow);

  const primaryCharts = buildPrimaryChartsDescriptors(regimeState, breadthState, riskWindow);

  // Usa sezioni già strutturate se presenti (nuovo formato), altrimenti costruisci
  const sections = riassuntoSezioni
    ? buildSectionsFromStructured(riassuntoSezioni, {
        regimeState,
        breadthState,
        microState,
        sizeState,
        riskWindow,
        analysisHeadlines,
        finvizFilters,
        bridgeF2,
        handoffGuidance,
      })
    : buildSections({
        regimeState,
        breadthState,
        microState,
        sizeState,
        riskWindow,
        analysisHeadlines,
        finvizFilters,
        bridgeF2,
        handoffGuidance,
      });

  const sectionsMap = {};
  sections.forEach((section) => {
    sectionsMap[section.id] = section;
  });

  return {
    meta,
    summary,
    primaryCharts,
    sections,
    sectionsMap,
    chartContext,
  };
}

// ---------------------------------------------------------------------------
// Narrative builders
// ---------------------------------------------------------------------------

/**
 * Costruisce summary da riassuntoTradeliaAI strutturato (nuovo formato)
 */
function buildSummaryFromStructured(riassuntoAI) {
  const metrics = (riassuntoAI.metriche || []).map((m) => {
    let value = m.valore;
    // Normalizza array a stringa
    if (Array.isArray(value)) {
      value = value.join(', ');
    }
    // Determina tone basato su id_metrica e valore
    let tone = 'neutral';
    if (m.id_metrica === 'F1B_RegimeScore') {
      tone = determineTone({ type: 'score', value });
    } else if (m.id_metrica === 'F1B_StrategyMode_macro') {
      tone = determineTone({ type: 'strategy', value });
    }

    return wrapMetric({
      id: m.id_metrica,
      label: m.nome_metrica,
      value: String(value || '—'),
      definition: '',
      tone,
    });
  });

  return {
    label: riassuntoAI.titolo || 'Riassunto AI',
    narrative: riassuntoAI.testo || '',
    metrics,
  };
}

/**
 * Costruisce sections da riassuntoSezioniF1B strutturato (nuovo formato)
 */
function buildSectionsFromStructured(riassuntoSezioni, context) {
  const {
    regimeState,
    breadthState,
    microState,
    sizeState,
    riskWindow,
    analysisHeadlines,
    finvizFilters,
    bridgeF2,
    handoffGuidance,
  } = context;

  const sectionsMap = {
    F1B_regime_state: {
      id: 'regime',
      title: 'Regime & Risk Appetite',
      chart: { type: 'regime-gauge' },
    },
    F1B_breadth_and_rotation: {
      id: 'breadth',
      title: 'Breadth & Rotazione',
      chart: { type: 'breadth-leadership' },
    },
    F1B_market_microstructure: {
      id: 'market-micro',
      title: 'Market Microstructure',
      chart: { type: 'volatility-curve' },
    },
    F1B_size_distribution: {
      id: 'size',
      title: 'Size Distribution',
      chart: { type: 'size-distribution' },
    },
    F1B_risk_window: { id: 'risk-window', title: 'Risk Window', chart: { type: 'risk-window' } },
    F1B_headlines: { id: 'headlines', title: 'Headlines T-1', chart: { type: 'street-tone' } },
  };

  const sections = (riassuntoSezioni.sezioni || []).map((sez) => {
    const sectionMeta = sectionsMap[sez.id_sezione] || {
      id: sez.id_sezione.toLowerCase().replace('F1B_', '').replace(/_/g, '-'),
      title: sez.nome_sezione,
      chart: { type: 'default' },
    };

    const metrics = (sez.metriche || []).map((m) => {
      let value = m.valore;
      if (Array.isArray(value)) {
        value = value.join(', ');
      }

      // Determina tone basato su tipo metrica
      let tone = 'neutral';
      if (m.id_metrica.includes('RegimeScore') || m.id_metrica.includes('Score')) {
        tone = determineTone({ type: 'score', value });
      } else if (m.id_metrica.includes('StrategyMode') || m.id_metrica.includes('RiskTilt')) {
        tone = determineTone({ type: 'strategy', value });
      } else if (m.id_metrica.includes('Breadth')) {
        tone = determineTone({ type: 'breadth', value });
      } else if (m.id_metrica.includes('Stress') && value === true) {
        tone = 'err';
      }

      return wrapMetric({
        id: m.id_metrica,
        label: m.nome_metrica,
        value: String(value || '—'),
        definition: '',
        tone,
      });
    });

    return {
      id: sectionMeta.id,
      title: sectionMeta.title,
      narrative: sez.riassunto || '',
      metrics,
      chart: sectionMeta.chart,
    };
  });

  // Aggiungi sezioni aggiuntive se necessario (Finviz, Bridge)
  if (finvizFilters) {
    sections.push({
      id: 'finviz',
      title: 'Finviz Filters',
      narrative: `Filtro ${finvizFilters.FilterPolarity || 'long'} generato dinamicamente per F2.`,
      metrics: [
        wrapMetric({
          id: 'FilterPolarity',
          label: 'Polarità Filtro',
          value: finvizFilters.FilterPolarity || '—',
          definition: finvizFilters.polarity_rule || '',
          tone: finvizFilters.FilterPolarity === 'long' ? 'ok' : 'err',
        }),
        wrapMetric({
          id: 'QueryString',
          label: 'Query Finviz',
          value:
            (finvizFilters.LONG?.QueryString || finvizFilters.SHORT?.QueryString || '—').substring(
              0,
              100
            ) + '...',
          definition: finvizFilters.LONG?.GeneratedFrom || finvizFilters.SHORT?.GeneratedFrom || '',
          tone: 'neutral',
        }),
      ],
      extraBlocks:
        finvizFilters.LONG?.QueryString || finvizFilters.SHORT?.QueryString
          ? [
              {
                type: 'code',
                label: 'QueryString Completa',
                value: finvizFilters.LONG?.QueryString || finvizFilters.SHORT?.QueryString || '',
              },
            ]
          : [],
      chart: { type: 'finviz-focus' },
    });
  }

  if (bridgeF2 && Object.keys(bridgeF2).length > 0) {
    sections.push({
      id: 'bridge',
      title: 'Bridge verso F2',
      narrative: 'Universe consegnato a F2 con filtri di liquidità, risk window e flag governance.',
      metrics: [
        wrapMetric({
          id: 'FocusSectors',
          label: 'Focus Sectors',
          value: safeArray(bridgeF2?.universe_for_F2?.FocusSectors).join(', ') || '—',
          definition: bridgeF2?.universe_for_F2?.FocusSectors_comment,
        }),
        wrapMetric({
          id: 'StrategyMode_macro',
          label: 'Strategy Mode',
          value: bridgeF2?.handoffSignals?.StrategyMode_macro || '—',
          definition: 'Segnale trasmesso ai moduli successivi.',
          tone: determineTone({
            type: 'strategy',
            value: bridgeF2?.handoffSignals?.StrategyMode_macro,
          }),
        }),
        wrapMetric({
          id: 'RegimeScore',
          label: 'RegimeScore',
          value: formatSigned(bridgeF2?.handoffSignals?.RegimeScore, 2),
          definition: 'RegimeScore trasmesso a F2.',
          tone: determineTone({ type: 'score', value: bridgeF2?.handoffSignals?.RegimeScore }),
        }),
      ],
      chart: { type: 'bridge-handsoff' },
    });
  }

  return sections;
}

function buildSummary(regimeState, breadthState, microState, sizeState, riskWindow) {
  const strategy = regimeState.StrategyMode_macro || '—';
  const regimeScore = regimeState.RegimeScore;
  const breadthPct = breadthState.Breadth_1M_pctSectorsGreen;
  const riskTilt = breadthState.RiskTilt_1M || 'Neutro';
  const volComment = microState.VolRegime_comment || 'Volatilità neutra';
  const sizeBias = sizeState.SizeBiasPattern || 'Mixed';
  const riskScore = riskWindow?.RiskWindow_F1?.Score;

  const narrativeParts = [];
  narrativeParts.push(
    `Mercato in modalità ${strategy || '—'} con RegimeScore ${formatSigned(regimeScore, 2)}.`
  );
  if (Number.isFinite(breadthPct)) {
    narrativeParts.push(
      `Breadth 1M ${toPercent(breadthPct, { asFraction: breadthPct <= 1, decimals: 0 })} e RiskTilt ${riskTilt}.`
    );
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
      tone: determineTone({ type: 'strategy', value: strategy }),
    }),
    wrapMetric({
      id: 'RegimeScore',
      label: 'RegimeScore',
      value: formatSigned(regimeScore, 2),
      definition: regimeState.RegimeScore_definition,
      tone: determineTone({ type: 'score', value: regimeScore }),
    }),
    wrapMetric({
      id: 'Breadth_1M',
      label: 'Breadth 1M',
      value: toPercent(breadthPct, { asFraction: true }),
      definition: breadthState.Breadth_definition,
      tone: determineTone({ type: 'breadth', value: breadthPct }),
    }),
    wrapMetric({
      id: 'RiskTilt_1M',
      label: 'Risk Tilt',
      value: riskTilt,
      definition: breadthState.RiskTilt_definition,
      tone: determineTone({ type: 'strategy', value: riskTilt }),
    }),
    wrapMetric({
      id: 'VolRegime',
      label: 'Volatilità',
      value: microState.VolRegime_comment || microState.VIX_level || '—',
      definition: 'Sintesi su volatilità implicita e segnali di stress.',
    }),
  ];

  return {
    label: 'Riassunto AI',
    narrative: narrativeParts.join(' '),
    metrics,
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
      description: `Strategy Mode ${strategy} · RegimeScore ${regimeScore}`,
    },
    {
      id: 'breadth-overview',
      title: 'Breadth & Leadership',
      description: `Breadth 1M ${breadthPct} · RiskTilt ${riskTilt}`,
    },
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
  handoffGuidance,
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
        tone: determineTone({ type: 'strategy', value: regimeState.StrategyMode_macro }),
      }),
      wrapMetric({
        id: 'RegimeScore',
        label: 'RegimeScore',
        value: formatSigned(regimeState.RegimeScore, 2),
        definition: regimeState.RegimeScore_definition,
        tone: determineTone({ type: 'score', value: regimeState.RegimeScore }),
      }),
      wrapMetric({
        id: 'VolRegime_comment',
        label: 'Volatilità (VIX)',
        value: microState.VolRegime_comment || microState.VIX_level || '—',
        definition: 'Commento sintetico sulla volatilità implicita e la sua variazione.',
      }),
      wrapMetric({
        id: 'FX_Regime_comment',
        label: 'FX Regime',
        value: microState.FX_Regime_comment || '—',
        definition: 'Lettura qualitativa della domanda di USD / FX risk-on risk-off.',
      }),
    ],
    chart: { type: 'regime-gauge' },
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
        tone: determineTone({ type: 'breadth', value: breadthState.Breadth_1M_pctSectorsGreen }),
      }),
      wrapMetric({
        id: 'RiskTilt_1M',
        label: 'Risk Tilt',
        value: breadthState.RiskTilt_1M || '—',
        definition: breadthState.RiskTilt_definition,
        tone: determineTone({ type: 'strategy', value: breadthState.RiskTilt_1M }),
      }),
      wrapMetric({
        id: 'LeadersMultiTF',
        label: 'Leaders Multi-TF',
        value: safeArray(breadthState.LeadersMultiTF).join(', ') || '—',
        definition: 'Settori GICS con forza coerente multi-timeframe.',
      }),
      wrapMetric({
        id: 'DefensiveLeadership',
        label: 'Difensivi in Leadership',
        value: safeArray(breadthState.DefensiveLeadership).join(', ') || '—',
        definition: 'Settori difensivi che assumono leadership relativa.',
      }),
      wrapMetric({
        id: 'LaggingSectors',
        label: 'Settori in Ritardo',
        value: safeArray(breadthState.LaggingSectors).join(', ') || '—',
        definition: breadthState.Lagging_definition,
      }),
    ],
    chart: { type: 'breadth-leadership' },
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
        definition: microState.VolRegime_comment,
      }),
      wrapMetric({
        id: 'CurveShape',
        label: 'Curva 2s10s',
        value: microState.Curve_state?.CurveShape_comment || '—',
        definition: 'Commento sulla pendenza della curva tassi USA.',
      }),
      wrapMetric({
        id: 'MacroShock_Commodities',
        label: 'Commodities shock',
        value: microState.MacroShock_Commodities?.Comment || '—',
        definition: 'Variazioni settimanali rilevanti su Oil, Gold e principali commodity.',
      }),
      wrapMetric({
        id: 'FX_Regime_comment',
        label: 'FX Regime',
        value: microState.FX_Regime_comment || '—',
        definition: 'Segnale sintetico su USD risk-on/off e pressioni FX.',
      }),
    ],
    chart: { type: 'volatility-curve' },
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
        definition: sizeState.SizeBias_definition,
      }),
      wrapMetric({
        id: 'StressMicroCap',
        label: 'Stress MicroCap',
        value: boolLabel(sizeState.StressMicroCap, { trueLabel: 'True', falseLabel: 'False' }),
        definition: sizeState.StressMicroCap_definition,
        tone: determineTone({ type: 'boolean', value: sizeState.StressMicroCap }),
      }),
      wrapMetric({
        id: 'SmallCapPressure_1W',
        label: 'SmallCap Pressure',
        value: sizeState.SmallCapPressure_1W_comment || '—',
        definition: 'Commento su pressione relativa small/micro cap (1W).',
      }),
    ],
    chart: { type: 'size-distribution' },
  });

  sections.push({
    id: 'risk-window',
    title: 'Risk Window 3–10 giorni',
    narrative:
      riskWindow?.RiskWindow_definition || 'Snapshot macro per valutare rischi su 3–10 giorni.',
    metrics: [
      wrapMetric({
        id: 'RiskWindowScore',
        label: 'Score',
        value: formatSigned(riskWindow?.RiskWindow_F1?.Score, 2),
        definition: riskWindow?.RiskWindow_definition,
        tone: determineTone({ type: 'score', value: riskWindow?.RiskWindow_F1?.Score }),
      }),
      wrapMetric({
        id: 'RiskWindowVol',
        label: 'Volatilità',
        value: riskWindow?.RiskWindow_F1?.Vol || '—',
        definition: 'Componente volatilità del risk window.',
      }),
      wrapMetric({
        id: 'RiskWindowRates',
        label: 'Tassi',
        value: riskWindow?.RiskWindow_F1?.Rates || '—',
        definition: 'Componente curve/tassi del risk window.',
      }),
      wrapMetric({
        id: 'RiskWindowCommodities',
        label: 'Commodities',
        value: riskWindow?.RiskWindow_F1?.Commodities || '—',
        definition: 'Componente commodities del risk window.',
      }),
      wrapMetric({
        id: 'RiskWindowEvent',
        label: 'Eventi',
        value: riskWindow?.RiskWindow_F1?.Event || '—',
        definition: 'Eventi macro imminenti rilevanti.',
      }),
    ],
    chart: { type: 'risk-window' },
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
        definition: 'Headline macro principali (Bloomberg / Reuters).',
      }),
      wrapMetric({
        id: 'T1_SellSideNotes',
        label: 'Sell-Side Notes',
        value: analysisHeadlines?.T1_SellSideNotes || '—',
        definition: 'Punti chiave dalle note sell-side Tier-1.',
      }),
      wrapMetric({
        id: 'T1_ConsensusTone',
        label: 'Consensus Tone',
        value: analysisHeadlines?.T1_ConsensusTone || '—',
        definition: 'Tono sintetico del consensus istituzionale.',
      }),
      wrapMetric({
        id: 'T1_AuditSrc',
        label: 'Audit Sources',
        value: safeArray(analysisHeadlines?.T1_AuditSrc).join(' · ') || '—',
        definition: 'Fonti con timestamp per audit trail.',
      }),
    ],
    chart: { type: 'street-tone' },
  });

  if (finvizFilters) {
    sections.push({
      id: 'finviz',
      title: 'Finviz Filters (Dynamic)',
      narrative:
        'Query Finviz Premium generata automaticamente da StrategyMode, leadership e size bias.',
      metrics: [
        wrapMetric({
          id: 'FilterType',
          label: 'Filtro',
          value: finvizFilters.FilterType || '—',
          definition: 'Cluster dinamico: Momentum / Momentum-light / Pullback.',
        }),
        wrapMetric({
          id: 'GeneratedFrom',
          label: 'Generato Da',
          value: finvizFilters.GeneratedFrom || '—',
          definition: 'Logica dinamica e input utilizzati per la query.',
        }),
        wrapMetric({
          id: 'AuditSrc',
          label: 'Audit Src',
          value: safeArray(finvizFilters.AuditSrc).join(' · ') || '—',
          definition: 'Fonti e timestamp Finviz / ETFdb.',
        }),
      ],
      extraBlocks: finvizFilters.QueryString
        ? [
            {
              type: 'code',
              label: 'QueryString',
              value: finvizFilters.QueryString,
            },
          ]
        : [],
      chart: { type: 'finviz-focus' },
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
          definition: bridgeF2?.universe_for_F2?.FocusSectors_comment,
        }),
        wrapMetric({
          id: 'IncludeMarketCap',
          label: 'Include Market Cap',
          value: safeArray(bridgeF2?.universe_for_F2?.IncludeMarketCap).join(', ') || '—',
          definition: bridgeF2?.universe_for_F2?.IncludeMarketCap_comment,
        }),
        wrapMetric({
          id: 'LiquidityFilters',
          label: 'Liquidity Filters',
          value: bridgeF2?.universe_for_F2?.LiquidityFilters
            ? `minAvgVolume ${bridgeF2.universe_for_F2.LiquidityFilters.minAvgVolume} · minPrice ${bridgeF2.universe_for_F2.LiquidityFilters.minPrice}`
            : '—',
          definition: 'Requisiti minimi di liquidità per l’universo swing.',
        }),
        wrapMetric({
          id: 'StrategyMode_macro',
          label: 'Strategy Mode',
          value: bridgeF2?.handoffSignals?.StrategyMode_macro || '—',
          definition: 'Segnale trasmesso ai moduli successivi per coerenza narrativa.',
          tone: determineTone({
            type: 'strategy',
            value: bridgeF2?.handoffSignals?.StrategyMode_macro,
          }),
        }),
        wrapMetric({
          id: 'RegimeScore_bridge',
          label: 'RegimeScore',
          value: formatSigned(bridgeF2?.handoffSignals?.RegimeScore, 2),
          definition: 'Score finale usato per sizing risk by desk.',
        }),
      ],
      extraBlocks: bridgeF2?.universe_for_F2?.FinvizQuery
        ? [
            {
              type: 'code',
              label: 'Finviz Query (Feed to F2)',
              value: bridgeF2.universe_for_F2.FinvizQuery,
            },
          ]
        : [],
      chart: { type: 'bridge-handsoff' },
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
        ${(summary.metrics || [])
          .map(
            (metric) => `
          <div class="f1b-summary-metric" data-tone="${escapeAttr(metric.tone || 'neutral')}">
            <div class="f1b-summary-metric-label">${escapeHtml(metric.label)}</div>
            <div class="f1b-summary-metric-value">${escapeHtml(metric.value)}</div>
            ${metric.definition ? `<div class="f1b-summary-metric-note">${escapeHtml(metric.definition)}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderPrimaryChartsHTML(primaryCharts) {
  if (!Array.isArray(primaryCharts) || primaryCharts.length === 0) {return '';}
  return `
    <section class="f1b-primary-charts">
      ${primaryCharts
        .map(
          (chart) => `
        <article class="f1b-primary-chart-card">
          <header class="f1b-primary-chart-header">
            <h3 class="f1b-primary-chart-title">${escapeHtml(chart.title)}</h3>
            <p class="f1b-primary-chart-desc">${escapeHtml(chart.description || '')}</p>
          </header>
          <div class="f1b-primary-chart-canvas" data-primary-chart="${escapeAttr(chart.id)}"></div>
        </article>
      `
        )
        .join('')}
    </section>
  `;
}

function buildTabs(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {return [];}
  return sections.map((section) => ({
    id: section.id,
    title: section.title,
    active: false,
    content: `
      <div class="f1b-drawer-section" data-tab-ticker="${escapeAttr(section.id)}" data-section-id="${escapeAttr(section.id)}"></div>
    `,
  }));
}

function renderExtraBlocks(extraBlocks) {
  if (!Array.isArray(extraBlocks) || extraBlocks.length === 0) {return '';}
  return extraBlocks
    .map((block) => {
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
            ${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `;
      }
      return '';
    })
    .join('');
}

function renderSectionContent(container, section, normalized) {
  if (!container || !section) {return;}
  if (container.dataset.rendered === 'true') {return;}

  container.innerHTML = `
    <div class="f1b-drawer-section-inner">
      ${section.narrative ? `<p class="f1b-drawer-narrative">${escapeHtml(section.narrative)}</p>` : ''}
      <div class="f1b-drawer-metrics">
        ${(section.metrics || [])
          .map(
            (metric) => `
          <div class="f1b-metric" data-tone="${escapeAttr(metric.tone || 'neutral')}">
            <div class="f1b-metric-header">
              <span class="f1b-metric-label">${escapeHtml(metric.label)}</span>
              <span class="f1b-metric-value">${escapeHtml(metric.value)}</span>
            </div>
            ${metric.definition ? `<p class="f1b-metric-definition">${escapeHtml(metric.definition)}</p>` : ''}
            ${metric.hint ? `<p class="f1b-metric-hint">${escapeHtml(metric.hint)}</p>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
      ${section.extraBlocks ? renderExtraBlocks(section.extraBlocks) : ''}
      ${section.chart ? `<div class="f1b-drawer-chart" data-section-chart="${escapeAttr(section.chart.type)}"></div>` : ''}
    </div>
  `;

  container.dataset.rendered = 'true';

  if (section.chart && section.chart.type) {
    import('../components/f1b-charts.js')
      .then(async ({ renderF1BSectionChart }) => {
        const chartNode = container.querySelector('[data-section-chart]');
        if (!chartNode) {return;}
        try {
          await renderF1BSectionChart(section.chart.type, chartNode, normalized.chartContext);
        } catch (err) {
          Logger.error('F1B', `Errore rendering chart per sezione ${section.id}`, err);
          chartNode.innerHTML = `
            <div class="error-state">
              <div class="error-state-title">Chart non disponibile</div>
              <div class="error-state-message">${escapeHtml(err?.message || 'Errore sconosciuto')}</div>
            </div>
          `;
        }
      })
      .catch((err) => {
        Logger.error('F1B', `Errore caricamento componente chart per sezione ${section.id}`, err);
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
    disclaimer: normalized.meta.hero_disclaimer,
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
  if (!node || !rawData) {return;}

  const normalized = normalizeDataPublicF1B(rawData);
  node.__f1bNormalized = normalized;

  // Bind drawer tabs
  const tabsWrapper = node.querySelector('.module-tabs-wrapper');
  if (tabsWrapper) {
    bindModuleTabs(tabsWrapper);
    tabsWrapper.addEventListener('drawer-tab-opened', (event) => {
      const { tabId, container } = event.detail || {};
      if (!tabId || !container) {return;}
      const section = normalized.sectionsMap[tabId];
      if (!section) {return;}
      renderSectionContent(container, section, normalized);
    });
  }

  // Render primary charts
  const chartNodes = node.querySelectorAll('[data-primary-chart]');
  if (chartNodes.length > 0) {
    import('../components/f1b-charts.js')
      .then(({ renderF1BPrimaryChart }) => {
        chartNodes.forEach((chartNode) => {
          const chartId = chartNode.dataset.primaryChart;
          if (!chartId) {return;}
          renderF1BPrimaryChart(chartId, chartNode, normalized.chartContext);
        });
      })
      .catch((err) => {
        Logger.error('F1B', 'Errore caricamento chart principali', err);
        chartNodes.forEach((chartNode) => {
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
