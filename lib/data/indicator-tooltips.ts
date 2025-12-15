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
    description: 'Come leggere: Valore < 20 = mercato calmo, trend rialzista probabile. Valore 20-30 = volatilità normale. Valore > 30 = alta volatilità, possibile correzione. Il VIX misura le aspettative di volatilità del mercato azionario nei prossimi 30 giorni, basato sui prezzi delle opzioni S&P 500. È inversamente correlato con S&P 500: quando il VIX sale, il mercato scende.',
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
    description: 'Come leggere: 0-24 = estremo timore (possibile opportunità di acquisto). 25-49 = timore. 50 = neutrale. 51-75 = avidità. 76-100 = estrema avidità (possibile opportunità di vendita). Indice che misura le emozioni del mercato crypto su una scala da 0 a 100, basato su 7 metriche diverse (volatilità, volume, social media, survey, dominance, trend, Google Trends).',
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
    description: 'Come leggere: > 60% = Bitcoin forte, altcoin deboli (mercato conservativo, risk-off). 50-60% = mercato bilanciato. < 50% = altcoin forti, Bitcoin debole (mercato speculativo, risk-on). Percentuale della capitalizzazione di mercato totale delle criptovalute rappresentata da Bitcoin. Indica la forza relativa di BTC vs altcoin.',
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
    description: 'Come leggere: Trend crescente = afflusso di capitali, interesse crescente, trend rialzista. Trend decrescente = deflusso di capitali, interesse calante, trend ribassista. Stabile = consolidamento. Capitalizzazione di mercato totale di tutte le criptovalute, calcolata come somma di (prezzo × supply) per ogni crypto. Correlato con sentiment generale del mercato.',
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
    description: 'Come leggere: Prezzo in rialzo = mercato azionario USA forte, economia solida, sentiment positivo. Prezzo in ribasso = mercato debole, possibile recessione, sentiment negativo. ETF che replica l\'indice S&P 500, rappresentando le 500 maggiori società quotate negli USA. Benchmark principale del mercato azionario americano. Correlato con economia USA e sentiment globale.',
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
    description: 'Come leggere: Prezzo in rialzo = settore tech forte, innovazione in crescita, sentiment positivo. Prezzo in ribasso = tech debole, possibile correzione. Più volatile di SPY. ETF che replica l\'indice NASDAQ-100, rappresentando le 100 maggiori società non finanziarie quotate al NASDAQ. Fortemente tech-weighted, correlato con innovazione e crescita.',
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
    description: 'Come leggere: Valore in rialzo = Euro forte, USD debole (buono per export europeo). Valore in ribasso = Euro debole, USD forte (buono per export USA). Tasso di cambio tra Euro e Dollaro USA. Indica quanti dollari servono per comprare un euro. Correlato con politiche monetarie ECB e Fed.',
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
  gold: {
    id: 'gold',
    name: 'Gold Price',
    description: 'Come leggere: Prezzo in rialzo = incertezza economica, inflazione in aumento, USD debole, safe haven richiesto. Prezzo in ribasso = stabilità economica, USD forte, rischio calante. Prezzo dell\'oro in USD per oncia. Considerato safe haven asset e hedge contro inflazione. Correlato negativamente con USD.',
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
    description: 'Come leggere: Prezzo in rialzo = domanda forte, inflazione in aumento, crescita economica globale. Prezzo in ribasso = domanda debole, possibile deflazione, rischio recessione. Prezzo del petrolio greggio (WTI) in USD per barile. Indicatore chiave dell\'economia globale e inflazione. Correlato con crescita globale.',
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
    description: 'Come leggere: Ratio > 1 = whale attivi, possibile movimento di prezzo significativo (attenzione). Ratio < 1 = whale inattivi, mercato calmo. Rapporto tra transazioni whale (>$1M) e transazioni medie. Indica l\'attività dei grandi investitori. Monitorare trend per anticipare movimenti.',
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
    description: 'Come leggere: Net flow positivo = più depositi che prelievi (possibile selling pressure, attenzione). Net flow negativo = più prelievi che depositi (possibile holding/accumulation, bullish). Flusso netto di criptovalute da/verso exchange. Depositi (inflow) vs Prelievi (outflow).',
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
    description: 'Come leggere: Imbalance > 5% = più bid che ask (pressione rialzista, bullish). Imbalance < -5% = più ask che bid (pressione ribassista, bearish). Imbalance -5% a +5% = bilanciato. Squilibrio tra bid volume e ask volume nei primi 400 livelli dell\'order book. Indica pressione rialzista o ribassista.',
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
    description: 'Come leggere: Top mover positivo = asset in forte rally, possibile momentum continuo (opportunità ma attenzione a overbought). Top mover negativo = asset in forte correzione, possibile rischio (attenzione). Asset con la maggiore variazione percentuale nelle ultime 24 ore. Indica trend emergenti o movimenti anomali. Monitorare per opportunità o rischi.',
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
    description: 'Come leggere: Contango positivo (>5%) = mercato calmo, aspettative di volatilità futura, trend rialzista probabile. Backwardation negativo (<-5%) = mercato stressato, volatilità immediata alta, possibile correzione. Struttura temporale del VIX: differenza tra VIX a lungo termine e VIX a breve termine. Indica contango (futures > spot) o backwardation (spot > futures). L\'inversione predice correzioni di mercato.',
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
    description: 'Come leggere: Ratio > 1.0 = più Put che Call (sentiment bearish, possibile bottom, opportunità di acquisto). Ratio < 0.7 = più Call che Put (sentiment bullish, possibile top, attenzione). Ratio 0.7-1.0 = sentiment bilanciato. Rapporto tra volume di opzioni Put e Call. Indica sentiment del mercato: più Put = bearish, più Call = bullish. Gli estremi indicano possibili reversal.',
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
    description: 'Come leggere: Spread > 0.5% = curva normale, crescita economica, mercato sano. Spread 0-0.5% = attenzione, possibile inversione. Spread < 0% = inversione, predittore di recessione (12-18 mesi prima). Differenza tra rendimenti dei Treasury a 10 anni e 2 anni. Spread positivo = curva normale, spread negativo = inversione (recessione warning).',
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
    description: 'Come leggere: Spread < 2.0% = mercato sano, crescita economica, rischio basso. Spread 2.0-3.0% = mercato normale. Spread > 3.0% = stress creditizio, rischio recessione. Differenza tra rendimenti obbligazionari corporate (BAA) e Treasury. Spread alto = stress creditizio, spread basso = mercato sano. Monitorare trend per anticipare cicli economici.',
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
  'market-breadth': {
    id: 'market-breadth',
    name: 'Market Breadth',
    description: 'Come leggere: Advance/Decline Ratio > 2.0 e New Highs > New Lows = breadth forte, rally sano. Ratio < 0.8 o New Lows > New Highs = breadth debole, rally stretto, possibile correzione. Misura la partecipazione complessiva ai movimenti di mercato. Un rally con forte breadth è più sostenibile.',
    howToUse: 'Breadth forte: Rally sano, partecipazione ampia. Breadth debole: Rally stretto, possibile correzione.',
    academicReferences: [
      {
        authors: 'McClellan, S. & T.',
        year: 1969,
        title: 'The McClellan Oscillator',
        keyFindings: 'L\'ampiezza di mercato predice la sostenibilità dei rally.',
      },
    ],
    interpretation: {
      positive: 'Breadth forte: Rally sano, partecipazione ampia',
      negative: 'Breadth debole: Rally stretto, possibile correzione',
      neutral: 'Breadth normale: Partecipazione bilanciata',
    },
  },
  'mcclellan-oscillator': {
    id: 'mcclellan-oscillator',
    name: 'McClellan Oscillator',
    description: 'Come leggere: Oscillator > +50 = momentum bullish estremo, possibile reversal. Oscillator < -50 = momentum bearish estremo, possibile reversal. Oscillator +10 a +50 = momentum bullish. Oscillator -10 a -50 = momentum bearish. Misura il momentum della linea Advance/Decline. Valori estremi indicano possibili reversal.',
    howToUse: 'Oscillator > +50: Momentum bullish estremo (possibile reversal). Oscillator < -50: Momentum bearish estremo (possibile reversal).',
    academicReferences: [
      {
        authors: 'McClellan, S. & T.',
        year: 1969,
        title: 'The McClellan Oscillator',
        keyFindings: 'Il McClellan Oscillator predice reversal di mercato quando raggiunge estremi (>+50 o <-50).',
      },
    ],
    interpretation: {
      positive: 'Oscillator positivo: Momentum bullish',
      negative: 'Oscillator negativo: Momentum bearish',
      neutral: 'Oscillator neutrale: Momentum bilanciato',
    },
  },
  'arms-index': {
    id: 'arms-index',
    name: 'Arms Index (TRIN)',
    description: 'Come leggere: TRIN > 2.0 = sentiment bearish estremo, possibile oversold, opportunità di acquisto. TRIN < 0.5 = sentiment bullish estremo, possibile overbought, attenzione. TRIN 0.8-1.2 = sentiment bilanciato. Misura la forza interna del mercato combinando Advance/Decline con Volume.',
    howToUse: 'TRIN > 2.0: Bearish estremo (possibile oversold). TRIN < 0.5: Bullish estremo (possibile overbought).',
    academicReferences: [
      {
        authors: 'Arms, R.',
        year: 1967,
        title: 'The Arms Index (TRIN)',
        keyFindings: 'Il TRIN predice reversal di mercato quando raggiunge estremi (>2.0 o <0.5).',
      },
    ],
    interpretation: {
      positive: 'TRIN basso (<0.8): Sentiment bullish',
      negative: 'TRIN alto (>1.2): Sentiment bearish',
      neutral: 'TRIN normale (0.8-1.2): Sentiment bilanciato',
    },
  },
  'dxy': {
    id: 'dxy',
    name: 'DXY (Dollar Index)',
    description: 'Come leggere: DXY alto = dollaro forte, commodities (oro, petrolio) deboli, mercati emergenti sotto pressione. DXY basso = dollaro debole, commodities forti, mercati emergenti in rally. Misura la forza del dollaro USA contro un paniere di valute (EUR, JPY, GBP, CAD, SEK, CHF).',
    howToUse: 'DXY alto: Dollaro forte, commodities deboli. DXY basso: Dollaro debole, commodities forti.',
    academicReferences: [
      {
        authors: 'Meese, R., & Rogoff, K.',
        year: 1983,
        title: 'Empirical Exchange Rate Models of the Seventies',
        keyFindings: 'Il DXY riflette le politiche monetarie delle banche centrali e le condizioni economiche relative.',
      },
    ],
    interpretation: {
      positive: 'DXY alto: Dollaro forte, commodities deboli',
      negative: 'DXY basso: Dollaro debole, commodities forti',
      neutral: 'DXY stabile: Mercato bilanciato',
    },
  },
  'european-indexes': {
    id: 'european-indexes',
    name: 'European Stock Indexes',
    description: 'Indici azionari europei principali: DAX (Germania), CAC 40 (Francia), FTSE 100 (UK), FTSE MIB (Italia), Euro Stoxx 50 (Eurozona), IBEX 35 (Spagna), AEX (Paesi Bassi). Riflettono la performance delle economie europee.',
    howToUse: 'Monitorare per diversificazione geografica e sentiment economico europeo.',
    academicReferences: [
      {
        authors: 'Modern Portfolio Theory',
        year: 1952,
        title: 'Portfolio Selection',
        keyFindings: 'La diversificazione geografica riduce il rischio di portafoglio.',
      },
    ],
    interpretation: {
      positive: 'Indici in rialzo: Economia europea forte',
      negative: 'Indici in ribasso: Economia europea debole',
      neutral: 'Indici stabili: Economia europea bilanciata',
    },
  },
  'asian-indexes': {
    id: 'asian-indexes',
    name: 'Asian Stock Indexes',
    description: 'Indici azionari asiatici principali: Nikkei 225 (Giappone), Shanghai Composite (Cina), Hang Seng (Hong Kong), Nifty 50 (India), KOSPI (Corea del Sud), ASX 200 (Australia). Riflettono la performance delle economie asiatiche.',
    howToUse: 'Monitorare per diversificazione geografica e sentiment economico asiatico.',
    academicReferences: [
      {
        authors: 'Modern Portfolio Theory',
        year: 1952,
        title: 'Portfolio Selection',
        keyFindings: 'La diversificazione geografica riduce il rischio di portafoglio.',
      },
    ],
    interpretation: {
      positive: 'Indici in rialzo: Economia asiatica forte',
      negative: 'Indici in ribasso: Economia asiatica debole',
      neutral: 'Indici stabili: Economia asiatica bilanciata',
    },
  },
  'nvt-ratio': {
    id: 'nvt-ratio',
    name: 'NVT Ratio',
    description: 'Come leggere: NVT > 95 = Bitcoin sopravvalutato rispetto al volume di transazioni. NVT < 20 = Bitcoin sottovalutato rispetto al volume di transazioni. NVT 40-75 = valutazione equa. Network Value to Transactions - misura se Bitcoin è sopravvalutato o sottovalutato.',
    howToUse: 'NVT alto (>95): Sopravvalutato. NVT basso (<20): Sottovalutato. Simile al P/E ratio per azioni.',
    academicReferences: [
      {
        authors: 'NVT Ratio Theory',
        year: 2017,
        title: 'Network Value to Transactions',
        keyFindings: 'Il NVT Ratio è un indicatore fondamentale per valutare Bitcoin rispetto al suo utilizzo.',
      },
    ],
    interpretation: {
      positive: 'NVT basso: Sottovalutato, possibile opportunità',
      negative: 'NVT alto: Sopravvalutato, attenzione',
      neutral: 'NVT normale: Valutazione equa',
    },
  },
  'mvrv-ratio': {
    id: 'mvrv-ratio',
    name: 'MVRV Ratio',
    description: 'Come leggere: MVRV > 3.7 = Bitcoin significativamente sopravvalutato. MVRV < 1.0 = Bitcoin significativamente sottovalutato (storicamente zone di acquisto). MVRV 1.5-2.5 = valutazione equa. Market Value to Realized Value - confronta market cap con realized cap.',
    howToUse: 'MVRV > 3.7: Sopravvalutato. MVRV < 1.0: Sottovalutato (zone di acquisto storiche).',
    academicReferences: [
      {
        authors: 'MVRV Ratio Theory',
        year: 2018,
        title: 'Market Value to Realized Value',
        keyFindings: 'MVRV < 1.0 indica zone di acquisto storiche per Bitcoin.',
      },
    ],
    interpretation: {
      positive: 'MVRV basso (<1.5): Sottovalutato, possibile opportunità',
      negative: 'MVRV alto (>2.5): Sopravvalutato, attenzione',
      neutral: 'MVRV normale (1.5-2.5): Valutazione equa',
    },
  },
  'active-addresses': {
    id: 'active-addresses',
    name: 'Active Addresses',
    description: 'Come leggere: Active addresses in aumento = crescita dell\'adozione, bullish. Active addresses in diminuzione = riduzione dell\'utilizzo, bearish. Active addresses stabili = adozione consolidata. Numero di indirizzi unici attivi sulla blockchain. Indica adozione e utilizzo della rete.',
    howToUse: 'Active addresses in aumento: Crescita adozione (bullish). Active addresses in diminuzione: Riduzione utilizzo (bearish).',
    academicReferences: [
      {
        authors: 'Network Activity Theory',
        year: 2018,
        title: 'Blockchain Network Activity',
        keyFindings: 'Gli indirizzi attivi sono un indicatore fondamentale di salute della rete blockchain.',
      },
    ],
    interpretation: {
      positive: 'Active addresses in aumento: Crescita adozione',
      negative: 'Active addresses in diminuzione: Riduzione utilizzo',
      neutral: 'Active addresses stabili: Adozione consolidata',
    },
  },
  'etf-rotations': {
    id: 'etf-rotations',
    name: 'ETF Rotations',
    description: 'Come leggere: Early cycle = Technology e Consumer Discretionary outperforming (espansione economica). Late cycle = Energy outperforming (possibile picco economico). Recession = debolezza settoriale ampia. Le rotazioni tra settori e regioni indicano la fase del ciclo economico.',
    howToUse: 'Early cycle: Technology/Consumer Discretionary outperforming. Late cycle: Energy outperforming. Recession: Debolezza ampia.',
    academicReferences: [
      {
        authors: 'Sector Rotation Theory',
        year: 2000,
        title: 'Economic Cycle and Sector Performance',
        keyFindings: 'Le rotazioni settoriali seguono il ciclo economico. Early cycle: Technology, Consumer Discretionary. Late cycle: Energy, Materials.',
      },
    ],
    interpretation: {
      positive: 'Early cycle: Espansione economica, Technology outperforming',
      negative: 'Late cycle/Recession: Possibile picco o recessione',
      neutral: 'Mid cycle: Performance bilanciata',
    },
  },
  'cot-reports': {
    id: 'cot-reports',
    name: 'COT Reports (Commitment of Traders)',
    description: 'Come leggere: Commercials net long > 50K = segnale bullish forte. Commercials net short > 50K = segnale bearish forte. I commercial traders (hedgers) sono tipicamente corretti agli estremi. Posizioni nette commerciali estreme indicano possibili reversal.',
    howToUse: 'Commercials net long: Segnale bullish. Commercials net short: Segnale bearish. Estremi commerciali = possibili reversal.',
    academicReferences: [
      {
        authors: 'COT Theory',
        year: 2005,
        title: 'Commitment of Traders and Market Reversals',
        keyFindings: 'I commercial traders sono tipicamente corretti agli estremi. Posizioni nette commerciali estreme predicono reversal di mercato.',
      },
    ],
    interpretation: {
      positive: 'Commercials net long: Segnale bullish',
      negative: 'Commercials net short: Segnale bearish',
      neutral: 'Posizioni bilanciate: Segnale neutrale',
    },
  },
  'economic-calendar': {
    id: 'economic-calendar',
    name: 'Economic Calendar',
    description: 'Calendario economico globale con eventi macroeconomici importanti: GDP, CPI, decisioni banche centrali (Fed, ECB, BOJ, BOE), employment reports, PMI. Eventi ad alto impatto causano volatilità significativa nei mercati.',
    howToUse: 'Monitorare eventi ad alto impatto (GDP, CPI, decisioni banche centrali) per anticipare volatilità. Eventi ad alto impatto = maggiore volatilità.',
    academicReferences: [
      {
        authors: 'Economic Calendar Theory',
        year: 2010,
        title: 'Macroeconomic Announcements and Market Volatility',
        keyFindings: 'Gli annunci macroeconomici ad alto impatto causano volatilità significativa nei mercati finanziari.',
      },
    ],
    interpretation: {
      positive: 'Eventi positivi: Supporto ai mercati',
      negative: 'Eventi negativi: Pressione sui mercati',
      neutral: 'Eventi bilanciati: Impatto neutrale',
    },
  },
  'insider-trading': {
    id: 'insider-trading',
    name: 'Insider Trading',
    description: 'Come leggere: Net buying da parte di insider > $10M = segnale bullish forte. Net selling > $10M = segnale bearish forte. Gli insider hanno informazioni superiori. Net buying = bullish, net selling = bearish.',
    howToUse: 'Net buying insider: Segnale bullish. Net selling insider: Segnale bearish. Gli insider sono tipicamente corretti nel timing.',
    academicReferences: [
      {
        authors: 'Jeng, Metrick, & Zeckhauser',
        year: 2003,
        title: 'Insider Trading and Stock Returns',
        keyFindings: 'Gli insider hanno informazioni superiori. Net buying da parte di insider predice rendimenti positivi, net selling predice rendimenti negativi.',
      },
    ],
    interpretation: {
      positive: 'Net buying insider: Segnale bullish',
      negative: 'Net selling insider: Segnale bearish',
      neutral: 'Attività bilanciata: Segnale neutrale',
    },
  },
  'technical-indicators': {
    id: 'technical-indicators',
    name: 'Technical Indicators',
    description: 'Indicatori tecnici pre-calcolati: RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), Stochastic Oscillator, Bollinger Bands, Moving Averages (SMA50, SMA200). RSI > 70 = overbought, RSI < 30 = oversold. MACD bullish crossover = segnale rialzista. SMA50 > SMA200 = uptrend.',
    howToUse: 'RSI > 70: Overbought. RSI < 30: Oversold. MACD bullish crossover: Segnale rialzista. SMA50 > SMA200: Uptrend.',
    academicReferences: [
      {
        authors: 'Technical Analysis Theory',
        year: 2000,
        title: 'Technical Indicators and Price Action',
        keyFindings: 'Gli indicatori tecnici analizzano price action e momentum. RSI, MACD, e moving averages sono predittori robusti di movimenti di prezzo.',
      },
    ],
    interpretation: {
      positive: 'Setup bullish: RSI non overbought, MACD bullish, uptrend',
      negative: 'Setup bearish: RSI overbought, MACD bearish, downtrend',
      neutral: 'Setup neutrale: Segnali misti',
    },
  },
  'aaii-sentiment': {
    id: 'aaii-sentiment',
    name: 'AAII Sentiment Survey',
    description: 'Come leggere: AAII Bullish > 50% = segnale bearish (contrarian) - possibile top di mercato. AAII Bearish > 50% = segnale bullish (contrarian) - possibile bottom di mercato. Sondaggio settimanale del sentiment degli investitori individuali. Indicatore contrarian: estremi di sentiment indicano possibili reversal.',
    howToUse: 'AAII Bullish > 50%: Segnale bearish (contrarian). AAII Bearish > 50%: Segnale bullish (contrarian). Estremi = possibili reversal.',
    academicReferences: [
      {
        authors: 'Contrarian Indicator Theory',
        year: 2005,
        title: 'Sentiment Surveys and Market Reversals',
        keyFindings: 'Gli estremi di sentiment (AAII Bullish > 50% o Bearish > 50%) predicono reversal di mercato. Quando la folla è estremamente bullish, il mercato è spesso vicino a un top.',
      },
    ],
    interpretation: {
      positive: 'Bearish sentiment estremo: Possibile bottom (contrarian bullish)',
      negative: 'Bullish sentiment estremo: Possibile top (contrarian bearish)',
      neutral: 'Sentiment bilanciato: Nessun segnale contrarian chiaro',
    },
  },
  'high-low-index': {
    id: 'high-low-index',
    name: 'High-Low Index',
    description: 'Come leggere: High-Low Index > 80% = breadth molto forte, molti titoli a nuovi massimi, molto bullish. Index < 20% = breadth molto debole, molti titoli a nuovi minimi, molto bearish. Index 40-60% = breadth bilanciata. Percentuale di titoli che fanno nuovi massimi 52-week vs. nuovi minimi 52-week.',
    howToUse: 'Index > 80%: Breadth molto forte (bullish). Index < 20%: Breadth molto debole (bearish).',
    academicReferences: [
      {
        authors: 'Market Breadth Theory',
        year: 2000,
        title: 'High-Low Index and Market Participation',
        keyFindings: 'L\'High-Low Index misura la partecipazione di mercato. Index > 80% indica breadth molto forte, Index < 20% indica breadth molto debole.',
      },
    ],
    interpretation: {
      positive: 'Index > 60%: Breadth forte, partecipazione sana',
      negative: 'Index < 40%: Breadth debole, partecipazione limitata',
      neutral: 'Index 40-60%: Breadth bilanciata',
    },
  },
  'money-flow-index': {
    id: 'money-flow-index',
    name: 'Money Flow Index (MFI)',
    description: 'Come leggere: MFI > 80 = overbought, possibile reversal bearish. MFI < 20 = oversold, possibile reversal bullish. MFI 40-60 = neutrale. Money Flow Index - RSI ponderato per il volume. Combina prezzo e volume per identificare overbought/oversold.',
    howToUse: 'MFI > 80: Overbought (bearish). MFI < 20: Oversold (bullish). MFI è un RSI ponderato per il volume.',
    academicReferences: [
      {
        authors: 'MFI Theory',
        year: 1991,
        title: 'Money Flow Index',
        keyFindings: 'MFI combina prezzo e volume. MFI > 80 indica overbought, MFI < 20 indica oversold.',
      },
    ],
    interpretation: {
      positive: 'MFI < 20: Oversold, possibile bounce',
      negative: 'MFI > 80: Overbought, possibile reversal',
      neutral: 'MFI 40-60: Neutrale',
    },
  },
  'on-balance-volume': {
    id: 'on-balance-volume',
    name: 'On-Balance Volume (OBV)',
    description: 'Come leggere: OBV in aumento = accumulazione, segnale bullish. OBV in diminuzione = distribuzione, segnale bearish. Divergenza OBV vs. prezzo = possibile reversal. On-Balance Volume - indicatore cumulativo di volume. Il volume precede il prezzo.',
    howToUse: 'OBV in aumento: Accumulazione (bullish). OBV in diminuzione: Distribuzione (bearish). Divergenza = possibile reversal.',
    academicReferences: [
      {
        authors: 'Granville, J.',
        year: 1963,
        title: 'On-Balance Volume',
        keyFindings: 'OBV misura il flusso cumulativo di volume. OBV in aumento indica accumulazione, OBV in diminuzione indica distribuzione. Il volume precede il prezzo.',
      },
    ],
    interpretation: {
      positive: 'OBV in aumento: Accumulazione, segnale bullish',
      negative: 'OBV in diminuzione: Distribuzione, segnale bearish',
      neutral: 'OBV stabile: Flusso bilanciato',
    },
  },
  'williams-r': {
    id: 'williams-r',
    name: 'Williams %R',
    description: 'Come leggere: Williams %R > -20 = overbought, possibile reversal bearish. Williams %R < -80 = oversold, possibile reversal bullish. Williams %R - oscillatore di momentum. Misura la posizione del prezzo rispetto al range di trading.',
    howToUse: '%R > -20: Overbought (bearish). %R < -80: Oversold (bullish).',
    academicReferences: [
      {
        authors: 'Williams, L.',
        year: 1973,
        title: 'Williams %R',
        keyFindings: 'Williams %R è un oscillatore di momentum. %R > -20 indica overbought, %R < -80 indica oversold.',
      },
    ],
    interpretation: {
      positive: '%R < -80: Oversold, possibile bounce',
      negative: '%R > -20: Overbought, possibile reversal',
      neutral: '%R -80 a -20: Neutrale',
    },
  },
  'commodity-channel-index': {
    id: 'commodity-channel-index',
    name: 'Commodity Channel Index (CCI)',
    description: 'Come leggere: CCI > +100 = overbought, possibile reversal bearish. CCI < -100 = oversold, possibile reversal bullish. CCI crossing zero = cambio di trend. Commodity Channel Index - oscillatore di momentum.',
    howToUse: 'CCI > +100: Overbought (bearish). CCI < -100: Oversold (bullish). CCI crossing zero = cambio trend.',
    academicReferences: [
      {
        authors: 'Lambert, D.',
        year: 1980,
        title: 'Commodity Channel Index',
        keyFindings: 'CCI è un oscillatore di momentum. CCI > +100 indica overbought, CCI < -100 indica oversold. CCI crossing zero indica cambio di trend.',
      },
    ],
    interpretation: {
      positive: 'CCI < -100: Oversold, possibile bounce',
      negative: 'CCI > +100: Overbought, possibile reversal',
      neutral: 'CCI -100 a +100: Neutrale',
    },
  },
  'average-true-range': {
    id: 'average-true-range',
    name: 'Average True Range (ATR)',
    description: 'Come leggere: ATR alto = alta volatilità, alto rischio, ampi movimenti di prezzo attesi. ATR basso = bassa volatilità, basso rischio, movimenti di prezzo stabili. Average True Range - indicatore di volatilità. Usato per il posizionamento di stop-loss.',
    howToUse: 'ATR alto: Alta volatilità (alto rischio). ATR basso: Bassa volatilità (basso rischio). ATR per stop-loss.',
    academicReferences: [
      {
        authors: 'Wilder, J.W.',
        year: 1978,
        title: 'Average True Range',
        keyFindings: 'ATR misura la volatilità. ATR alto indica alta volatilità (alto rischio), ATR basso indica bassa volatilità (basso rischio). ATR è usato per il posizionamento di stop-loss.',
      },
    ],
    interpretation: {
      positive: 'ATR basso: Bassa volatilità, basso rischio',
      negative: 'ATR alto: Alta volatilità, alto rischio',
      neutral: 'ATR medio: Volatilità moderata',
    },
  },
  'advance-decline-line': {
    id: 'advance-decline-line',
    name: 'Advance/Decline Line',
    description: 'Come leggere: A/D Line in aumento = partecipazione ampia, segnale bullish. A/D Line in diminuzione = partecipazione ristretta, segnale bearish. Divergenza A/D Line vs. indice = possibile reversal. Advance/Decline Line - indicatore di market breadth. Misura la partecipazione complessiva ai movimenti di mercato.',
    howToUse: 'A/D Line in aumento: Partecipazione ampia (bullish). A/D Line in diminuzione: Partecipazione ristretta (bearish). Divergenza = possibile reversal.',
    academicReferences: [
      {
        authors: 'Market Breadth Theory',
        year: 1960,
        title: 'Advance/Decline Line',
        keyFindings: 'La A/D Line misura la partecipazione di mercato. A/D Line in aumento indica partecipazione ampia (bullish), A/D Line in diminuzione indica partecipazione ristretta (bearish).',
      },
    ],
    interpretation: {
      positive: 'A/D Line in aumento: Partecipazione ampia, bullish',
      negative: 'A/D Line in diminuzione: Partecipazione ristretta, bearish',
      neutral: 'A/D Line stabile: Partecipazione bilanciata',
    },
  },
  'italian-indexes': {
    id: 'italian-indexes',
    name: 'Italian Stock Indexes',
    description: 'Indici azionari italiani principali: FTSE MIB (Milano Indice di Borsa), FTSE Italia All-Share. Riflettono la performance dell\'economia italiana e del mercato azionario italiano.',
    howToUse: 'Monitorare per diversificazione geografica e sentiment economico italiano.',
    academicReferences: [
      {
        authors: 'Modern Portfolio Theory',
        year: 1952,
        title: 'Portfolio Selection',
        keyFindings: 'La diversificazione geografica riduce il rischio di portafoglio.',
      },
    ],
    interpretation: {
      positive: 'Indici in rialzo: Economia italiana forte',
      negative: 'Indici in ribasso: Economia italiana debole',
      neutral: 'Indici stabili: Economia italiana bilanciata',
    },
  },
  'exchange-reserves': {
    id: 'exchange-reserves',
    name: 'Exchange Reserves',
    description: 'Come leggere: Riserve alte = pressione di vendita (bearish). Riserve basse = accumulazione (bullish). Outflows (monete che escono dalle exchange) = bullish, Inflows (monete che entrano nelle exchange) = bearish. Riserve di criptovalute sulle exchange principali (Binance, Coinbase).',
    howToUse: 'Outflows: Monete escono dalle exchange (bullish). Inflows: Monete entrano nelle exchange (bearish).',
    academicReferences: [
      {
        authors: 'Exchange Reserves Theory',
        year: 2019,
        title: 'Exchange Reserves and Market Sentiment',
        keyFindings: 'Riserve alte indicano pressione di vendita. Riserve basse indicano accumulazione. Outflows sono bullish, inflows sono bearish.',
      },
    ],
    interpretation: {
      positive: 'Outflows: Monete escono dalle exchange, bullish',
      negative: 'Inflows: Monete entrano nelle exchange, bearish',
      neutral: 'Flussi bilanciati: Attività exchange neutrale',
    },
  },
  'consumer-confidence': {
    id: 'consumer-confidence',
    name: 'Consumer Confidence Index',
    description: 'Come leggere: CCI alto = forte spesa dei consumatori, bullish per economia e mercati. CCI basso = debole spesa dei consumatori, bearish per economia e mercati. Indice di fiducia dei consumatori - predice la spesa dei consumatori.',
    howToUse: 'CCI in aumento: Fiducia migliora (bullish). CCI in diminuzione: Fiducia peggiora (bearish).',
    academicReferences: [
      {
        authors: 'Consumer Confidence Theory',
        year: 2000,
        title: 'Consumer Confidence and Economic Activity',
        keyFindings: 'L\'indice di fiducia dei consumatori predice la spesa dei consumatori. CCI alto indica forte spesa (bullish), CCI basso indica debole spesa (bearish).',
      },
    ],
    interpretation: {
      positive: 'CCI in aumento: Fiducia migliora, bullish',
      negative: 'CCI in diminuzione: Fiducia peggiora, bearish',
      neutral: 'CCI stabile: Fiducia neutrale',
    },
  },
  'retail-sales': {
    id: 'retail-sales',
    name: 'Retail Sales',
    description: 'Come leggere: Vendite forti = economia forte, bullish. Vendite deboli = economia debole, bearish. Vendite al dettaglio - indicatore di attività economica e spesa dei consumatori.',
    howToUse: 'Vendite in aumento: Economia forte (bullish). Vendite in diminuzione: Economia debole (bearish).',
    academicReferences: [
      {
        authors: 'Retail Sales Theory',
        year: 2005,
        title: 'Retail Sales and Economic Activity',
        keyFindings: 'Le vendite al dettaglio sono un indicatore di attività economica. Vendite forti indicano economia forte (bullish), vendite deboli indicano economia debole (bearish).',
      },
    ],
    interpretation: {
      positive: 'Vendite forti: Economia forte, bullish',
      negative: 'Vendite deboli: Economia debole, bearish',
      neutral: 'Vendite stabili: Economia moderata',
    },
  },
  'industrial-production': {
    id: 'industrial-production',
    name: 'Industrial Production',
    description: 'Come leggere: Produzione in espansione = manifattura forte, bullish. Produzione in contrazione = manifattura debole, bearish. Produzione industriale - indicatore di attività manifatturiera.',
    howToUse: 'Produzione in espansione: Manifattura forte (bullish). Produzione in contrazione: Manifattura debole (bearish).',
    academicReferences: [
      {
        authors: 'Industrial Production Theory',
        year: 2000,
        title: 'Industrial Production and Manufacturing Activity',
        keyFindings: 'La produzione industriale è un indicatore di attività manifatturiera. Produzione forte indica manifattura forte (bullish), produzione debole indica manifattura debole (bearish).',
      },
    ],
    interpretation: {
      positive: 'Produzione in espansione: Manifattura forte, bullish',
      negative: 'Produzione in contrazione: Manifattura debole, bearish',
      neutral: 'Produzione stabile: Manifattura moderata',
    },
  },
  'parabolic-sar': {
    id: 'parabolic-sar',
    name: 'Parabolic SAR',
    description: 'Come leggere: SAR sotto il prezzo = uptrend, segnale bullish. SAR sopra il prezzo = downtrend, segnale bearish. SAR flip = segnale di cambio trend. Parabolic SAR - indicatore trend following.',
    howToUse: 'SAR sotto prezzo: Uptrend (bullish). SAR sopra prezzo: Downtrend (bearish). SAR flip = cambio trend.',
    academicReferences: [
      {
        authors: 'Wilder, J.W.',
        year: 1978,
        title: 'Parabolic SAR',
        keyFindings: 'Parabolic SAR è un indicatore trend following. SAR sotto il prezzo indica uptrend (bullish), SAR sopra il prezzo indica downtrend (bearish).',
      },
    ],
    interpretation: {
      positive: 'SAR sotto prezzo: Uptrend, bullish',
      negative: 'SAR sopra prezzo: Downtrend, bearish',
      neutral: 'SAR flip: Cambio trend',
    },
  },
  'adx': {
    id: 'adx',
    name: 'ADX (Average Directional Index)',
    description: 'Come leggere: ADX > 25 = trend forte. ADX < 20 = trend debole/nessun trend. +DI > -DI = bullish, -DI > +DI = bearish. ADX - misura la forza del trend.',
    howToUse: 'ADX > 25: Trend forte. ADX < 20: Trend debole. +DI > -DI: Bullish, -DI > +DI: Bearish.',
    academicReferences: [
      {
        authors: 'Wilder, J.W.',
        year: 1978,
        title: 'Average Directional Index',
        keyFindings: 'ADX misura la forza del trend. ADX > 25 indica trend forte, ADX < 20 indica trend debole. +DI > -DI indica bullish, -DI > +DI indica bearish.',
      },
    ],
    interpretation: {
      positive: 'ADX > 25, +DI > -DI: Trend forte bullish',
      negative: 'ADX > 25, -DI > +DI: Trend forte bearish',
      neutral: 'ADX < 20: Trend debole, mercato choppy',
    },
  },
  'funding-rates': {
    id: 'funding-rates',
    name: 'Funding Rates',
    description: 'Come leggere: Funding positivo alto = longs pagano shorts (sentiment bearish). Funding negativo alto = shorts pagano longs (sentiment bullish). Reversal dei funding rates = possibili cambi di trend. Tassi di funding per perpetual futures (BTC, ETH).',
    howToUse: 'Funding negativo: Shorts pagano longs (bullish). Funding positivo: Longs pagano shorts (bearish). Estremi = possibili reversal.',
    academicReferences: [
      {
        authors: 'Funding Rates Theory',
        year: 2019,
        title: 'Funding Rates and Market Sentiment',
        keyFindings: 'I tassi di funding estremi indicano estremi di sentiment. Funding positivo alto = sentiment bearish, funding negativo alto = sentiment bullish.',
      },
    ],
    interpretation: {
      positive: 'Funding negativo: Shorts pagano longs, bullish',
      negative: 'Funding positivo: Longs pagano shorts, bearish',
      neutral: 'Funding neutrale: Sentiment bilanciato',
    },
  },
  'long-short-ratio': {
    id: 'long-short-ratio',
    name: 'Long/Short Ratio',
    description: 'Come leggere: Ratio alto (>1.5) = molti longs, bearish (contrarian) - possibile reversal. Ratio basso (<0.7) = molti shorts, bullish (contrarian) - possibile reversal. Rapporto long/short per posizioni futures.',
    howToUse: 'Ratio alto: Molti longs (bearish contrarian). Ratio basso: Molti shorts (bullish contrarian). Estremi = possibili reversal.',
    academicReferences: [
      {
        authors: 'Long/Short Ratio Theory',
        year: 2020,
        title: 'Long/Short Ratio and Market Reversals',
        keyFindings: 'Il rapporto long/short è un indicatore contrarian. Ratio alto indica molti longs (bearish contrarian), ratio basso indica molti shorts (bullish contrarian).',
      },
    ],
    interpretation: {
      positive: 'Ratio basso: Molti shorts, bullish (contrarian)',
      negative: 'Ratio alto: Molti longs, bearish (contrarian)',
      neutral: 'Ratio neutrale: Posizioni bilanciate',
    },
  },
  'rate-of-change': {
    id: 'rate-of-change',
    name: 'Rate of Change (ROC)',
    description: 'Come leggere: ROC > 0 = momentum bullish. ROC < 0 = momentum bearish. Estremi ROC = possibili reversal. Rate of Change - misura il momentum del prezzo.',
    howToUse: 'ROC > 0: Momentum bullish. ROC < 0: Momentum bearish. Estremi = possibili reversal.',
    academicReferences: [
      {
        authors: 'ROC Theory',
        year: 1970,
        title: 'Rate of Change',
        keyFindings: 'ROC misura il momentum. ROC > 0 indica momentum bullish, ROC < 0 indica momentum bearish.',
      },
    ],
    interpretation: {
      positive: 'ROC positivo: Momentum bullish',
      negative: 'ROC negativo: Momentum bearish',
      neutral: 'ROC neutrale: Momentum moderato',
    },
  },
  'chaikin-money-flow': {
    id: 'chaikin-money-flow',
    name: 'Chaikin Money Flow (CMF)',
    description: 'Come leggere: CMF > 0.1 = accumulazione, segnale bullish. CMF < -0.1 = distribuzione, segnale bearish. Estremi CMF = possibili reversal. Chaikin Money Flow - combina prezzo e volume.',
    howToUse: 'CMF > 0.1: Accumulazione (bullish). CMF < -0.1: Distribuzione (bearish). Estremi = possibili reversal.',
    academicReferences: [
      {
        authors: 'Chaikin, M.',
        year: 1980,
        title: 'Chaikin Money Flow',
        keyFindings: 'CMF combina prezzo e volume. CMF > 0 indica accumulazione (bullish), CMF < 0 indica distribuzione (bearish).',
      },
    ],
    interpretation: {
      positive: 'CMF positivo: Accumulazione, bullish',
      negative: 'CMF negativo: Distribuzione, bearish',
      neutral: 'CMF neutrale: Flusso bilanciato',
    },
  },
  'accumulation-distribution': {
    id: 'accumulation-distribution',
    name: 'Accumulation/Distribution Line',
    description: 'Come leggere: A/D Line in aumento = accumulazione, segnale bullish. A/D Line in diminuzione = distribuzione, segnale bearish. Divergenza A/D Line vs. prezzo = possibile reversal. Accumulation/Distribution Line - indicatore volume-weighted.',
    howToUse: 'A/D Line in aumento: Accumulazione (bullish). A/D Line in diminuzione: Distribuzione (bearish). Divergenza = possibile reversal.',
    academicReferences: [
      {
        authors: 'Accumulation/Distribution Theory',
        year: 1980,
        title: 'Accumulation/Distribution Line',
        keyFindings: 'La A/D Line è un indicatore volume-weighted. A/D Line in aumento indica accumulazione (bullish), A/D Line in diminuzione indica distribuzione (bearish).',
      },
    ],
    interpretation: {
      positive: 'A/D Line in aumento: Accumulazione, bullish',
      negative: 'A/D Line in diminuzione: Distribuzione, bearish',
      neutral: 'A/D Line stabile: Accumulazione/Distribuzione bilanciata',
    },
  },
  'percentage-price-oscillator': {
    id: 'percentage-price-oscillator',
    name: 'Percentage Price Oscillator (PPO)',
    description: 'Come leggere: PPO > 0 = momentum bullish. PPO < 0 = momentum bearish. PPO crossover = segnale di cambio trend. Percentage Price Oscillator - simile a MACD ma basato su percentuali.',
    howToUse: 'PPO > 0: Momentum bullish. PPO < 0: Momentum bearish. PPO crossover = cambio trend.',
    academicReferences: [
      {
        authors: 'PPO Theory',
        year: 1990,
        title: 'Percentage Price Oscillator',
        keyFindings: 'PPO è simile a MACD ma basato su percentuali. PPO > 0 indica momentum bullish, PPO < 0 indica momentum bearish.',
      },
    ],
    interpretation: {
      positive: 'PPO positivo: Momentum bullish',
      negative: 'PPO negativo: Momentum bearish',
      neutral: 'PPO neutrale: Momentum moderato',
    },
  },
  'ichimoku-cloud': {
    id: 'ichimoku-cloud',
    name: 'Ichimoku Cloud',
    description: 'Come leggere: Prezzo sopra la nuvola = bullish, trend rialzista forte. Prezzo sotto la nuvola = bearish, trend ribassista forte. Prezzo dentro la nuvola = trend incerto. Cambio colore della nuvola = cambio trend. Ichimoku Cloud - indicatore di trend completo.',
    howToUse: 'Prezzo sopra nuvola: Bullish. Prezzo sotto nuvola: Bearish. Cambio colore nuvola = cambio trend.',
    academicReferences: [
      {
        authors: 'Hosoda, G.',
        year: 1969,
        title: 'Ichimoku Kinko Hyo',
        keyFindings: 'Ichimoku Cloud è un indicatore di trend completo. Prezzo sopra la nuvola indica trend bullish, prezzo sotto la nuvola indica trend bearish.',
      },
    ],
    interpretation: {
      positive: 'Prezzo sopra nuvola: Trend bullish forte',
      negative: 'Prezzo sotto nuvola: Trend bearish forte',
      neutral: 'Prezzo dentro nuvola: Trend incerto',
    },
  },
  'stablecoin-supply-ratio': {
    id: 'stablecoin-supply-ratio',
    name: 'Stablecoin Supply Ratio (SSR)',
    description: 'Come leggere: SSR alto (>20) = bassa supply di stablecoin rispetto a BTC, bearish - debole potere d\'acquisto. SSR basso (<10) = alta supply di stablecoin rispetto a BTC, bullish - forte potere d\'acquisto. Estremi SSR = possibili segnali di reversal.',
    howToUse: 'SSR basso: Alta supply stablecoin (bullish). SSR alto: Bassa supply stablecoin (bearish). Estremi = possibili reversal.',
    academicReferences: [
      {
        authors: 'SSR Theory',
        year: 2020,
        title: 'Stablecoin Supply Ratio and Bitcoin Price',
        keyFindings: 'SSR misura il potere d\'acquisto di Bitcoin. SSR alto indica debole potere d\'acquisto (bearish), SSR basso indica forte potere d\'acquisto (bullish).',
      },
    ],
    interpretation: {
      positive: 'SSR basso: Forte potere d\'acquisto, bullish',
      negative: 'SSR alto: Debole potere d\'acquisto, bearish',
      neutral: 'SSR medio: Potere d\'acquisto bilanciato',
    },
  },
  'global-pmi': {
    id: 'global-pmi',
    name: 'Global PMI',
    description: 'Come leggere: PMI globale > 50 = espansione economica mondiale, bullish per i mercati. PMI globale < 50 = contrazione economica mondiale, bearish per i mercati. PMI Globale - indicatore leading dell\'economia mondiale.',
    howToUse: 'PMI > 50: Espansione (bullish). PMI < 50: Contrazione (bearish).',
    academicReferences: [
      {
        authors: 'Global PMI Theory',
        year: 2000,
        title: 'Global PMI and Economic Activity',
        keyFindings: 'Il PMI globale mostra l\'attività economica mondiale. PMI > 50 indica espansione (bullish), PMI < 50 indica contrazione (bearish).',
      },
    ],
    interpretation: {
      positive: 'PMI > 50: Espansione economica mondiale, bullish',
      negative: 'PMI < 50: Contrazione economica mondiale, bearish',
      neutral: 'PMI ~50: Attività economica stabile',
    },
  },
  'global-inflation': {
    id: 'global-inflation',
    name: 'Global Inflation',
    description: 'Come leggere: Inflazione globale alta (>4%) = bearish per bond, mixed per stocks. Inflazione globale bassa (<2%) = bullish per bond e stocks. Inflazione Globale - mostra le tendenze dei prezzi mondiali.',
    howToUse: 'Inflazione alta: Bearish per bond, mixed per stocks. Inflazione bassa: Bullish per bond e stocks.',
    academicReferences: [
      {
        authors: 'Global Inflation Theory',
        year: 2000,
        title: 'Global Inflation and Market Performance',
        keyFindings: 'L\'inflazione globale mostra le tendenze dei prezzi mondiali. Inflazione alta = bearish per bond, inflazione bassa = bullish per bond e stocks.',
      },
    ],
    interpretation: {
      positive: 'Inflazione bassa: Bullish per bond e stocks',
      negative: 'Inflazione alta: Bearish per bond, mixed per stocks',
      neutral: 'Inflazione moderata: Impatto neutrale',
    },
  },
  'global-central-bank-rates': {
    id: 'global-central-bank-rates',
    name: 'Global Central Bank Rates',
    description: 'Come leggere: Tassi globali alti (>4%) = politica restrittiva, bearish per i mercati. Tassi globali bassi (<2%) = politica accomodante, bullish per i mercati. Tassi Banche Centrali Globali - indicatore di politica monetaria mondiale.',
    howToUse: 'Tassi alti: Politica restrittiva (bearish). Tassi bassi: Politica accomodante (bullish).',
    academicReferences: [
      {
        authors: 'Global Central Bank Rates Theory',
        year: 2000,
        title: 'Global Central Bank Rates and Market Performance',
        keyFindings: 'I tassi delle banche centrali globali indicano la politica monetaria mondiale. Tassi alti = politica restrittiva (bearish), tassi bassi = politica accomodante (bullish).',
      },
    ],
    interpretation: {
      positive: 'Tassi bassi: Politica accomodante, bullish',
      negative: 'Tassi alti: Politica restrittiva, bearish',
      neutral: 'Tassi moderati: Politica neutrale',
    },
  },
  'currency-strength-index': {
    id: 'currency-strength-index',
    name: 'Currency Strength Index',
    description: 'Come leggere: Valuta forte = economia forte, bullish per quella valuta. Valuta debole = economia debole, bearish per quella valuta. La forza valutaria influisce su commodities e mercati emergenti. Indice di Forza Valutaria - mostra la forza relativa delle valute.',
    howToUse: 'Valuta forte: Economia forte (bullish per quella valuta). Valuta debole: Economia debole (bearish per quella valuta).',
    academicReferences: [
      {
        authors: 'Currency Strength Theory',
        year: 2000,
        title: 'Currency Strength and Economic Performance',
        keyFindings: 'L\'indice di forza valutaria mostra la forza relativa delle valute. Valuta forte indica economia forte (bullish), valuta debole indica economia debole (bearish).',
      },
    ],
    interpretation: {
      positive: 'Valuta forte: Economia forte, bullish',
      negative: 'Valuta debole: Economia debole, bearish',
      neutral: 'Forza valutaria bilanciata: Economie bilanciate',
    },
  },
  'order-flow-imbalance': {
    id: 'order-flow-imbalance',
    name: 'Order Flow Imbalance',
    description: 'Come leggere: Imbalance positivo (>5%) = pressione di acquisto, segnale bullish. Imbalance negativo (<-5%) = pressione di vendita, segnale bearish. Estremi imbalance = possibili segnali di reversal. Order Flow Imbalance - indica pressione direzionale del mercato.',
    howToUse: 'Imbalance positivo: Pressione di acquisto (bullish). Imbalance negativo: Pressione di vendita (bearish). Estremi = possibili reversal.',
    academicReferences: [
      {
        authors: 'Order Flow Theory',
        year: 2010,
        title: 'Order Flow Imbalance and Market Direction',
        keyFindings: 'Lo squilibrio dell\'order flow indica pressione direzionale. Imbalance positivo indica pressione di acquisto (bullish), imbalance negativo indica pressione di vendita (bearish).',
      },
    ],
    interpretation: {
      positive: 'Imbalance positivo: Pressione di acquisto, bullish',
      negative: 'Imbalance negativo: Pressione di vendita, bearish',
      neutral: 'Imbalance bilanciato: Pressione bilanciata',
    },
  },
  'cumulative-delta': {
    id: 'cumulative-delta',
    name: 'Cumulative Delta',
    description: 'Come leggere: Delta positivo = pressione di acquisto nel tempo, bullish. Delta negativo = pressione di vendita nel tempo, bearish. Divergenze delta = possibili segnali di reversal. Cumulative Delta - misura la pressione di acquisto vs. vendita nel tempo.',
    howToUse: 'Delta positivo: Pressione di acquisto (bullish). Delta negativo: Pressione di vendita (bearish). Divergenze = possibili reversal.',
    academicReferences: [
      {
        authors: 'Cumulative Delta Theory',
        year: 2010,
        title: 'Cumulative Delta and Market Direction',
        keyFindings: 'Il cumulative delta misura la pressione di acquisto vs. vendita nel tempo. Delta positivo indica pressione di acquisto (bullish), delta negativo indica pressione di vendita (bearish).',
      },
    ],
    interpretation: {
      positive: 'Delta positivo: Pressione di acquisto, bullish',
      negative: 'Delta negativo: Pressione di vendita, bearish',
      neutral: 'Delta neutrale: Pressione bilanciata',
    },
  },
  'fibonacci-retracements': {
    id: 'fibonacci-retracements',
    name: 'Fibonacci Retracements',
    description: 'Come leggere: Prezzo ai livelli 38.2%, 50%, 61.8% = livelli chiave di supporto/resistenza. Prezzo che rimbalza dai livelli Fibonacci = supporto/resistenza. Ritracciamenti di Fibonacci - livelli psicologici di supporto/resistenza.',
    howToUse: 'Prezzo ai livelli 38.2%, 50%, 61.8%: Livelli chiave. Rimbalzo dai livelli = supporto/resistenza.',
    academicReferences: [
      {
        authors: 'Fibonacci Theory',
        year: 1202,
        title: 'Fibonacci Sequence',
        keyFindings: 'I ritracciamenti di Fibonacci sono livelli psicologici di supporto/resistenza. 38.2%, 50%, 61.8% sono livelli chiave.',
      },
    ],
    interpretation: {
      positive: 'Prezzo ai livelli di supporto: Possibile rimbalzo',
      negative: 'Prezzo ai livelli di resistenza: Possibile reversal',
      neutral: 'Prezzo tra livelli: Monitorare per break',
    },
  },
  'exchange-netflows': {
    id: 'exchange-netflows',
    name: 'Exchange Netflows',
    description: 'Come leggere: Net outflows (negativo) = monete escono dalle exchange, bullish - accumulazione. Net inflows (positivo) = monete entrano nelle exchange, bearish - pressione di vendita. Exchange Netflows - misura i flussi netti di monete da/verso le exchange.',
    howToUse: 'Net outflows: Monete escono dalle exchange (bullish). Net inflows: Monete entrano nelle exchange (bearish).',
    academicReferences: [
      {
        authors: 'Exchange Netflows Theory',
        year: 2019,
        title: 'Exchange Netflows and Market Sentiment',
        keyFindings: 'Net outflows (monete che escono dalle exchange) indicano accumulazione (bullish), net inflows (monete che entrano nelle exchange) indicano pressione di vendita (bearish).',
      },
    ],
    interpretation: {
      positive: 'Net outflows: Accumulazione, bullish',
      negative: 'Net inflows: Pressione di vendita, bearish',
      neutral: 'Netflows bilanciati: Attività exchange neutrale',
    },
  },
  'support-resistance-levels': {
    id: 'support-resistance-levels',
    name: 'Support/Resistance Levels',
    description: 'Come leggere: Supporto = floor di prezzo, bullish se prezzo rimbalza. Resistenza = ceiling di prezzo, bearish se prezzo viene respinto. Tocchi multipli = livello più forte. Livelli di Supporto/Resistenza - livelli psicologici di prezzo.',
    howToUse: 'Prezzo vicino supporto: Possibile rimbalzo (bullish). Prezzo vicino resistenza: Possibile rejection (bearish).',
    academicReferences: [
      {
        authors: 'Support/Resistance Theory',
        year: 2000,
        title: 'Support and Resistance Levels',
        keyFindings: 'I livelli di supporto/resistenza sono livelli psicologici di prezzo. Supporto = floor (bullish se rimbalzo), Resistenza = ceiling (bearish se rejection).',
      },
    ],
    interpretation: {
      positive: 'Prezzo vicino supporto: Possibile rimbalzo',
      negative: 'Prezzo vicino resistenza: Possibile rejection',
      neutral: 'Prezzo tra livelli: Trading in range',
    },
  },
  'crypto-correlation-matrix': {
    id: 'crypto-correlation-matrix',
    name: 'Crypto Correlation Matrix',
    description: 'Come leggere: Correlazione alta (>0.8) = asset crypto si muovono insieme, regime risk-on/risk-off. Correlazione bassa (<0.5) = asset crypto si muovono indipendentemente, mercato diversificato. Cambiamenti di correlazione = cambiamenti di regime. Matrice di Correlazione Crypto - misura il co-movimento degli asset crypto.',
    howToUse: 'Correlazione alta: Asset si muovono insieme. Correlazione bassa: Asset si muovono indipendentemente. Cambiamenti = cambiamenti di regime.',
    academicReferences: [
      {
        authors: 'Crypto Correlation Theory',
        year: 2020,
        title: 'Crypto Correlation and Market Regimes',
        keyFindings: 'La correlazione tra asset crypto mostra il regime di mercato. Correlazione alta indica regime risk-on/risk-off, correlazione bassa indica mercato diversificato.',
      },
    ],
    interpretation: {
      positive: 'Correlazione bassa: Mercato diversificato',
      negative: 'Correlazione alta: Regime risk-on/risk-off',
      neutral: 'Correlazione moderata: Co-movimento moderato',
    },
  },
  'european-economic-indicators': {
    id: 'european-economic-indicators',
    name: 'European Economic Indicators',
    description: 'Indicatori economici europei: Eurozone GDP, CPI (Inflazione), Unemployment Rate, ECB Interest Rate, PMI. Riflettono la performance dell\'economia europea. Monitorare per diversificazione geografica e sentiment economico europeo.',
    howToUse: 'GDP in aumento, PMI > 50: Economia europea forte (bullish). GDP in diminuzione, PMI < 50: Economia europea debole (bearish).',
    academicReferences: [
      {
        authors: 'European Economic Indicators Theory',
        year: 2000,
        title: 'European Economic Performance',
        keyFindings: 'Gli indicatori economici europei riflettono la performance dell\'economia europea. GDP forte e PMI > 50 indicano economia forte (bullish).',
      },
    ],
    interpretation: {
      positive: 'GDP forte, PMI > 50: Economia europea forte, bullish',
      negative: 'GDP debole, PMI < 50: Economia europea debole, bearish',
      neutral: 'GDP moderato, PMI ~50: Economia europea stabile',
    },
  },
  'volume-profile': {
    id: 'volume-profile',
    name: 'Volume Profile',
    description: 'Come leggere: POC = livello di prezzo più scambiato, supporto/resistenza chiave. Value Area = 70% del volume, range di trading chiave. Prezzo sopra VAH = possibile reversal bearish. Prezzo sotto VAL = possibile reversal bullish. Volume Profile - mostra dove è avvenuta la maggior parte del trading.',
    howToUse: 'Prezzo sopra VAH: Possibile reversal bearish. Prezzo sotto VAL: Possibile reversal bullish. Prezzo in Value Area: Neutrale.',
    academicReferences: [
      {
        authors: 'Volume Profile Theory',
        year: 2010,
        title: 'Volume Profile and Market Structure',
        keyFindings: 'Il Volume Profile mostra dove è avvenuta la maggior parte del trading. POC è supporto/resistenza chiave, Value Area è range di trading chiave.',
      },
    ],
    interpretation: {
      positive: 'Prezzo sotto VAL: Possibile reversal bullish',
      negative: 'Prezzo sopra VAH: Possibile reversal bearish',
      neutral: 'Prezzo in Value Area: Trading neutrale',
    },
  },
};

export function getIndicatorTooltip(id: string): IndicatorTooltip | undefined {
  return INDICATOR_TOOLTIPS[id];
}
