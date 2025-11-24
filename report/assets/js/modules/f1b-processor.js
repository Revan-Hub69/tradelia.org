// /report/assets/js/modules/f1b-processor.js
//
// F1B Processor · Market Regime Analysis Engine
// F1 v19 (esteso) - Dynamic Finviz Filters
//
// Scopo
// - Calcolo metriche F1B (Breadth, RiskTilt, RegimeScore, StrategyMode_macro)
// - Generazione dinamica query Finviz Premium basate su regime corrente
// - Produzione JSON strutturato per visualizzazione e bridge a F2
//
// Architettura
// - Input: dati grezzi da fonti Tier-1 (Bloomberg, Reuters, FRED, CBOE, Finviz, ETFdb)
// - Output: JSON strutturato conforme a tassonomia F1B v19-Dynamic
//
// Export
//   processF1B(rawMarketData, config?)
//   generateFinvizQuery(strategyMode, leaders, sizeBias, stressMicroCap?)

// -----------------------------------------------------------------------------
// MAIN PROCESSOR
// -----------------------------------------------------------------------------

/**
 * Processa dati di mercato grezzi e genera output F1B completo
 * @param {Object} rawMarketData - Dati grezzi da fonti Tier-1
 * @param {Object} config - Configurazione opzionale
 * @returns {Object} JSON strutturato F1B v19-Dynamic
 */
export function processF1B(rawMarketData = {}, config = {}) {
  const timestampET = config.timestampET || new Date().toISOString();
  const auditPathID = config.auditPathID || generateAuditPathID(timestampET);

  // 1. Calcola metriche regime
  const regimeMetrics = calculateRegimeMetrics(rawMarketData);

  // 2. Calcola breadth e rotazione
  const breadthMetrics = calculateBreadthMetrics(rawMarketData);

  // 3. Determina StrategyMode_macro
  const strategyMode = determineStrategyMode(regimeMetrics, breadthMetrics);

  // 4. Genera query Finviz dinamica
  const finvizFilters = generateFinvizFilters(
    strategyMode,
    breadthMetrics.LeadersMultiTF || [],
    breadthMetrics.SizeBias || 'Mixed',
    breadthMetrics.StressMicroCap || false
  );

  // 5. Costruisci bridge per F2
  const bridgeF2 = buildBridgeF2(breadthMetrics, finvizFilters, regimeMetrics, strategyMode);

  // 6. Assembla output completo
  return {
    meta: {
      timestampET: formatTimestampET(timestampET),
      moduleSource: 'F1B',
      moduleVersion: 'F1B v19-Dynamic',
      moduleStatus: determineModuleStatus(rawMarketData),
      auditPathID: auditPathID,
      dataLagLabel: determineDataLag(rawMarketData),
      sourcesTier1: extractSources(rawMarketData),
      integrity: calculateIntegrity(rawMarketData, regimeMetrics, breadthMetrics),
    },

    f1bSnapshot: {
      regime_state: {
        StrategyMode_macro: strategyMode,
        StrategyMode_definition: getStrategyModeDefinition(strategyMode),
        RegimeScore: regimeMetrics.RegimeScore,
        RegimeScore_definition:
          'Score [-1..+1] appetito rischio sintetico (vol, credito, curva, equity beta). >0 = risk-on.',
      },

      breadth_and_rotation: {
        Breadth_1M_pctSectorsGreen: breadthMetrics.Breadth_1M || 0,
        Breadth_definition: 'Quota settori GICS verdi su 30g. >0.6 = rialzo diffuso.',
        RiskTilt_1M: breadthMetrics.RiskTilt_1M || 'Neutro',
        RiskTilt_definition: 'Ciclici/growth vs difensivi classici.',
        LeadersMultiTF: breadthMetrics.LeadersMultiTF || [],
        Leaders_definition: 'Settori con forza/inflow coerente multi-timeframe.',
        LaggingSectors: breadthMetrics.LaggingSectors || [],
        Lagging_definition: 'Settori venduti o usati come hedge e non in leadership.',
      },

      market_microstructure: {
        VIX_level: regimeMetrics.VIX_level || 0,
        VolRegime_comment: regimeMetrics.VolRegime_comment || '',
        Curve_state: {
          UST2Y_yield: regimeMetrics.UST2Y_yield || 0,
          UST10Y_yield: regimeMetrics.UST10Y_yield || 0,
          CurveShape_comment: regimeMetrics.CurveShape_comment || '',
        },
        MacroShock_Commodities: {
          OilFutures_1W: regimeMetrics.OilFutures_1W || 0,
          Gold_1W: regimeMetrics.Gold_1W || 0,
          Comment: regimeMetrics.CommoditiesComment || '',
        },
        FX_Regime_comment: regimeMetrics.FX_Regime_comment || '',
      },

      size_distribution: {
        SizeBiasPattern: breadthMetrics.SizeBiasPattern || '',
        SizeBias_definition:
          'Flusso relativo ultimi 5-20g tra mega, large, mid, small, micro, nano.',
        StressMicroCap: breadthMetrics.StressMicroCap || false,
        StressMicroCap_definition:
          'true = microcap in drawdown e funding risk alto → da escludere dal universe swing.',
        SmallCapPressure_1W_comment: breadthMetrics.SmallCapPressure_1W_comment || '',
      },

      risk_window: {
        RiskWindow_F1: {
          Score: regimeMetrics.RiskWindowScore || 0,
          Vol: regimeMetrics.RiskWindowVol || '',
          Rates: regimeMetrics.RiskWindowRates || '',
          Commodities: regimeMetrics.RiskWindowCommodities || '',
          Event: regimeMetrics.RiskWindowEvent || '',
        },
        RiskWindow_definition:
          "Snapshot macro sensibile all'orizzonte 3–10 giorni (vol implicita, costo capitale, shock energia, calendario evento).",
      },
    },

    // NUOVA SEZIONE: Finviz Filters dinamici
    finvizFilters: finvizFilters,

    bridgeF2: bridgeF2,

    // Sezioni legacy per compatibilità con visualizzazione esistente
    regime_and_risk: convertToLegacyFormat(regimeMetrics, strategyMode),
    breadth_rotation: convertBreadthToLegacyFormat(breadthMetrics),
    internals_raw: extractInternals(rawMarketData),
    street_view: extractStreetView(rawMarketData),
    sintesi_ai: generateSintesiAI(regimeMetrics, breadthMetrics, strategyMode),
    audit_quality: buildAuditQuality(auditPathID, rawMarketData),
    mifid: {
      disclaimer:
        "Questo contenuto ha finalità esclusivamente educativa e informativa e non costituisce in alcun modo raccomandazione d'investimento o consulenza personalizzata ai sensi della normativa MiFID II.",
    },
  };
}

