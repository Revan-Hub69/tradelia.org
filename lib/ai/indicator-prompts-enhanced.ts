/**
 * AI Prompts Enhanced - Tradelia AI Standard
 * 
 * Sistema completo per spiegazioni indicatori:
 * 1. Metodologia Tradelia AI (spiegazione del dato)
 * 2. Spiegazione Accademica (riferimenti teorici)
 * 3. Traduzione automatica (se dati in inglese)
 * 
 * TUTTO IN ITALIANO
 */

/**
 * PROMPT BASE TRADELIA AI
 * Usato per tutte le spiegazioni indicatori
 */
export const TRADELIA_AI_BASE_SYSTEM_PROMPT = `Sei Tradelia AI, l'assistente intelligente di Tradelia, specializzato nell'analisi di indicatori di mercato finanziario.

METODOLOGIA TRADELIA AI:
1. SPIEGAZIONE DEL DATO (Metodologia Tradelia):
   - Spiega COSA rappresenta il dato/indicatore
   - Spiega COME viene calcolato/ottenuto
   - Spiega PERCHÉ è importante per l'analisi di mercato
   - Usa linguaggio chiaro, professionale ma accessibile
   - Massimo 2-3 frasi

2. SPIEGAZIONE ACCADEMICA:
   - Cita il riferimento accademico (paper, teoria, autori)
   - Spiega cosa dice la teoria accademica sul dato
   - Spiega l'interpretazione accademica del valore corrente
   - Usa linguaggio accademico ma comprensibile
   - Massimo 2-3 frasi

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni non supportate dai dati.
- NO predizioni, NO consigli di investimento.
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli).

TRADUZIONE:
- Se i dati arrivano in inglese (RSS, API, ecc.), TRADUCI TUTTO in italiano.
- Mantieni la precisione tecnica ma usa terminologia italiana corretta.
- Traduci anche nomi di indicatori se necessario (es. "Fear & Greed" → "Indice Paura e Avidità").

STILE:
- Linguaggio semplice, diretto, professionale ma accessibile
- Massimo 4-5 frasi totali (2-3 metodologia + 2-3 accademica)
- Usa emoji solo se appropriato (📊, 📈, 📉)
- Evita gergo tecnico eccessivo`;

/**
 * TEMPLATE GENERICO PER INDICATORI
 */
export function createIndicatorPrompt(
  indicatorName: string,
  indicatorData: any,
  academicReference: {
    paper?: string;
    authors?: string;
    year?: number;
    theory?: string;
  },
  interpretationRanges?: Array<{
    range: string;
    meaning: string;
    color?: string;
  }>
): string {
  // Traduci dati se necessario
  const translatedData = translateDataToItalian(indicatorData);
  
  return `Analizza l'indicatore ${indicatorName} seguendo la Metodologia Tradelia AI.

DATI FORNITI (già tradotti in italiano se necessario):
${JSON.stringify(translatedData, null, 2)}

RIFERIMENTO ACCADEMICO:
${academicReference.paper ? `- Paper: "${academicReference.paper}"` : ''}
${academicReference.authors ? `- Autori: ${academicReference.authors}` : ''}
${academicReference.year ? `- Anno: ${academicReference.year}` : ''}
${academicReference.theory ? `- Teoria: ${academicReference.theory}` : ''}

${interpretationRanges ? `INTERPRETAZIONE ACCADEMICA:
${interpretationRanges.map(r => `- ${r.range}: ${r.meaning}`).join('\n')}` : ''}

FORNISCI:
1. SPIEGAZIONE METODOLOGIA TRADELIA (2-3 frasi):
   - Cosa rappresenta questo indicatore
   - Come viene calcolato/ottenuto
   - Perché è importante

2. SPIEGAZIONE ACCADEMICA (2-3 frasi):
   - Cosa dice la teoria accademica
   - Interpretazione del valore corrente secondo il riferimento accademico
   - Implicazioni (NO predizioni, solo lettura)

TUTTO IN ITALIANO. Se i dati sono in inglese, traduci prima di analizzare.`;
}

/**
 * Traduce dati da inglese a italiano se necessario
 */
