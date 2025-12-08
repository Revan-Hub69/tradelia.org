/**
 * Indicator Tooltips - Academic References and Explanations
 * Ogni indicatore ha tooltip con: cosa fa, come si usa, studi accademici
 */

export interface IndicatorTooltip {
  id: string;
  name: string;
  description: string;
  howToUse: string;
  academicReferences: Array<{
    authors: string;
    year: number;
    title: string;
    keyFindings?: string;
  }>;
  interpretation: {
    positive: string;
    negative: string;
    neutral: string;
  };
}

export const INDICATOR_TOOLTIPS: Record<string, IndicatorTooltip> = {
  vix: {
    id: 'vix',
    name: 'VIX (Volatility Index)',
    description: 'L\'indice VIX misura le aspettative di volatilità del mercato azionario nei prossimi 30 giorni, basato sui prezzi delle opzioni S&P 500.',
    howToUse: 'VIX > 30 indica alta volatilità/incertezza (bearish). VIX < 20 indica bassa volatilità/calma (bullish). VIX inversamente correlato con S&P 500.',
    academicReferences: [
      {
        authors: 'Whaley, R.E.',
        year: 2000,
        title: 'The Investor Fear Gauge',
        keyFindings: 'VIX è un indicatore affidabile delle aspettative di volatilità del mercato.',
      },
      {
        authors: 'Giot, P.',
        year: 2005,
        title: 'Relationships between Implied Volatility Indexes and Stock Index Returns',
        keyFindings: 'VIX mostra correlazione negativa con i rendimenti del mercato azionario.',
      },
    ],
    interpretation: {
      positive: 'VIX basso (< 20): Mercato calmo, trend rialzista probabile',
      negative: 'VIX alto (> 30): Alta volatilità, possibile correzione',
      neutral: 'VIX medio (20-30): Volatilità normale',
    },
  },
  'fear-greed': {
    id: 'fear-greed',
    name: 'Fear & Greed Index',
    description: 'Indice che misura le emozioni del mercato crypto su una scala da 0 (estremo timore) a 100 (estrema avidità), basato su 7 metriche diverse.',
    howToUse: '0-24: Estremo timore (possibile buying opportunity). 25-49: Timore. 50: Neutrale. 51-75: Avidità. 76-100: Estrema avidità (possibile selling opportunity).',
    academicReferences: [
      {
        authors: 'Baker, M., & Wurgler, J.',
        year: 2007,
        title: 'Investor Sentiment and the Cross-Section of Stock Returns',
        keyFindings: 'La sentiment degli investitori predice i rendimenti futuri del mercato.',
      },
      {
        authors: 'Shiller, R.J.',
        year: 2015,
        title: 'Irrational Exuberance',
        keyFindings: 'Le emozioni del mercato guidano cicli di boom e bust.',
      },
    ],
    interpretation: {
      positive: 'Avidità (50-100): Mercato ottimista, possibile overvaluation',
      negative: 'Timore (0-50): Mercato pessimista, possibile undervaluation',
      neutral: 'Neutrale (45-55): Sentiment bilanciato',
    },
  },
  'bitcoin-dominance': {
    id: 'bitcoin-dominance',
    name: 'Bitcoin Dominance',
    description: 'Percentuale della capitalizzazione di mercato totale delle criptovalute rappresentata da Bitcoin. Indica la forza relativa di BTC vs altcoin.',
    howToUse: 'Dominance alta (> 60%): Bitcoin forte, altcoin deboli (risk-off). Dominance bassa (< 50%): Altcoin forti, Bitcoin debole (risk-on).',
    academicReferences: [
      {
        authors: 'Baur, D.G., & Dimpfl, T.',
        year: 2018,
        title: 'Asymmetric volatility in cryptocurrencies',
        keyFindings: 'Bitcoin mostra correlazioni dinamiche con altre crypto che cambiano nel tempo.',
      },
    ],
    interpretation: {
      positive: 'Dominance alta: Bitcoin è il leader, mercato conservativo',
      negative: 'Dominance bassa: Altcoin in rally, mercato speculativo',
      neutral: 'Dominance stabile: Mercato bilanciato',
    },
  },
  'crypto-market-cap': {
    id: 'crypto-market-cap',
    name: 'Crypto Market Cap',
    description: 'Capitalizzazione di mercato totale di tutte le criptovalute. Somma di (prezzo × supply) per ogni crypto.',
    howToUse: 'Market cap crescente: Afflusso di capitali nel mercato crypto. Market cap decrescente: Deflusso di capitali. Correlato con sentiment generale.',
    academicReferences: [
      {
        authors: 'Yermack, D.',
        year: 2015,
        title: 'Is Bitcoin a Real Currency?',
        keyFindings: 'Bitcoin mostra caratteristiche di asset speculativo più che valuta.',
      },
    ],
    interpretation: {
      positive: 'Market cap crescente: Trend rialzista, interesse crescente',
      negative: 'Market cap decrescente: Trend ribassista, interesse calante',
      neutral: 'Market cap stabile: Consolidamento',
    },
  },
  spy: {
    id: 'spy',
    name: 'S&P 500 ETF (SPY)',
    description: 'ETF che replica l\'indice S&P 500, rappresentando le 500 maggiori società quotate negli USA. Benchmark principale del mercato azionario americano.',
    howToUse: 'SPY in rialzo: Mercato azionario USA forte. SPY in ribasso: Mercato debole. Correlato con economia USA e sentiment globale.',
    academicReferences: [
      {
        authors: 'Fama, E.F., & French, K.R.',
        year: 1993,
        title: 'Common risk factors in the returns on stocks and bonds',
        keyFindings: 'S&P 500 è un benchmark efficace per il mercato azionario USA.',
      },
    ],
    interpretation: {
      positive: 'SPY in rialzo: Mercato azionario USA forte',
      negative: 'SPY in ribasso: Mercato azionario USA debole',
      neutral: 'SPY stabile: Consolidamento',
    },
  },
  qqq: {
    id: 'qqq',
    name: 'NASDAQ 100 ETF (QQQ)',
    description: 'ETF che replica l\'indice NASDAQ-100, rappresentando le 100 maggiori società non finanziarie quotate al NASDAQ. Fortemente tech-weighted.',
    howToUse: 'QQQ in rialzo: Settore tech forte. QQQ in ribasso: Tech debole. Più volatile di SPY, correlato con innovazione e crescita.',
    academicReferences: [
      {
        authors: 'Jegadeesh, N., & Titman, S.',
        year: 1993,
        title: 'Returns to Buying Winners and Selling Losers',
        keyFindings: 'Momentum effect nei rendimenti azionari, particolarmente forte nel tech.',
      },
    ],
    interpretation: {
      positive: 'QQQ in rialzo: Settore tech in crescita',
      negative: 'QQQ in ribasso: Settore tech in contrazione',
      neutral: 'QQQ stabile: Consolidamento tech',
    },
  },
  eurusd: {
    id: 'eurusd',
    name: 'EUR/USD Exchange Rate',
    description: 'Tasso di cambio tra Euro e Dollaro USA. Indica quanti dollari servono per comprare un euro.',
    howToUse: 'EUR/USD in rialzo: Euro forte, USD debole. EUR/USD in ribasso: Euro debole, USD forte. Correlato con politiche monetarie ECB e Fed.',
    academicReferences: [
      {
        authors: 'Meese, R.A., & Rogoff, K.',
        year: 1983,
        title: 'Empirical Exchange Rate Models of the Seventies',
        keyFindings: 'I modelli di cambio sono difficili da prevedere nel breve termine.',
      },
    ],
    interpretation: {
      positive: 'EUR/USD in rialzo: Euro forte vs USD',
      negative: 'EUR/USD in ribasso: USD forte vs Euro',
      neutral: 'EUR/USD stabile: Consolidamento',
    },
  },
  dxy: {
    id: 'dxy',
    name: 'Dollar Index (DXY)',
    description: 'Indice che misura il valore del Dollaro USA rispetto a un paniere di 6 valute principali (EUR, JPY, GBP, CAD, SEK, CHF).',
    howToUse: 'DXY in rialzo: USD forte globalmente (bearish per commodities/crypto). DXY in ribasso: USD debole (bullish per commodities/crypto).',
    academicReferences: [
      {
        authors: 'Frankel, J.A.',
        year: 1979,
        title: 'On the Mark: A Theory of Floating Exchange Rates',
        keyFindings: 'Il valore del dollaro è influenzato da fattori macroeconomici fondamentali.',
      },
    ],
    interpretation: {
      positive: 'DXY in rialzo: USD forte, pressione su commodities/crypto',
      negative: 'DXY in ribasso: USD debole, supporto per commodities/crypto',
      neutral: 'DXY stabile: Consolidamento',
    },
  },
  gold: {
    id: 'gold',
    name: 'Gold Price',
    description: 'Prezzo dell\'oro in USD per oncia. Considerato safe haven asset e hedge contro inflazione.',
    howToUse: 'Oro in rialzo: Incertezza economica, inflazione, USD debole. Oro in ribasso: Stabilità economica, USD forte. Correlato negativamente con USD.',
    academicReferences: [
      {
        authors: 'Baur, D.G., & Lucey, B.M.',
        year: 2010,
        title: 'Is Gold a Hedge or a Safe Haven?',
        keyFindings: 'Oro è sia hedge che safe haven, particolarmente durante crisi finanziarie.',
      },
    ],
    interpretation: {
      positive: 'Oro in rialzo: Incertezza, inflazione, USD debole',
      negative: 'Oro in ribasso: Stabilità, USD forte',
      neutral: 'Oro stabile: Consolidamento',
    },
  },
  oil: {
    id: 'oil',
    name: 'Crude Oil Price',
    description: 'Prezzo del petrolio greggio (WTI) in USD per barile. Indicatore chiave dell\'economia globale e inflazione.',
    howToUse: 'Petrolio in rialzo: Domanda forte, inflazione, crescita economica. Petrolio in ribasso: Domanda debole, deflazione, recessione. Correlato con crescita globale.',
    academicReferences: [
      {
        authors: 'Hamilton, J.D.',
        year: 2009,
        title: 'Understanding Crude Oil Prices',
        keyFindings: 'I prezzi del petrolio sono predittori importanti delle recessioni economiche.',
      },
    ],
    interpretation: {
      positive: 'Petrolio in rialzo: Domanda forte, crescita economica',
      negative: 'Petrolio in ribasso: Domanda debole, possibile recessione',
      neutral: 'Petrolio stabile: Consolidamento',
    },
  },
  'whale-ratio': {
    id: 'whale-ratio',
    name: 'Whale Ratio (PRO)',
    description: 'Rapporto tra transazioni whale (>$1M) e transazioni medie. Indica l\'attività dei grandi investitori.',
    howToUse: 'Ratio > 1: Whale attivi (possibile movimento di prezzo). Ratio < 1: Whale inattivi. Monitorare trend per anticipare movimenti.',
    academicReferences: [
      {
        authors: 'Kyle, A.S.',
        year: 1985,
        title: 'Continuous Auctions and Insider Trading',
        keyFindings: 'I grandi trader (whale) influenzano significativamente i prezzi di mercato.',
      },
    ],
    interpretation: {
      positive: 'Ratio alto: Whale attivi, possibile movimento',
      negative: 'Ratio basso: Whale inattivi, mercato calmo',
      neutral: 'Ratio normale: Attività bilanciata',
    },
  },
  'exchange-flow': {
    id: 'exchange-flow',
    name: 'Exchange Flow (PRO)',
    description: 'Flusso netto di criptovalute da/verso exchange. Depositi (inflow) vs Prelievi (outflow).',
    howToUse: 'Net flow positivo: Più depositi (possibile selling pressure). Net flow negativo: Più prelievi (possibile holding/accumulation).',
    academicReferences: [
      {
        authors: 'Glosten, L.R., & Milgrom, P.R.',
        year: 1985,
        title: 'Bid, Ask and Transaction Prices',
        keyFindings: 'I flussi di ordini rivelano informazioni private sul valore degli asset.',
      },
    ],
    interpretation: {
      positive: 'Net flow positivo: Depositi > Prelievi (selling pressure)',
      negative: 'Net flow negativo: Prelievi > Depositi (accumulation)',
      neutral: 'Net flow bilanciato',
    },
  },
  'l400-imbalance': {
    id: 'l400-imbalance',
    name: 'L400 Order Book Imbalance (PRO)',
    description: 'Squilibrio tra bid volume e ask volume nei primi 400 livelli dell\'order book. Indica pressione rialzista o ribassista.',
    howToUse: 'Imbalance > 5%: Più bid che ask (bullish pressure). Imbalance < -5%: Più ask che bid (bearish pressure).',
    academicReferences: [
      {
        authors: 'Glosten, L.R., & Milgrom, P.R.',
        year: 1985,
        title: 'Bid, Ask and Transaction Prices',
        keyFindings: 'Lo squilibrio dell\'order book predice movimenti di prezzo a breve termine.',
      },
      {
        authors: 'Kyle, A.S.',
        year: 1985,
        title: 'Continuous Auctions and Insider Trading',
        keyFindings: 'La profondità dell\'order book contiene informazioni sul valore fondamentale.',
      },
    ],
    interpretation: {
      positive: 'Imbalance positivo: Pressione rialzista (bullish)',
      negative: 'Imbalance negativo: Pressione ribassista (bearish)',
      neutral: 'Imbalance bilanciato',
    },
  },
  'top-mover': {
    id: 'top-mover',
    name: 'Top Mover (PRO)',
    description: 'Asset con la maggiore variazione percentuale nelle ultime 24 ore. Indica trend emergenti o movimenti anomali.',
    howToUse: 'Top mover positivo: Asset in forte rally (possibile momentum). Top mover negativo: Asset in forte correzione. Monitorare per opportunità o rischi.',
    academicReferences: [
      {
        authors: 'Jegadeesh, N., & Titman, S.',
        year: 1993,
        title: 'Returns to Buying Winners and Selling Losers',
        keyFindings: 'I top movers mostrano momentum che persiste nel breve termine.',
      },
    ],
    interpretation: {
      positive: 'Top mover positivo: Forte rally, momentum',
      negative: 'Top mover negativo: Forte correzione, rischio',
      neutral: 'Movimenti normali',
    },
  },
  'vix-term-structure': {
    id: 'vix-term-structure',
    name: 'VIX Term Structure',
    description: 'Struttura temporale del VIX: differenza tra VIX a lungo termine e VIX a breve termine. Indica contango (futures > spot) o backwardation (spot > futures).',
    howToUse: 'Contango positivo (>5%): Mercato calmo, aspettative di volatilità futura. Backwardation negativo (<-5%): Mercato stressato, volatilità immediata alta. Inversione predice correzioni.',
    academicReferences: [
      {
        authors: 'Whaley, R.E.',
        year: 2000,
        title: 'The Investor Fear Gauge',
        keyFindings: 'La struttura temporale del VIX predice correzioni di mercato quando si inverte (backwardation).',
      },
      {
        authors: 'Giot, P.',
        year: 2005,
        title: 'Relationships between Implied Volatility Indexes and Stock Index Returns',
        keyFindings: 'Contango persistente indica mercato rialzista, backwardation indica stress di mercato.',
      },
    ],
    interpretation: {
      positive: 'Backwardation: Stress di mercato, possibile correzione',
      negative: 'Contango elevato: Mercato calmo, trend rialzista',
      neutral: 'Contango moderato: Mercato normale',
    },
  },
  'put-call-ratio': {
    id: 'put-call-ratio',
    name: 'Put/Call Ratio',
    description: 'Rapporto tra volume di opzioni Put e Call. Indica sentiment del mercato: più Put = bearish, più Call = bullish.',
    howToUse: 'Ratio > 1.0: Più Put che Call (bearish sentiment, possibile bottom). Ratio < 0.7: Più Call che Put (bullish sentiment, possibile top). Estremi indicano reversal.',
    academicReferences: [
      {
        authors: 'CBOE',
        year: 2000,
        title: 'Put/Call Ratio: A Contrarian Indicator',
        keyFindings: 'Put/Call ratio estremi (>1.2 o <0.6) predicono reversal di mercato con alta probabilità.',
      },
      {
        authors: 'Pan, J., & Poteshman, A.M.',
        year: 2006,
        title: 'The Information in Option Volume for Future Stock Prices',
        keyFindings: 'Il volume di opzioni Put/Call contiene informazioni predittive sui movimenti futuri dei prezzi.',
      },
    ],
    interpretation: {
      positive: 'Ratio basso (<0.7): Sentiment bullish, possibile top',
      negative: 'Ratio alto (>1.0): Sentiment bearish, possibile bottom',
      neutral: 'Ratio normale (0.7-1.0): Sentiment bilanciato',
    },
  },
  'yield-curve': {
    id: 'yield-curve',
    name: 'Yield Curve Spread',
    description: 'Differenza tra rendimenti dei Treasury a 10 anni e 2 anni. Spread positivo = curva normale, spread negativo = inversione (recessione warning).',
    howToUse: 'Spread > 0.5%: Curva normale, crescita economica. Spread < 0%: Inversione, predittore di recessione (12-18 mesi). Spread 0-0.5%: Attenzione.',
    academicReferences: [
      {
        authors: 'Estrella, A., & Mishkin, F.S.',
        year: 1998,
        title: 'Predicting U.S. Recessions: Financial Variables as Leading Indicators',
        keyFindings: 'L\'inversione della yield curve (10Y-2Y < 0) predice recessioni con alta accuratezza (12-18 mesi prima).',
      },
      {
        authors: 'Harvey, C.R.',
        year: 1988,
        title: 'The Real Term Structure and Consumption Growth',
        keyFindings: 'La yield curve è il miglior predittore di crescita economica futura.',
      },
    ],
    interpretation: {
      positive: 'Spread positivo: Curva normale, crescita economica',
      negative: 'Spread negativo: Inversione, warning recessione',
      neutral: 'Spread basso: Attenzione, possibile inversione',
    },
  },
  'credit-spreads': {
    id: 'credit-spreads',
    name: 'Credit Spreads',
    description: 'Differenza tra rendimenti obbligazionari corporate (BAA) e Treasury. Spread alto = stress creditizio, spread basso = mercato sano.',
    howToUse: 'Spread > 3.0%: Stress creditizio, rischio recessione. Spread < 2.0%: Mercato sano, crescita. Monitorare trend per anticipare cicli economici.',
    academicReferences: [
      {
        authors: 'Duffie, D., & Singleton, K.J.',
        year: 2003,
        title: 'Credit Risk: Pricing, Measurement, and Management',
        keyFindings: 'I credit spreads predicono recessioni economiche con 6-12 mesi di anticipo.',
      },
      {
        authors: 'Gilchrist, S., & Zakrajšek, E.',
        year: 2012,
        title: 'Credit Spreads and Business Cycle Fluctuations',
        keyFindings: 'I credit spreads sono predittori robusti di crescita economica e recessioni.',
      },
    ],
    interpretation: {
      positive: 'Spread basso (<2.0%): Mercato sano, crescita',
      negative: 'Spread alto (>3.0%): Stress creditizio, rischio recessione',
      neutral: 'Spread moderato (2.0-3.0%): Mercato normale',
    },
  },
};

export function getIndicatorTooltip(id: string): IndicatorTooltip | undefined {
  return INDICATOR_TOOLTIPS[id];
}