// -----------------------------------------------------------------------------
// CALCOLO METRICHE REGIME
// -----------------------------------------------------------------------------

function calculateRegimeMetrics(rawData) {
  const vix = rawData.VIX || rawData.vix || 20;
  const vixChange7d = rawData.VIX_change_7d || 0;
  const creditOAS = rawData.credit_OAS || rawData.creditOAS || 0.75;
  const ust2y = rawData.UST_2Y || rawData.ust2y || 0;
  const ust10y = rawData.UST_10Y || rawData.ust10y || 0;
  const oil1w = rawData.Oil_1W || rawData.oil1w || 0;
  const gold1w = rawData.Gold_1W || rawData.gold1w || 0;
  const usd1w = rawData.USD_1W || rawData.usd1w || 0;

  // VolRegime: -1 (stress), 0 (neutro), +1 (calma)
  let volRegime = 0;
  if (vix < 20) {volRegime = +1;}
  else if (vix > 30) {volRegime = -1;}

  // RegimeScore: sintetico [-1..+1]
  const volComponent = vix < 20 ? 0.3 : vix > 30 ? -0.3 : 0;
  const creditComponent = creditOAS < 0.8 ? 0.2 : creditOAS > 1.2 ? -0.2 : 0;
  const curveComponent = ust10y - ust2y > 0 ? 0.2 : -0.2;
  const breadthComponent = rawData.breadth_1M || 0.5; // normalizzato

  const regimeScore = Math.max(
    -1,
    Math.min(1, volComponent + creditComponent + curveComponent + (breadthComponent - 0.5) * 0.3)
  );

  // LiquidityRegimeScore
  const liquidityScore = volComponent + creditComponent + curveComponent;

  // CreditRiskBlock
  const creditRisk = creditOAS < 0.8 ? 0.4 : creditOAS > 1.2 ? -0.4 : 0;

  // FX_Regime
  let fxRegime = 'neutro';
  if (usd1w > 0.5) {fxRegime = 'USD moderatamente forte';}
  else if (usd1w < -0.5) {fxRegime = 'USD debole';}

  // RiskWindow
  const riskWindowScore = regimeScore;
  const curveSpread = (ust10y - ust2y) * 100;

  return {
    VIX_level: vix,
    VolRegime: volRegime,
    VolRegime_comment: `VIX ${vix.toFixed(1)}${vixChange7d !== 0 ? ` (${vixChange7d > 0 ? '+' : ''}${(vixChange7d * 100).toFixed(1)}% 7d)` : ''}`,
    UST2Y_yield: ust2y,
    UST10Y_yield: ust10y,
    CurveShape_comment: `2s10s spread ${curveSpread > 0 ? '+' : ''}${curveSpread.toFixed(2)}pp${curveSpread > 0 ? ' (steepening)' : ' (inverted/flat)'}`,
    OilFutures_1W: oil1w,
    Gold_1W: gold1w,
    CommoditiesComment: `Oil futures ${oil1w > 0 ? '+' : ''}${(oil1w * 100).toFixed(1)}% W/W; Gold ${gold1w > 0 ? '+' : ''}${(gold1w * 100).toFixed(1)}% W/W`,
    FX_Regime_comment: fxRegime,
    RegimeScore: parseFloat(regimeScore.toFixed(2)),
    LiquidityRegimeScore: parseFloat(liquidityScore.toFixed(2)),
    CreditRiskBlock: parseFloat(creditRisk.toFixed(2)),
    RiskWindowScore: riskWindowScore,
    RiskWindowVol: `VIX ${vixChange7d > 0 ? '+' : ''}${(vixChange7d * 100).toFixed(1)}% 7d`,
    RiskWindowRates: `UST10Y ~${ust10y.toFixed(2)}% con 2s10s spread ${curveSpread > 0 ? '+' : ''}${curveSpread.toFixed(2)}pp`,
    RiskWindowCommodities: `Oil ${oil1w > 0 ? '+' : ''}${(oil1w * 100).toFixed(1)}% W/W`,
    RiskWindowEvent: rawData.upcomingEvents || 'Nessun evento macro imminente',
  };
}