function translateDataToItalian(data: any): any {
  // Se è una stringa, prova a tradurre
  if (typeof data === 'string') {
    // Traduzioni comuni
    const translations: Record<string, string> = {
      'Fear & Greed': 'Paura e Avidità',
      'Fear': 'Paura',
      'Greed': 'Avidità',
      'Extreme Fear': 'Paura Estrema',
      'Extreme Greed': 'Avidità Estrema',
      'Neutral': 'Neutrale',
      'Bullish': 'Rialzista',
      'Bearish': 'Ribassista',
      'High Volatility': 'Alta Volatilità',
      'Low Volatility': 'Bassa Volatilità',
      'Normal Volatility': 'Volatilità Normale',
      'Elevated Volatility': 'Volatilità Elevata',
    };
    
    return translations[data] || data;
  }
  
  // Se è un oggetto, traduci ricorsivamente
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(translateDataToItalian);
    }
    const translated: any = {};
    for (const [key, value] of Object.entries(data)) {
      translated[key] = translateDataToItalian(value);
    }
    return translated;
  }
  
  return data;
}

/**
 * VIX ENHANCED PROMPT
 */
export const VIX_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const VIX_ENHANCED_USER_PROMPT_TEMPLATE = (
  value: number,
  change: number,
  changePercent: number
) => createIndicatorPrompt(
  'VIX (Volatility Index)',
  {
    value: value.toFixed(2),
    change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}`,
    changePercent: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
  },
  {
    paper: 'Derivatives on Market Volatility: Hedging Tools Long Overdue',
    authors: 'Whaley',
    year: 1993,
    theory: 'Volatility Index Theory - Misura le aspettative di volatilità implicita del mercato per i prossimi 30 giorni, calcolato dalle opzioni S&P 500. Il VIX è considerato il "fear index" del mercato.',
  },
  [
    { range: '< 12', meaning: 'Bassa Volatilità - Mercato calmo, trend rialzista probabile', color: 'green' },
    { range: '12-20', meaning: 'Volatilità Normale - Mercato in equilibrio', color: 'blue' },
    { range: '20-30', meaning: 'Volatilità Elevata - Aumento della paura, possibile instabilità', color: 'yellow' },
    { range: '> 30', meaning: 'Alta Volatilità - Paura estrema, storicamente zone di acquisto potenziali', color: 'red' },
  ]
);

/**
 * YIELD CURVE ENHANCED PROMPT
 */
export const YIELD_CURVE_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const YIELD_CURVE_ENHANCED_USER_PROMPT_TEMPLATE = (
  yields: Record<string, number>,
  spread: { '10Y-2Y': number; '10Y-3M': number; '2Y-3M': number },
  inversion: boolean,
  recessionRisk: 'low' | 'medium' | 'high'
) => createIndicatorPrompt(
  'Yield Curve (Curva dei Rendimenti)',
  {
    '10Y': `${yields['10Y']?.toFixed(2)}%`,
    '2Y': `${yields['2Y']?.toFixed(2)}%`,
    '3M': `${yields['3M']?.toFixed(2)}%`,
    spread: `${spread['10Y-2Y'].toFixed(2)}%`,
    inversion: inversion ? 'Sì' : 'No',
    recessionRisk: recessionRisk === 'high' ? 'Alto' : recessionRisk === 'medium' ? 'Medio' : 'Basso',
  },
  {
    paper: 'Predicting U.S. Recessions: Financial Variables as Leading Indicators',
    authors: 'Estrella & Mishkin',
    year: 1998,
    theory: 'Yield Curve Inversion Theory - L\'inversione della yield curve (10Y < 2Y) è un predittore accademico riconosciuto di recessioni, storicamente precede recessioni di 6-18 mesi.',
  },
  [
    { range: 'Spread > 0.5%', meaning: 'Curva Normale - Crescita economica sana', color: 'green' },
    { range: 'Spread 0-0.5%', meaning: 'Curva Appiattita - Attenzione, possibile inversione', color: 'yellow' },
    { range: 'Spread < 0%', meaning: 'Curva Invertita - Warning recessione (6-18 mesi)', color: 'red' },
  ]
);

/**
 * STOCK INDEXES ENHANCED PROMPT
 */
export const STOCK_INDEXES_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const STOCK_INDEXES_ENHANCED_USER_PROMPT_TEMPLATE = (
  indexes: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }>
) => createIndicatorPrompt(
  'Stock Market Indexes (Indici Azionari)',
  {
    indexes: indexes.map(idx => ({
      nome: idx.name,
      prezzo: idx.price.toFixed(2),
      variazione: `${idx.change >= 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%`,
    })),
  },
  {
    theory: 'Modern Portfolio Theory - Gli indici azionari principali (S&P 500, Dow, NASDAQ) riflettono la performance complessiva del mercato azionario USA. S&P 500 è il benchmark principale.',
  },
  [
    { range: 'S&P 500', meaning: 'Indice più rappresentativo (500 aziende large-cap). Benchmark principale.' },
    { range: 'Dow Jones', meaning: 'Indice storico (30 blue-chip). Più concentrato, meno rappresentativo ma molto seguito.' },
    { range: 'NASDAQ', meaning: 'Indice tech-heavy. Riflette performance settore tecnologico e crescita.' },
  ]
);

/**
 * BITCOIN DOMINANCE ENHANCED PROMPT
 */
export const BITCOIN_DOMINANCE_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const BITCOIN_DOMINANCE_ENHANCED_USER_PROMPT_TEMPLATE = (
  dominance: number,
  bitcoinMarketCap: number,
  totalMarketCap: number
) => createIndicatorPrompt(
  'Bitcoin Dominance (Dominanza Bitcoin)',
  {
    dominance: `${dominance.toFixed(2)}%`,
    bitcoinMarketCap: `$${(bitcoinMarketCap / 1e12).toFixed(2)}T`,
    totalMarketCap: `$${(totalMarketCap / 1e12).toFixed(2)}T`,
  },
  {
    theory: 'Market Cap Analysis - La dominanza di Bitcoin misura la percentuale della capitalizzazione totale del mercato crypto rappresentata da Bitcoin. Indica la forza relativa di BTC vs altcoin.',
  },
  [
    { range: '> 60%', meaning: 'Bitcoin forte, altcoin deboli - Mercato conservativo, risk-off', color: 'blue' },
    { range: '50-60%', meaning: 'Mercato bilanciato - Equilibrio tra BTC e altcoin', color: 'green' },
    { range: '< 50%', meaning: 'Altcoin forti, Bitcoin debole - Mercato speculativo, risk-on', color: 'yellow' },
  ]
);

/**
 * FEAR & GREED ENHANCED PROMPT
 */
export const FEAR_GREED_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const FEAR_GREED_ENHANCED_USER_PROMPT_TEMPLATE = (
  value: number,
  classification: string
) => createIndicatorPrompt(
  'Fear & Greed Index (Indice Paura e Avidità)',
  {
    value: value.toString(),
    classificazione: translateDataToItalian(classification),
  },
  {
    paper: 'Investor Sentiment and the Cross-Section of Stock Returns',
    authors: 'Baker & Wurgler',
    year: 2007,
    theory: 'Behavioral Finance - La sentiment degli investitori predice i rendimenti futuri del mercato. Estremi di paura/avidità indicano possibili reversal.',
  },
  [
    { range: '0-24', meaning: 'Paura Estrema - Possibile opportunità di acquisto', color: 'green' },
    { range: '25-49', meaning: 'Paura - Sentiment negativo', color: 'yellow' },
    { range: '50', meaning: 'Neutrale - Sentiment bilanciato', color: 'blue' },
    { range: '51-75', meaning: 'Avidità - Sentiment positivo', color: 'yellow' },
    { range: '76-100', meaning: 'Avidità Estrema - Possibile opportunità di vendita', color: 'red' },
  ]
);

/**
 * FOREX ENHANCED PROMPT
 */
export const FOREX_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const FOREX_ENHANCED_USER_PROMPT_TEMPLATE = (
  pairs: Array<{
    symbol: string;
    name: string;
    rate: number;
    change: number;
    changePercent: number;
  }>
) => createIndicatorPrompt(
  'Forex Major Pairs (Coppie Forex Principali)',
  {
    pairs: pairs.map(p => ({
      coppia: p.name,
      tasso: p.rate.toFixed(4),
      variazione: `${p.change >= 0 ? '+' : ''}${p.changePercent.toFixed(2)}%`,
    })),
  },
  {
    paper: 'Empirical Exchange Rate Models of the Seventies',
    authors: 'Meese & Rogoff',
    year: 1983,
    theory: 'Foreign Exchange Theory - I tassi di cambio riflettono le politiche monetarie delle banche centrali e le condizioni economiche relative tra paesi.',
  },
  [
    { range: 'EUR/USD', meaning: 'Coppia più scambiata al mondo. Rialzo = Euro forte, USD debole' },
    { range: 'GBP/USD', meaning: 'Sterlina vs Dollaro. Rialzo = GBP forte, USD debole' },
    { range: 'USD/JPY', meaning: 'Dollaro vs Yen. Rialzo = USD forte, JPY debole' },
    { range: 'USD/CHF', meaning: 'Dollaro vs Franco Svizzero. Rialzo = USD forte, CHF debole' },
  ]
);

/**
 * COMMODITIES ENHANCED PROMPT
 */
export const COMMODITIES_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const COMMODITIES_ENHANCED_USER_PROMPT_TEMPLATE = (
  commodities: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    unit: string;
  }>
) => createIndicatorPrompt(
  'Commodities (Materie Prime)',
  {
    commodities: commodities.map(c => ({
      nome: c.name,
      prezzo: `${c.price.toFixed(2)} ${c.unit}`,
      variazione: `${c.change >= 0 ? '+' : ''}${c.changePercent.toFixed(2)}%`,
    })),
  },
  {
    paper: 'Understanding Crude Oil Prices',
    authors: 'Hamilton',
    year: 2009,
    theory: 'Commodity Futures Theory - I prezzi delle materie prime sono predittori importanti delle recessioni economiche e indicatori di inflazione.',
  },
  [
    { range: 'Gold', meaning: 'Oro - Safe haven asset, hedge contro inflazione. Rialzo = incertezza economica' },
    { range: 'Oil', meaning: 'Petrolio - Indicatore crescita economica globale. Rialzo = domanda forte' },
    { range: 'Silver', meaning: 'Argento - Correlato con oro ma più volatile. Rialzo = sentiment positivo' },
  ]
);

/**
 * CREDIT SPREADS ENHANCED PROMPT
 */
export const CREDIT_SPREADS_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const CREDIT_SPREADS_ENHANCED_USER_PROMPT_TEMPLATE = (
  baa10y: number,
  aaa10y: number,
  riskLevel: 'low' | 'medium' | 'high',
  trend: 'widening' | 'narrowing' | 'stable'
) => createIndicatorPrompt(
  'Credit Spreads (Spread Creditizi)',
  {
    baa10y: `${baa10y.toFixed(2)}%`,
    aaa10y: `${aaa10y.toFixed(2)}%`,
    riskLevel: riskLevel === 'high' ? 'Alto' : riskLevel === 'medium' ? 'Medio' : 'Basso',
    trend: trend === 'widening' ? 'Allargamento' : trend === 'narrowing' ? 'Restringimento' : 'Stabile',
  },
  {
    paper: 'Credit Spreads and Business Cycle Fluctuations',
    authors: 'Gilchrist & Zakrajšek',
    year: 2012,
    theory: 'Credit Risk Theory - I credit spreads predicono recessioni economiche con 6-12 mesi di anticipo. Spread alto = stress creditizio.',
  },
  [
    { range: '< 2.0%', meaning: 'Spread basso - Mercato sano, crescita economica', color: 'green' },
    { range: '2.0-3.0%', meaning: 'Spread moderato - Mercato normale', color: 'blue' },
    { range: '> 3.0%', meaning: 'Spread alto - Stress creditizio, rischio recessione', color: 'red' },
  ]
);

/**
 * PUT/CALL RATIO ENHANCED PROMPT
 */
export const PUT_CALL_RATIO_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const PUT_CALL_RATIO_ENHANCED_USER_PROMPT_TEMPLATE = (
  totalPutCallRatio: number,
  equityPutCallRatio: number,
  sentiment: 'bullish' | 'bearish' | 'neutral'
) => createIndicatorPrompt(
  'Put/Call Ratio (Rapporto Put/Call)',
  {
    totalPutCallRatio: totalPutCallRatio.toFixed(2),
    equityPutCallRatio: equityPutCallRatio.toFixed(2),
    sentiment: sentiment === 'bullish' ? 'Rialzista' : sentiment === 'bearish' ? 'Ribassista' : 'Neutrale',
  },
  {
    paper: 'The Information in Option Volume for Future Stock Prices',
    authors: 'Pan & Poteshman',
    year: 2006,
    theory: 'Options Sentiment Theory - Il volume di opzioni Put/Call contiene informazioni predittive sui movimenti futuri dei prezzi. Estremi indicano possibili reversal.',
  },
  [
    { range: '> 1.2', meaning: 'Ratio molto alto - Sentiment estremamente bearish, possibile bottom', color: 'green' },
    { range: '> 1.0', meaning: 'Ratio alto - Sentiment bearish, più Put che Call', color: 'yellow' },
    { range: '0.7-1.0', meaning: 'Ratio normale - Sentiment bilanciato', color: 'blue' },
    { range: '< 0.7', meaning: 'Ratio basso - Sentiment bullish, più Call che Put', color: 'yellow' },
    { range: '< 0.5', meaning: 'Ratio molto basso - Sentiment estremamente bullish, possibile top', color: 'red' },
  ]
);

/**
 * VIX TERM STRUCTURE ENHANCED PROMPT
 */
export const VIX_TERM_STRUCTURE_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const VIX_TERM_STRUCTURE_ENHANCED_USER_PROMPT_TEMPLATE = (
  currentVIX: number,
  contangoPercent: number,
  termStructure: Array<{ days: number; vix: number; type: 'contango' | 'backwardation' }>
) => createIndicatorPrompt(
  'VIX Term Structure (Struttura Temporale VIX)',
  {
    currentVIX: currentVIX.toFixed(2),
    contangoPercent: `${contangoPercent >= 0 ? '+' : ''}${contangoPercent.toFixed(2)}%`,
    structure: termStructure.map(t => ({
      giorni: t.days,
      vix: t.vix.toFixed(2),
      tipo: t.type === 'contango' ? 'Contango' : 'Backwardation',
    })),
  },
  {
    paper: 'The Investor Fear Gauge',
    authors: 'Whaley',
    year: 2000,
    theory: 'VIX Term Structure Theory - La struttura temporale del VIX predice correzioni di mercato quando si inverte (backwardation). Contango persistente indica mercato rialzista.',
  },
  [
    { range: 'Contango > 5%', meaning: 'Contango forte - Mercato calmo, aspettative volatilità futura', color: 'green' },
    { range: 'Contango 0-5%', meaning: 'Contango normale - Struttura normale', color: 'blue' },
    { range: 'Backwardation 0-5%', meaning: 'Backwardation leggera - Attenzione, possibile stress', color: 'yellow' },
    { range: 'Backwardation > 5%', meaning: 'Backwardation forte - Mercato stressato, volatilità immediata alta', color: 'red' },
  ]
);

/**
 * CRYPTO MARKET CAP ENHANCED PROMPT
 */
export const CRYPTO_MARKET_CAP_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const CRYPTO_MARKET_CAP_ENHANCED_USER_PROMPT_TEMPLATE = (
  totalMarketCap: number,
  totalVolume24h: number,
  bitcoinDominance: number
) => createIndicatorPrompt(
  'Crypto Market Cap (Capitalizzazione Mercato Crypto)',
  {
    totalMarketCap: `$${(totalMarketCap / 1e12).toFixed(2)}T`,
    totalVolume24h: `$${(totalVolume24h / 1e9).toFixed(2)}B`,
    bitcoinDominance: `${bitcoinDominance.toFixed(2)}%`,
  },
  {
    theory: 'Market Cap Analysis - La capitalizzazione totale del mercato crypto riflette l\'interesse complessivo e il sentiment del mercato. Trend crescente = afflusso di capitali.',
  },
  [
    { range: 'Trend crescente', meaning: 'Afflusso di capitali, interesse crescente, trend rialzista', color: 'green' },
    { range: 'Trend decrescente', meaning: 'Deflusso di capitali, interesse calante, trend ribassista', color: 'red' },
    { range: 'Stabile', meaning: 'Consolidamento, mercato in equilibrio', color: 'blue' },
  ]
);

/**
 * BOND YIELDS ENHANCED PROMPT
 */
export const BOND_YIELDS_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const BOND_YIELDS_ENHANCED_USER_PROMPT_TEMPLATE = (
  yield10Y: number,
  yield2Y: number,
  spread: number
) => createIndicatorPrompt(
  'Bond Yields (Rendimenti Obbligazionari)',
  {
    '10Y': `${yield10Y.toFixed(2)}%`,
    '2Y': `${yield2Y.toFixed(2)}%`,
    spread: `${spread.toFixed(2)}%`,
  },
  {
    paper: 'The Real Term Structure and Consumption Growth',
    authors: 'Harvey',
    year: 1988,
    theory: 'Term Structure Theory - La yield curve è il miglior predittore di crescita economica futura. Spread positivo = crescita attesa, spread negativo = warning recessione.',
  },
  [
    { range: 'Spread > 0.5%', meaning: 'Curva normale - Crescita economica sana', color: 'green' },
    { range: 'Spread 0-0.5%', meaning: 'Curva appiattita - Attenzione, possibile inversione', color: 'yellow' },
    { range: 'Spread < 0%', meaning: 'Curva invertita - Warning recessione (6-18 mesi)', color: 'red' },
  ]
);

/**
 * ECONOMIC INDICATORS ENHANCED PROMPT
 */
export const ECONOMIC_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const ECONOMIC_ENHANCED_USER_PROMPT_TEMPLATE = (
  indicators: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    change?: number;
    changePercent?: number;
  }>
) => createIndicatorPrompt(
  'Economic Indicators (Indicatori Economici)',
  {
    indicators: indicators.map(ind => ({
      nome: ind.name,
      valore: `${ind.value.toFixed(2)} ${ind.unit}`,
      variazione: ind.changePercent ? `${ind.changePercent >= 0 ? '+' : ''}${ind.changePercent.toFixed(2)}%` : 'N/A',
    })),
  },
  {
    theory: 'Macroeconomic Indicators Theory - Gli indicatori economici (GDP, CPI, Unemployment, Fed Rate) riflettono la salute dell\'economia e guidano le politiche monetarie.',
  },
  [
    { range: 'GDP', meaning: 'Prodotto Interno Lordo - Misura crescita economica. Positivo = economia in crescita' },
    { range: 'CPI', meaning: 'Indice Prezzi al Consumo - Misura inflazione. Alto = inflazione elevata' },
    { range: 'Unemployment', meaning: 'Tasso di Disoccupazione - Basso = economia forte' },
    { range: 'Fed Rate', meaning: 'Tasso di Interesse Fed - Alto = politica monetaria restrittiva' },
  ]
);

/**
 * WHALE ANALYSIS ENHANCED PROMPT
 */
export const WHALE_ANALYSIS_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const WHALE_ANALYSIS_ENHANCED_USER_PROMPT_TEMPLATE = (
  transactions: Array<{ symbol: string; amount: number; value: number }>,
  whaleRatio: number
) => createIndicatorPrompt(
  'Whale Analysis (Analisi Whale)',
  {
    transazioni: transactions.length,
    whaleRatio: whaleRatio.toFixed(2),
    valoreTotale: `$${(transactions.reduce((sum, t) => sum + t.value, 0) / 1e6).toFixed(2)}M`,
  },
  {
    paper: 'Continuous Auctions and Insider Trading',
    authors: 'Kyle',
    year: 1985,
    theory: 'Market Microstructure Theory - I grandi trader (whale) influenzano significativamente i prezzi di mercato. Monitorare l\'attività whale aiuta a identificare movimenti di prezzo potenziali.',
  },
  [
    { range: 'Ratio > 1', meaning: 'Whale attivi - Possibile movimento di prezzo significativo', color: 'yellow' },
    { range: 'Ratio < 1', meaning: 'Whale inattivi - Mercato calmo', color: 'blue' },
  ]
);

/**
 * EXCHANGE FLOWS ENHANCED PROMPT
 */
export const EXCHANGE_FLOWS_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const EXCHANGE_FLOWS_ENHANCED_USER_PROMPT_TEMPLATE = (
  deposits: number,
  withdrawals: number,
  netFlow: number
) => createIndicatorPrompt(
  'Exchange Flows (Flussi Exchange)',
  {
    depositi: `$${(deposits / 1e6).toFixed(2)}M`,
    prelievi: `$${(withdrawals / 1e6).toFixed(2)}M`,
    netFlow: `$${(netFlow / 1e6).toFixed(2)}M`,
  },
  {
    paper: 'Bid, Ask and Transaction Prices',
    authors: 'Glosten & Milgrom',
    year: 1985,
    theory: 'Market Microstructure Theory - I flussi di ordini rivelano informazioni private sul valore degli asset. Net flow positivo = selling pressure, negativo = accumulation.',
  },
  [
    { range: 'Net Flow > 0', meaning: 'Più depositi che prelievi - Possibile selling pressure', color: 'red' },
    { range: 'Net Flow < 0', meaning: 'Più prelievi che depositi - Possibile holding/accumulation', color: 'green' },
    { range: 'Net Flow ≈ 0', meaning: 'Flussi bilanciati - Mercato in equilibrio', color: 'blue' },
  ]
);

/**
 * TOP MOVERS ENHANCED PROMPT
 */
export const TOP_MOVERS_ENHANCED_SYSTEM_PROMPT = TRADELIA_AI_BASE_SYSTEM_PROMPT;

export const TOP_MOVERS_ENHANCED_USER_PROMPT_TEMPLATE = (
  movers: Array<{ symbol: string; name: string; changePercent: number }>
) => createIndicatorPrompt(
  'Top Movers (Top Movimenti)',
  {
    movers: movers.slice(0, 10).map(m => ({
      asset: m.name,
      variazione: `${m.changePercent >= 0 ? '+' : ''}${m.changePercent.toFixed(2)}%`,
    })),
  },
  {
    paper: 'Returns to Buying Winners and Selling Losers',
    authors: 'Jegadeesh & Titman',
    year: 1993,
    theory: 'Momentum Theory - I top movers mostrano momentum che persiste nel breve termine. Asset in forte rally possono continuare, asset in forte correzione possono continuare a scendere.',
  },
  [
    { range: 'Variazione > +20%', meaning: 'Forte rally - Possibile momentum continuo, attenzione a overbought', color: 'yellow' },
    { range: 'Variazione < -20%', meaning: 'Forte correzione - Possibile rischio, attenzione', color: 'red' },
  ]
);

/**
 * GENERIC INDICATOR PROMPT (per indicatori senza prompt specifico)
 */
export function createGenericIndicatorPrompt(
  indicatorName: string,
  indicatorData: any,
  academicReference?: {
    paper?: string;
    authors?: string;
    year?: number;
    theory?: string;
  }
): string {
  return `Analizza l'indicatore ${indicatorName} seguendo la Metodologia Tradelia AI.

DATI FORNITI (già tradotti in italiano se necessario):
${JSON.stringify(translateDataToItalian(indicatorData), null, 2)}

${academicReference ? `RIFERIMENTO ACCADEMICO:
${academicReference.paper ? `- Paper: "${academicReference.paper}"` : ''}
${academicReference.authors ? `- Autori: ${academicReference.authors}` : ''}
${academicReference.year ? `- Anno: ${academicReference.year}` : ''}
${academicReference.theory ? `- Teoria: ${academicReference.theory}` : ''}` : ''}

FORNISCI:
1. SPIEGAZIONE METODOLOGIA TRADELIA (2-3 frasi):
   - Cosa rappresenta questo indicatore
   - Come viene calcolato/ottenuto
   - Perché è importante per l'analisi di mercato

2. SPIEGAZIONE ACCADEMICA (2-3 frasi):
   ${academicReference ? '- Cosa dice la teoria accademica\n   - Interpretazione del valore corrente\n   - Implicazioni (NO predizioni, solo lettura)' : '- Interpretazione del valore corrente basata su principi accademici\n   - Implicazioni (NO predizioni, solo lettura)'}

TUTTO IN ITALIANO. Se i dati sono in inglese, traduci prima di analizzare.`;
}

/**
 * HELPER: Chiama Groq AI con prompt enhanced
 */
export async function callGroqAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 400
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "Analisi AI non disponibile. Configura GROQ_API_KEY.";
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return "Errore nella generazione della lettura AI.";
    }
    
    // Assicurati che la risposta sia in italiano
    return content;
  } catch (error: any) {
    if (error?.message?.includes("401") || error?.message?.includes("Unauthorized")) {
      return "Analisi AI non disponibile: Chiave API non valida.";
    }
    if (error?.message?.includes("429") || error?.message?.includes("rate limit")) {
      return "Analisi AI temporaneamente non disponibile: Limite di rate superato.";
    }
    return "Errore nella generazione della lettura AI. Riprova più tardi.";
  }
}
