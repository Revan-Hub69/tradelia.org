// F1B Explanations - Spiegazioni pezzo per pezzo per ogni metrica F1B
// Formato compatibile con metric-popup system

export const F1B_EXPLANATIONS = {
  // === REGIME STATE ===
  StrategyMode_macro: {
    nomeTecnico: 'StrategyMode (Regime Tattico)',
    what: 'Classificazione del regime di mercato tattico (3–10 giorni) basata sulla combinazione di volatilità, credito, breadth e flussi. Tre modalità: Momentum (risk-on), Momentum-light (trend moderato), Pullback (risk-off).',
    how: 'StrategyMode viene calcolato combinando RegimeScore, VolRegime, Breadth_1M e RiskTilt_1M. Se RegimeScore > 0.3, vol bassa, breadth > 0.6 e risk-on → Momentum. Se RegimeScore < -0.2, vol alta, breadth < 0.4 → Pullback. Altrimenti → Momentum-light o Neutral.',
    fonte:
      'Carhart, M.M. (1997). On Persistence in Mutual Fund Performance. Journal of Finance, 52(1), 57-82.',
    esempio:
      'Se VIX < 20, RegimeScore +0.5, Breadth 0.75, settori growth leader → StrategyMode = Momentum',
  },

  RegimeScore: {
    nomeTecnico: 'RegimeScore (Indicatore Appetito Rischio)',
    what: "Indicatore sintetico che misura l'appetito al rischio (risk-on vs risk-off) ponderando volatilità, credito e leadership fattoriale. Valori positivi indicano preferenza per asset rischiosi, valori negativi indicano fuga verso qualità.",
    how: 'RegimeScore = (volComponent × 0.3) + (creditComponent × 0.2) + (curveComponent × 0.2) + (breadthComponent × 0.3). Valori da -1 (risk-off massimo) a +1 (risk-on massimo). >0 = risk-on, <0 = risk-off.',
    fonte:
      'Adrian, T., Crump, R.K., & Moench, E. (2013). Pricing the Term Structure with Linear Regressions. Journal of Financial Economics, 110(1), 110-138.',
    esempio: 'RegimeScore +0.6 = mercato risk-on, preferenza per azioni, crypto, asset rischiosi',
  },

  VolRegime: {
    nomeTecnico: 'VolRegime (Regime Volatilità)',
    what: 'Misura della domanda di copertura (hedge) rilevata attraverso indici di volatilità e term structure. Volatilità alta e term structure compressa indicano maggiore stress e ricerca di protezione.',
    how: 'VolRegime = -1 se VIX > 30 (stress), 0 se VIX 20-30 (neutro), +1 se VIX < 20 (calma). Viene anche considerata la variazione VIX 7 giorni e la term structure (backwardation vs contango).',
    fonte:
      'Whaley, R.E. (2009). Understanding VIX. Journal of Portfolio Management, 35(3), 98-105.',
    esempio: 'VIX 17.5, variazione -2.1% 7d → VolRegime = +1 (calma, risk-on)',
  },

  Breadth_1M: {
    nomeTecnico: 'Breadth 1M (Ampiezza Settoriale)',
    what: 'Quota settori GICS positivi su 30 giorni. Indica quanto è diffusa la partecipazione al rialzo. Valori > 0.6 indicano rialzo diffuso, < 0.4 indicano rally ristretto.',
    how: 'Breadth_1M = (numero settori con performance positiva su 30 giorni) / (totale settori GICS). Calcolato usando ETF settoriali SPDR (XLK, XLC, XLY, ecc.) come proxy.',
    fonte:
      'Breadth indicators sono standard in technical analysis. Vedi: Zweig, M.E. (1970). A New Look at the Market.',
    esempio: '8 settori positivi su 11 = Breadth_1M = 0.73 (partecipazione ampia, rialzo diffuso)',
  },

  RiskTilt_1M: {
    nomeTecnico: 'RiskTilt 1M (Preferenza Rischio)',
    what: 'Misura la preferenza tra settori ciclici/growth vs settori difensivi. Pro-rischio = crescita/ciclici outperforming, Difensivo = utilities/staples outperforming.',
    how: 'Confronta performance media settori growth (Technology, Comm, Consumer Disc, Industrials) vs difensivi (Utilities, Staples, Healthcare, Real Estate). Se growth > defensive + 2% → Pro-rischio, viceversa → Difensivo.',
    fonte:
      'Sector rotation è un indicatore di sentiment. Vedi: Fama, E.F., & French, K.R. (1992). The Cross-Section of Expected Stock Returns.',
    esempio: 'Tech +8%, Comm +6.5% vs Utilities +2%, Staples +1.5% → RiskTilt = Pro-rischio',
  },

  SmallCapPressure_1W: {
    nomeTecnico: 'SmallCap Pressure 1W',
    what: 'Differenza performance tra small cap e large cap su base settimanale. Valori negativi indicano small cap in difficoltà, valori positivi indicano small cap outperforming.',
    how: 'SmallCapPressure_1W = performance Small/Micro cap (IWM/IWC) - performance Large cap (SPY/QQQ). Valori negativi indicano flight-to-quality verso large cap.',
    fonte:
      'Size effect è documentato in letteratura. Vedi: Banz, R.W. (1981). The Relationship Between Return and Market Value of Common Stocks.',
    esempio: 'IWM -1.2%, SPY +0.5% → SmallCapPressure = -1.7% (small cap in difficoltà)',
  },

  LeadersMultiTF: {
    nomeTecnico: 'Leadership Multi-Timeframe',
    what: 'Settori con forza/inflow coerente su più timeframe (1D, 1W, 1M). Indica leadership sostenuta e non solo rally temporaneo.',
    how: 'Identifica top 3-4 settori per performance combinata su 1D, 1W, 1M. Solo settori con performance positiva su tutti i timeframe vengono considerati leader.',
    fonte:
      'Sector leadership è un indicatore di trend sostenuto. Vedi: Sector rotation analysis in technical analysis.',
    esempio:
      'Technology, Communication Services, Consumer Discretionary con performance positive su tutti i timeframe → LeadersMultiTF',
  },

  SizeBias: {
    nomeTecnico: 'Size Bias (Preferenza Capitalizzazione)',
    what: 'Pattern di flusso relativo tra mega, large, mid, small, micro cap. Indica se il mercato privilegia titoli grandi o piccoli.',
    how: 'Confronta performance ETF size (SPY=Mega, QQQ=Large, MDY=Mid, IWM=Small, IWC=Micro). Se Mega > Small + 5% → MegaCap, viceversa → SmallCap.',
    fonte: 'Size bias indica sentiment e liquidità. Vedi: Fama-French three-factor model.',
    esempio: 'SPY +5%, IWM -1% → SizeBias = MegaCap (preferenza per titoli grandi)',
  },

  StressMicroCap: {
    nomeTecnico: 'Stress MicroCap',
    what: "Flag che indica se micro cap sono in drawdown e funding risk alto. Se true, micro cap devono essere escluse dall'universo swing.",
    how: 'StressMicroCap = true se micro cap (IWC) performance < -15% o se micro cap < small cap - 10%. Indica rischio funding e illiquidità.',
    fonte:
      'Micro cap sono più sensibili a condizioni di funding. Vedi: Research su small cap liquidity risk.',
    esempio: 'IWC -23% YTD, IWM -5% → StressMicroCap = true (escludere micro cap)',
  },

  FinvizQuery: {
    nomeTecnico: 'Finviz Query (Dynamic Filter)',
    what: 'Query generata automaticamente per Finviz Premium basata su StrategyMode_macro, LeadersMultiTF e SizeBias. Serve a trovare ticker coerenti con il regime corrente.',
    how: 'Se StrategyMode = Momentum → query cerca settori leader, large/mega cap, performance positiva, RSI < 70, beta > 1. Se Pullback → cerca settori difensivi, small/mid cap, performance negativa, RSI < 40.',
    fonte:
      'Filter generation basata su regime analysis. Vedi: Dynamic screening in quantitative trading.',
    esempio:
      'Query: "sector:(Technology OR CommunicationServices) AND marketcap:Large AND performance:MonthUp AND RSI(14)<70"',
  },

  CreditRiskBlock: {
    nomeTecnico: 'Credit Risk Block',
    what: 'Misura dello stress creditizio attraverso spread OAS (Option-Adjusted Spread) investment grade. Valori positivi indicano credito disteso, negativi indicano stress.',
    how: 'CreditRiskBlock = +0.4 se OAS < 0.8% (disteso), -0.4 se OAS > 1.2% (stress). Calcolato usando HYG/TLT spread come proxy se OAS non disponibile.',
    fonte:
      'Credit spreads sono indicatori di stress finanziario. Vedi: Gilchrist, S., & Zakrajšek, E. (2012). Credit Spreads and Business Cycle Fluctuations.',
    esempio: 'IG OAS 0.75% → CreditRiskBlock = +0.4 (credito disteso, nessun stress)',
  },

  FX_Regime: {
    nomeTecnico: 'FX Regime (Dollar Tone)',
    what: 'Regime del dollaro USD. Dollaro forte può ostacolare risk-on globale, dollaro debole supporta risk-on.',
    how: 'Calcola variazione DXY (Dollar Index) 1W. Se > 0.5% → USD moderatamente forte, se < -0.5% → USD debole, altrimenti neutro.',
    fonte:
      'Dollar strength impatta asset globali. Vedi: Dornbusch, R. (1976). Expectations and Exchange Rate Dynamics.',
    esempio: 'DXY +0.3% W/W → FX_Regime = USD moderatamente forte (neutro)',
  },

  LiquidityRegimeScore: {
    nomeTecnico: 'Liquidity Regime Score',
    what: 'Score che misura condizioni di liquidità e funding basato su volatilità, credito e curva tassi. Valori positivi indicano liquidità buona.',
    how: 'LiquidityRegimeScore = volComponent + creditComponent + curveComponent. Considera VIX, credit spreads e curva Treasury (steepening vs flattening).',
    fonte:
      'Liquidity conditions impattano mercati. Vedi: Brunnermeier, M.K. (2009). Deciphering the Liquidity and Credit Crunch.',
    esempio:
      'VIX basso, credito disteso, curva steepening → LiquidityRegimeScore positivo (liquidità buona)',
  },

  RiskWindow: {
    nomeTecnico: 'Risk Window (3-10 giorni)',
    what: "Driver macro monitorati a breve termine che possono impattare il mercato nell'orizzonte 3-10 giorni. Include vol, tassi, commodities, eventi.",
    how: 'RiskWindow monitora: VIX variazione 7d, curva Treasury 2s10s spread, commodities (Oil/Gold), FX, eventi macro imminenti (Fed, CPI, Jobs Report).',
    fonte:
      'Risk window analysis è parte del risk management. Vedi: Risk management frameworks in portfolio management.',
    esempio: 'RiskWindow: Jobs Report (NFP) 08:30 ET, VIX -2.1% 7d, Oil +8% W/W, 2s10s +0.5pp',
  },
};

/**
 * Get explanation for a metric key
 */
export function getExplanation(key) {
  return F1B_EXPLANATIONS[key] || null;
}

/**
 * Convert F1B explanation to metric-popup format
 */
export function toMetricPopupFormat(key, value, label) {
  const exp = getExplanation(key);
  if (!exp) return null;

  return {
    key,
    label: label || exp.nomeTecnico,
    value: value,
    what: exp.what,
    how: exp.how,
    source: exp.fonte,
    esempio: exp.esempio,
  };
}