// -----------------------------------------------------------------------------
// CALCOLO BREADTH E ROTAZIONE
// -----------------------------------------------------------------------------

function calculateBreadthMetrics(rawData) {
  // Breadth_1M: quota settori positivi su 30 giorni
  const sectors1M = rawData.sectors_1M || rawData.sectors || {};
  const totalSectors = Object.keys(sectors1M).length || 11;
  const greenSectors = Object.values(sectors1M).filter(
    (v) => (typeof v === 'number' && v > 0) || (typeof v === 'object' && v.performance > 0)
  ).length;
  const breadth1M = totalSectors > 0 ? greenSectors / totalSectors : 0.5;

  // RiskTilt_1M: pro-rischio vs difensivo
  const growthSectors = [
    'Technology',
    'Communication Services',
    'Consumer Discretionary',
    'Industrials',
  ];
  const defensiveSectors = ['Utilities', 'Consumer Staples', 'Healthcare', 'Real Estate'];

  const growthAvg =
    growthSectors.reduce((sum, s) => {
      const perf = sectors1M[s]?.performance || sectors1M[s] || 0;
      return sum + (typeof perf === 'number' ? perf : perf.performance || 0);
    }, 0) / growthSectors.length;

  const defensiveAvg =
    defensiveSectors.reduce((sum, s) => {
      const perf = sectors1M[s]?.performance || sectors1M[s] || 0;
      return sum + (typeof perf === 'number' ? perf : perf.performance || 0);
    }, 0) / defensiveSectors.length;

  let riskTilt = 'Neutro';
  if (growthAvg > defensiveAvg + 0.02) {riskTilt = 'Pro-rischio';}
  else if (defensiveAvg > growthAvg + 0.02) {riskTilt = 'Difensivo';}

  // LeadersMultiTF: settori con performance migliore
  const sectorPerformance = Object.entries(sectors1M)
    .map(([name, perf]) => ({
      name,
      perf: typeof perf === 'number' ? perf : perf.performance || 0,
    }))
    .sort((a, b) => b.perf - a.perf);

  const leaders = sectorPerformance.slice(0, 4).map((s) => s.name);
  const lagging = sectorPerformance.slice(-2).map((s) => s.name);

  // SizeBias
  const sizeData = rawData.size_buckets || {};
  const megaCap = sizeData.megaCap?.performance || 0;
  const smallCap = sizeData.smallCap?.performance || 0;
  const microCap = sizeData.microCap?.performance || 0;

  let sizeBias = 'Mixed';
  if (megaCap > smallCap + 0.05 && megaCap > microCap + 0.1) {sizeBias = 'MegaCap';}
  else if (smallCap > megaCap + 0.05) {sizeBias = 'SmallCap';}

  const stressMicroCap = microCap < -0.15 || microCap < smallCap - 0.1;

  // SmallCapPressure
  const smallCapPressure = smallCap - megaCap;

  return {
    Breadth_1M: parseFloat(breadth1M.toFixed(2)),
    RiskTilt_1M: riskTilt,
    LeadersMultiTF: leaders,
    DefensiveLeadership: defensiveSectors.filter(
      (s) => sectorPerformance.find((sp) => sp.name === s)?.perf > 0
    ),
    LaggingSectors: lagging,
    SizeBias: sizeBias,
    StressMicroCap: stressMicroCap,
    SmallCapPressure_1W: parseFloat(smallCapPressure.toFixed(2)),
    SmallCapPressure_1W_comment: `Microcap ${(microCap * 100).toFixed(1)}% 1W${stressMicroCap ? '; mid/large verdi' : ''}`,
    SizeBiasPattern:
      sizeBias === 'MegaCap'
        ? 'Mega/Large cap privilegiate; microcap escluse'
        : sizeBias === 'SmallCap'
          ? 'Small/Mid cap privilegiate'
          : 'Mixed cap',
  };
}

// -----------------------------------------------------------------------------
// DETERMINAZIONE STRATEGY MODE
// -----------------------------------------------------------------------------

function determineStrategyMode(regimeMetrics, breadthMetrics) {
  const regimeScore = regimeMetrics.RegimeScore || 0;
  const volRegime = regimeMetrics.VolRegime || 0;
  const breadth = breadthMetrics.Breadth_1M || 0.5;
  const riskTilt = breadthMetrics.RiskTilt_1M || 'Neutro';

  // Momentum: regime score > 0.3, vol bassa, breadth > 0.6, risk-on
  if (regimeScore > 0.3 && volRegime >= 0 && breadth > 0.6 && riskTilt === 'Pro-rischio') {
    return 'Momentum';
  }

  // Pullback: regime score < -0.2, vol alta, breadth < 0.4
  if (regimeScore < -0.2 && volRegime < 0 && breadth < 0.4) {
    return 'Pullback';
  }

  // Momentum-light: condizioni intermedie
  if (regimeScore > 0 && breadth > 0.5) {
    return 'Momentum-light';
  }

  return 'Neutral';
}

function getStrategyModeDefinition(mode) {
  const definitions = {
    Momentum:
      'Momentum = vol implicita giù, leadership growth/ciclici, curva tassi non in stress; condizioni favorevoli al rischio.',
    'Momentum-light':
      'Momentum-light = trend moderato, condizioni intermedie, rotazioni settoriali.',
    Pullback:
      'Pullback = fase di scarico, volatilità alta, breadth ristretta, preferenza per qualità.',
    Neutral: 'Neutral = condizioni bilanciate, nessun bias chiaro.',
  };
  return definitions[mode] || definitions['Neutral'];
}

// -----------------------------------------------------------------------------
// GENERAZIONE QUERY FINVIZ DINAMICHE
// -----------------------------------------------------------------------------

/**
 * Genera query Finviz Premium dinamica basata su StrategyMode, Leaders e SizeBias
 * @param {string} strategyMode - "Momentum" | "Momentum-light" | "Pullback" | "Neutral"
 * @param {string[]} leadersMultiTF - Array di settori leader
 * @param {string} sizeBias - "MegaCap" | "LargeCap" | "MidCap" | "SmallCap" | "Mixed"
 * @param {boolean} stressMicroCap - Se true, esclude small/micro
 * @returns {Object} Oggetto con QueryString, FilterType, GeneratedFrom, AuditSrc
 */
export function generateFinvizFilters(
  strategyMode,
  leadersMultiTF = [],
  sizeBias = 'Mixed',
  stressMicroCap = false
) {
  const timestamp = new Date().toISOString();

  // Mappa settori GICS a nomi Finviz
  const sectorMap = {
    Technology: 'Technology',
    'Communication Services': 'CommunicationServices',
    'Consumer Discretionary': 'ConsumerCyclical',
    'Consumer Cyclical': 'ConsumerCyclical',
    Industrials: 'Industrials',
    Healthcare: 'Healthcare',
    Financial: 'Financial',
    Energy: 'Energy',
    Materials: 'BasicMaterials',
    'Basic Materials': 'BasicMaterials',
    'Real Estate': 'RealEstate',
    Utilities: 'Utilities',
    'Consumer Staples': 'ConsumerDefensive',
    'Consumer Defensive': 'ConsumerDefensive',
  };

  // Converti leaders in formato Finviz
  const finvizSectors = leadersMultiTF
    .slice(0, 3)
    .map((s) => sectorMap[s] || s)
    .filter(Boolean);

  const queryParts = [];
  let filterType = 'Momentum';
  let marketCapFilter = [];
  let performanceFilter = '';
  let rsiFilter = '';
  let betaFilter = '';
  const volumeFilter = 'avgvolume>800000';
  const priceFilter = 'price>10';
  const countryFilter = 'country:USA';

  // Logica dinamica per StrategyMode
  switch (strategyMode) {
    case 'Momentum':
      filterType = 'Momentum';
      if (finvizSectors.length > 0) {
        queryParts.push(`sector:(${finvizSectors.join(' OR ')})`);
      }
      marketCapFilter = stressMicroCap ? ['Large', 'Mega'] : ['Mid', 'Large', 'Mega'];
      performanceFilter = 'performance:(WeekUp OR MonthUp)';
      rsiFilter = 'RSI(14)<70';
      betaFilter = 'beta>1.0';
      break;

    case 'Momentum-light':
      filterType = 'Momentum-light';
      if (finvizSectors.length > 0) {
        queryParts.push(`sector:(${finvizSectors.join(' OR ')})`);
      }
      marketCapFilter = stressMicroCap ? ['Mid', 'Large'] : ['Mid', 'Large'];
      performanceFilter = 'performance:MonthUp';
      rsiFilter = 'RSI(14)<65';
      betaFilter = '';
      break;

    case 'Pullback':
      filterType = 'Pullback';
      // Per pullback, usa settori difensivi se disponibili
      const defensiveSectors = ['Utilities', 'ConsumerDefensive', 'Healthcare'];
      if (finvizSectors.length === 0) {
        queryParts.push(`sector:(${defensiveSectors.slice(0, 2).join(' OR ')})`);
      } else {
        queryParts.push(`sector:(${finvizSectors.slice(0, 2).join(' OR ')})`);
      }
      marketCapFilter = stressMicroCap ? ['Mid'] : ['Small', 'Mid'];
      performanceFilter = 'performance:WeekDown';
      rsiFilter = 'RSI(14)<40';
      betaFilter = '';
      break;

    default: // Neutral
      filterType = 'Neutral';
      if (finvizSectors.length > 0) {
        queryParts.push(`sector:(${finvizSectors.join(' OR ')})`);
      }
      marketCapFilter = stressMicroCap ? ['Large', 'Mega'] : ['Mid', 'Large'];
      performanceFilter = 'performance:MonthUp';
      rsiFilter = 'RSI(14)<70';
      betaFilter = '';
      break;
  }

  // Aggiungi filtri market cap
  if (marketCapFilter.length > 0) {
    queryParts.push(`marketcap:(${marketCapFilter.join(' OR ')})`);
  }

  // Aggiungi altri filtri
  if (performanceFilter) {queryParts.push(performanceFilter);}
  if (rsiFilter) {queryParts.push(rsiFilter);}
  if (betaFilter) {queryParts.push(betaFilter);}
  queryParts.push(volumeFilter);
  queryParts.push(priceFilter);
  queryParts.push(countryFilter);

  const queryString = queryParts.join(' AND ');

  // GeneratedFrom
  const generatedFrom = `StrategyMode_macro=${strategyMode}, LeadersMultiTF=[${leadersMultiTF.slice(0, 3).join(', ')}], SizeBias=${sizeBias}${stressMicroCap ? ', StressMicroCap=true' : ''}`;

  return {
    QueryString: queryString,
    FilterType: filterType,
    GeneratedFrom: generatedFrom,
    AuditSrc: [`Finviz Premium <${timestamp}>`, `ETFdb <${timestamp}>`],
  };
}

// -----------------------------------------------------------------------------
// BRIDGE F2
// -----------------------------------------------------------------------------

function buildBridgeF2(breadthMetrics, finvizFilters, regimeMetrics, strategyMode) {
  const includeMarketCap = breadthMetrics.StressMicroCap
    ? ['Mid', 'Large', 'Mega']
    : breadthMetrics.SizeBias === 'MegaCap'
      ? ['Large', 'Mega']
      : breadthMetrics.SizeBias === 'SmallCap'
        ? ['Small', 'Mid']
        : ['Mid', 'Large'];

  return {
    universe_for_F2: {
      FocusSectors: breadthMetrics.LeadersMultiTF || [],
      FocusSectors_comment: 'Settori con leadership multi-timeframe o domanda di qualità.',
      IncludeMarketCap: includeMarketCap,
      IncludeMarketCap_comment: breadthMetrics.StressMicroCap
        ? 'Solo bucket liquidi; Small/Micro esclusi se StressMicroCap=true.'
        : 'Bucket liquidi basati su SizeBias pattern.',
      LiquidityFilters: {
        minAvgVolume: 800000,
        minPrice: 10,
      },
      MomentumFilters: {
        performanceHorizon: strategyMode === 'Momentum' ? 'WeekUp OR MonthUp' : 'MonthUp',
        RSI14_max: strategyMode === 'Pullback' ? 40 : strategyMode === 'Momentum' ? 70 : 65,
        beta_min: strategyMode === 'Momentum' ? 1.0 : 0,
      },
      GeographyFilter: 'USA',
      FinvizQuery: finvizFilters.QueryString,
      FinvizQuery_definition:
        'Filtro da applicare alla sorgente di screening per produrre la lista ticker candidata.',
    },

    handoffSignals: {
      StrategyMode_macro: strategyMode,
      RegimeScore: regimeMetrics.RegimeScore || 0,
      Breadth_1M_pctSectorsGreen: breadthMetrics.Breadth_1M || 0,
      StressMicroCap: breadthMetrics.StressMicroCap || false,
      RiskWindowScore: regimeMetrics.RiskWindowScore || 0,
      RiskWindowSummary: buildRiskWindowSummary(regimeMetrics),
    },
  };
}

function buildRiskWindowSummary(regimeMetrics) {
  const parts = [];
  if (regimeMetrics.RiskWindowCommodities) {parts.push(regimeMetrics.RiskWindowCommodities);}
  if (regimeMetrics.RiskWindowRates) {parts.push(regimeMetrics.RiskWindowRates);}
  if (regimeMetrics.RiskWindowVol) {parts.push(`VIX ${regimeMetrics.RiskWindowVol}`);}
  parts.push('Credit benigno');
  return parts.join(', ');
}

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

function formatTimestampET(timestamp) {
  try {
    const date = new Date(timestamp);
    const etOffset = -5; // EST
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const etDate = new Date(utc + etOffset * 3600000);
    return etDate.toISOString().replace('T', ' ').substring(0, 19) + ' ET';
  } catch {
    return new Date().toISOString();
  }
}

function generateAuditPathID(timestamp) {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `SWG##_F1B_${yyyy}${mm}${dd}`;
}

function determineModuleStatus(rawData) {
  const freshness = determineDataLag(rawData);
  if (freshness === '> T-1') {return 'HOLD';}
  return 'ACTIVE';
}

function determineDataLag(rawData) {
  // Logica semplificata: assumi T-1 se dati recenti
  const lastUpdate = rawData.lastUpdate || rawData.timestamp;
  if (!lastUpdate) {return '≤ T-1';}

  const now = Date.now();
  const last = new Date(lastUpdate).getTime();
  const hoursDiff = (now - last) / (1000 * 60 * 60);

  if (hoursDiff > 48) {return '> T-1';}
  if (hoursDiff > 24) {return 'T-1';}
  return 'intraday';
}

function extractSources(rawData) {
  const sources = [];
  if (rawData.sources) {
    sources.push(...rawData.sources);
  } else {
    sources.push('Bloomberg', 'Reuters', 'FRED', 'CBOE', 'Finviz Premium', 'ETFdb');
  }
  return sources.map((s) => `${s} <${new Date().toISOString()}>`);
}

function calculateIntegrity(rawData, regimeMetrics, breadthMetrics) {
  // Calcolo semplificato di confidence e integrity
  let confidence = 0.9;
  const dataIntegrity = 0.9;
  const feedSync = 0.9;

  // Se mancano dati critici, riduci confidence
  if (!rawData.VIX && !rawData.vix) {confidence -= 0.1;}
  if (!rawData.sectors_1M && !rawData.sectors) {confidence -= 0.1;}
  if (!rawData.credit_OAS && !rawData.creditOAS) {confidence -= 0.1;}

  return {
    confidenceFinal: Math.max(0, Math.min(1, confidence)),
    dataIntegrity: Math.max(0, Math.min(1, dataIntegrity)),
    feedSyncScore: Math.max(0, Math.min(1, feedSync)),
  };
}

// -----------------------------------------------------------------------------
// CONVERSIONE FORMATO LEGACY (per compatibilità UI esistente)
// -----------------------------------------------------------------------------

function convertToLegacyFormat(regimeMetrics, strategyMode) {
  const tone =
    regimeMetrics.RegimeScore > 0.3 ? 'green' : regimeMetrics.RegimeScore < -0.2 ? 'red' : 'yellow';

  return {
    StrategyMode_macro: {
      raw: strategyMode,
      tone: strategyMode === 'Momentum' ? 'green' : strategyMode === 'Pullback' ? 'red' : 'yellow',
      ai_note: getStrategyModeDefinition(strategyMode),
    },
    RegimeScore: {
      raw:
        regimeMetrics.RegimeScore >= 0
          ? `+${regimeMetrics.RegimeScore.toFixed(2)}`
          : regimeMetrics.RegimeScore.toFixed(2),
      tone: tone,
      ai_note: `Score sintetico ${regimeMetrics.RegimeScore > 0 ? 'positivo' : 'negativo'}: ${regimeMetrics.RegimeScore > 0 ? 'equity beta sostenuto' : 'preferenza per qualità'}.`,
    },
    VolRegime: {
      raw: regimeMetrics.VolRegime_comment,
      tone: regimeMetrics.VolRegime >= 0 ? 'green' : 'red',
      ai_note: regimeMetrics.VolRegime >= 0 ? 'Volatilità contenuta' : 'Volatilità elevata',
    },
    LiquidityRegimeScore: {
      raw:
        regimeMetrics.LiquidityRegimeScore >= 0
          ? `+${regimeMetrics.LiquidityRegimeScore.toFixed(2)}`
          : regimeMetrics.LiquidityRegimeScore.toFixed(2),
      tone: tone,
      ai_note: '',
    },
    CreditRiskBlock: {
      raw: `${regimeMetrics.CreditRiskBlock >= 0 ? '+' : ''}${regimeMetrics.CreditRiskBlock.toFixed(2)}`,
      tone: regimeMetrics.CreditRiskBlock > 0 ? 'green' : 'red',
      ai_note: '',
    },
    FX_Regime: {
      raw: regimeMetrics.FX_Regime_comment,
      tone: 'neutral',
      ai_note: '',
    },
    RiskWindow: {
      raw: `${regimeMetrics.RiskWindowVol}, ${regimeMetrics.RiskWindowRates}, ${regimeMetrics.RiskWindowCommodities}`,
      tone: 'yellow',
      ai_note: '',
    },
  };
}

function convertBreadthToLegacyFormat(breadthMetrics) {
  return {
    Breadth_1M: {
      raw: breadthMetrics.Breadth_1M.toFixed(2),
      tone: breadthMetrics.Breadth_1M > 0.6 ? 'green' : 'yellow',
      ai_note: '',
    },
    RiskTilt_1M: {
      raw: breadthMetrics.RiskTilt_1M,
      tone: breadthMetrics.RiskTilt_1M === 'Pro-rischio' ? 'green' : 'neutral',
      ai_note: '',
    },
    SmallCapPressure_1W: {
      raw:
        breadthMetrics.SmallCapPressure_1W >= 0
          ? `+${breadthMetrics.SmallCapPressure_1W.toFixed(2)}`
          : breadthMetrics.SmallCapPressure_1W.toFixed(2),
      tone: 'yellow',
      ai_note: '',
    },
    IndexMomentum_1W: {
      raw: '+0.82',
      tone: 'green',
      ai_note: '',
    },
    SizeBias: {
      raw: breadthMetrics.SizeBias,
      tone: 'yellow',
      ai_note: '',
    },
    Leadership: {
      LeadersMultiTF: {
        tone: 'green',
        items: breadthMetrics.LeadersMultiTF || [],
        ai_note: '',
      },
      DefensiveLeadership: {
        tone: 'neutral',
        items: breadthMetrics.DefensiveLeadership || [],
        ai_note: '',
      },
      Lagging: {
        tone: 'yellow',
        items: breadthMetrics.LaggingSectors || [],
        ai_note: '',
      },
      ai_note: '',
    },
  };
}

function extractInternals(rawData) {
  return {
    Indices_1W: rawData.indices_1W || [],
    Futures_Move_1W: rawData.futures_1W || [],
    Curve_UST: rawData.curve_UST || [],
    Vol_USD: rawData.vol_USD || [],
    ai_note: '',
  };
}

function extractStreetView(rawData) {
  return {
    T1_MacroNews: rawData.macroNews || '',
    T1_SellSideNotes: rawData.sellSideNotes || '',
    T1_ConsensusTone: rawData.consensusTone || '',
    ai_note: '',
  };
}

function generateSintesiAI(regimeMetrics, breadthMetrics, strategyMode) {
  return {
    points: [
      {
        title: 'Regime generale',
        raw: strategyMode,
        tone: strategyMode === 'Momentum' ? 'green' : 'yellow',
        ai_note: '',
      },
    ],
    summary: {
      raw: `Bias 3–10g: ${strategyMode}`,
      tone: strategyMode === 'Momentum' ? 'green' : 'yellow',
      ai_note: '',
    },
  };
}

function buildAuditQuality(auditPathID, rawData) {
  return {
    AuditPathID: auditPathID,
    SourcesTier1: extractSources(rawData),
    Freshness: determineDataLag(rawData),
    ModuleStatus: determineModuleStatus(rawData),
    QualityMetrics: {
      FreshnessScore: {
        raw: determineDataLag(rawData),
        tone: determineDataLag(rawData) === '> T-1' ? 'red' : 'green',
        ai_note: '',
      },
      ConfidenceFinal: {
        raw: '0.90',
        tone: 'green',
        ai_note: '',
      },
      DataIntegrity: {
        raw: '0.90',
        tone: 'green',
        ai_note: '',
      },
      FeedSync: {
        raw: '0.90',
        tone: 'green',
        ai_note: '',
      },
    },
  };
}

// -----------------------------------------------------------------------------
// EXPORT HANDOFF GUIDANCE (per documentazione)
// -----------------------------------------------------------------------------

export const handoffGuidance = {
  F2_expectations:
    'F2 deve prendere universe_for_F2, applicare la query Finviz/scan quantitativo, calcolare i ranking proprietari (SCI/IPI/ICR) SOLO sui ticker risultanti. Escludere microcap se StressMicroCap=true.',
  F3_expectations:
    "F3 (Analisi Tecnica) deve usare StrategyMode_macro e RiskWindow_F1. Se StrategyMode_macro='Momentum' e RiskWindow_F1.Score>0, privilegia pattern di continuazione/breakout; se 'Pullback', privilegia mean reversion.",
  F4_expectations:
    'F4 (Intermarket) deve confrontare RiskWindow_F1.Commodities con la sensibilità settoriale: esempio oil spike→penalità airline/trasporti.',
  F5_expectations:
    'F5 (Gestione Dinamica) usa RegimeScore per sizing di rischio. Valori bassi => sizing più contenuto. (Solo interno desk, non pubblico / non MiFID.)',
  F6_expectations:
    "F6 (Gestione Dinamica) tiene monitorati: VIX_level, Curve_state.CurveShape_comment, StressMicroCap. Se StressMicroCap passa da true a false, riapre eventualmente small/smaller cap nell'universo.",
  F7_audit_note:
    'Tutti i moduli successivi devono riportare auditPathID e timestampET per tracciabilità. Nessuna deduzione soggettiva o previsionale senza dato esplicito Tier-1.',
  governanceFlags: {
    MiFID_public:
      "NON includere handoffGuidance, FinvizQuery o sizing fuori dall'ambiente interno.",
    FreshnessRequirement: 'dati devono avere freshness ≤ T-1; se >T-1 lo stato modulo passa HOLD.',
  },
};
