/**
 * Academic Trading Strategies - Tradelia
 * 
 * Best Practice: Strategie basate su letteratura accademica peer-reviewed
 * References: Prado (2018), Chan (2013), Aronson (2006), Lo & MacKinlay (1999)
 */

export type StrategyType = 
  | 'moving-average-crossover'
  | 'rsi-mean-reversion'
  | 'macd-trend'
  | 'bollinger-bands'
  | 'momentum'
  | 'mean-reversion'
  | 'breakout'
  | 'atr-trailing-stop'
  | 'keltner-channels'
  | 'stochastic-oscillator';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface StrategyParameter {
  id: string;
  label: string;
  type: 'number' | 'integer' | 'range';
  min: number;
  max: number;
  step: number;
  default: number;
  academicTooltip: {
    description: string;
    source: string;
    recommendation?: string;
    academicContext?: string;
  };
}

export interface AcademicStrategy {
  id: StrategyType;
  name: string;
  nameEn: string;
  category: 'basic' | 'advanced';
  description: string;
  descriptionEn: string;
  academicSource: string;
  parameters: StrategyParameter[];
  recommendedTimeframes: Timeframe[];
  academicNotes: string;
  academicNotesEn: string;
}

export const ACADEMIC_STRATEGIES: AcademicStrategy[] = [
  {
    id: 'moving-average-crossover',
    name: 'Moving Average Crossover',
    nameEn: 'Moving Average Crossover',
    category: 'basic',
    description: 'Strategia basata su crossover di medie mobili. Segnale long quando MA veloce incrocia sopra MA lenta.',
    descriptionEn: 'Strategy based on moving average crossovers. Long signal when fast MA crosses above slow MA.',
    academicSource: 'Brock, W., Lakonishok, J., & LeBaron, B. (1992). Simple technical trading rules and the stochastic properties of stock returns. Journal of Finance, 47(5), 1731-1764. https://doi.org/10.2307/2328994',
    parameters: [
      {
        id: 'fastMA',
        label: 'Fast MA Period',
        type: 'integer',
        min: 5,
        max: 50,
        step: 1,
        default: 10,
        academicTooltip: {
          description: 'Periodo della media mobile veloce. Valori tipici: 5-20 per timeframe brevi, 10-50 per timeframe lunghi.',
          source: 'Brock et al. (1992) suggeriscono 1-10 giorni per MA veloce. Chan (2013) raccomanda 5-20 per evitare overfitting.',
          recommendation: 'Per timeframe giornalieri: 10-20. Per timeframe intraday: 5-10.',
          academicContext: 'Brock et al. (1992) trovarono che combinazioni 1-10 giorni per MA veloce e 50-200 per MA lenta mostravano significatività statistica.'
        }
      },
      {
        id: 'slowMA',
        label: 'Slow MA Period',
        type: 'integer',
        min: 20,
        max: 200,
        step: 5,
        default: 50,
        academicTooltip: {
          description: 'Periodo della media mobile lenta. Deve essere significativamente maggiore della MA veloce.',
          source: 'Brock et al. (1992) suggeriscono 50-200 giorni. Il rapporto ottimale è tipicamente 2:1 o 5:1 (slow:fast).',
          recommendation: 'Rapporto consigliato: slowMA / fastMA = 2-5. Es: fast=10, slow=20-50.',
          academicContext: 'Brock et al. (1992) trovarono che combinazioni con slow MA 50-200 giorni mostravano rendimenti aggiustati per rischio superiori.'
        }
      }
    ],
    recommendedTimeframes: ['1h', '4h', '1d', '1w'],
    academicNotes: 'La strategia MA Crossover è una delle più studiate in letteratura. Brock et al. (1992) dimostrarono significatività statistica per combinazioni specifiche. Attenzione: performance degrada con frequenza di trading eccessiva.',
    academicNotesEn: 'MA Crossover is one of the most studied strategies in literature. Brock et al. (1992) demonstrated statistical significance for specific combinations. Warning: performance degrades with excessive trading frequency.'
  },
  {
    id: 'rsi-mean-reversion',
    name: 'RSI Mean Reversion',
    nameEn: 'RSI Mean Reversion',
    category: 'basic',
    description: 'Strategia di mean reversion basata su RSI. Segnale long quando RSI < soglia oversold, short quando RSI > soglia overbought.',
    descriptionEn: 'Mean reversion strategy based on RSI. Long signal when RSI < oversold threshold, short when RSI > overbought threshold.',
    academicSource: 'Wilder, J.W. (1978). New Concepts in Technical Trading Systems. Trend Research. ISBN: 978-0894590276',
    parameters: [
      {
        id: 'rsiPeriod',
        label: 'RSI Period',
        type: 'integer',
        min: 5,
        max: 30,
        step: 1,
        default: 14,
        academicTooltip: {
          description: 'Periodo di calcolo RSI. Wilder (1978) raccomanda 14 come standard, ma può essere ottimizzato.',
          source: 'Wilder (1978) stabilì 14 come periodo standard. Chan (2013) suggerisce 9-14 per timeframe brevi, 14-21 per timeframe lunghi.',
          recommendation: 'Standard: 14. Per timeframe < 1h: 9-14. Per timeframe > 1d: 14-21.',
          academicContext: 'Wilder (1978) scelse 14 basandosi su cicli di mercato. Studi successivi confermano che 14 è ottimale per la maggior parte dei mercati.'
        }
      },
      {
        id: 'oversold',
        label: 'Oversold Threshold',
        type: 'integer',
        min: 10,
        max: 40,
        step: 5,
        default: 30,
        academicTooltip: {
          description: 'Soglia RSI per segnale di acquisto (oversold). Valori tipici: 20-30.',
          source: 'Wilder (1978) suggerisce 30 come soglia oversold standard. Valori più estremi (20) riducono falsi segnali ma aumentano il rischio di mancare opportunità.',
          recommendation: 'Conservativo: 30. Aggressivo: 20-25. Per mercati volatili: 25-30.',
          academicContext: 'Wilder (1978) stabilì 30/70 come soglie standard. Studi empirici mostrano che 20/80 sono più selettive ma meno frequenti.'
        }
      },
      {
        id: 'overbought',
        label: 'Overbought Threshold',
        type: 'integer',
        min: 60,
        max: 90,
        step: 5,
        default: 70,
        academicTooltip: {
          description: 'Soglia RSI per segnale di vendita (overbought). Valori tipici: 70-80.',
          source: 'Wilder (1978) suggerisce 70 come soglia overbought standard. Simmetrico a oversold per coerenza.',
          recommendation: 'Conservativo: 70. Aggressivo: 75-80. Deve essere > 50 + (100 - oversold).',
          academicContext: 'La simmetria 30/70 è stata validata empiricamente. Asimmetrie possono essere ottimizzate ma aumentano il rischio di overfitting.'
        }
      }
    ],
    recommendedTimeframes: ['15m', '30m', '1h', '4h', '1d'],
    academicNotes: 'RSI è uno degli oscillatori più studiati. Wilder (1978) lo introdusse per identificare condizioni di ipercomprato/ipervenduto. Attenzione: in trend forti, RSI può rimanere in zone estreme per periodi prolungati.',
    academicNotesEn: 'RSI is one of the most studied oscillators. Wilder (1978) introduced it to identify overbought/oversold conditions. Warning: in strong trends, RSI can remain in extreme zones for extended periods.'
  },
  {
    id: 'macd-trend',
    name: 'MACD Trend Following',
    nameEn: 'MACD Trend Following',
    category: 'basic',
    description: 'Strategia trend-following basata su MACD. Segnale long quando MACD line incrocia sopra signal line.',
    descriptionEn: 'Trend-following strategy based on MACD. Long signal when MACD line crosses above signal line.',
    academicSource: 'Appel, G. (2005). Technical Analysis: Power Tools for Active Investors. Financial Times Prentice Hall. ISBN: 978-0131479029',
    parameters: [
      {
        id: 'fastEMA',
        label: 'Fast EMA Period',
        type: 'integer',
        min: 8,
        max: 26,
        step: 1,
        default: 12,
        academicTooltip: {
          description: 'Periodo EMA veloce per calcolo MACD. Standard: 12.',
          source: 'Appel (2005) stabilì 12 come standard. Può essere ottimizzato ma 12 è validato empiricamente.',
          recommendation: 'Standard: 12. Range ottimale: 10-15 per la maggior parte dei mercati.',
          academicContext: 'Appel (2005) scelse 12 basandosi su cicli di mercato. Valori < 8 aumentano rumore, valori > 20 riducono sensibilità.'
        }
      },
      {
        id: 'slowEMA',
        label: 'Slow EMA Period',
        type: 'integer',
        min: 21,
        max: 52,
        step: 1,
        default: 26,
        academicTooltip: {
          description: 'Periodo EMA lenta per calcolo MACD. Standard: 26.',
          source: 'Appel (2005) stabilì 26 come standard. Il rapporto 12/26 è stato validato in numerosi studi.',
          recommendation: 'Standard: 26. Range ottimale: 24-30. Rapporto consigliato: slowEMA / fastEMA ≈ 2.17.',
          academicContext: 'Il rapporto 12/26 (≈2.17) è stato scelto per bilanciare sensibilità e stabilità. Valori diversi possono essere ottimizzati ma aumentano rischio overfitting.'
        }
      },
      {
        id: 'signalPeriod',
        label: 'Signal Line Period',
        type: 'integer',
        min: 6,
        max: 12,
        step: 1,
        default: 9,
        academicTooltip: {
          description: 'Periodo EMA per signal line. Standard: 9.',
          source: 'Appel (2005) stabilì 9 come standard. Questo valore è stato validato empiricamente.',
          recommendation: 'Standard: 9. Range ottimale: 8-10. Valori < 6 aumentano falsi segnali.',
          academicContext: 'Il valore 9 è stato scelto per bilanciare tempestività e stabilità del segnale. Valori più bassi generano più segnali ma più falsi positivi.'
        }
      }
    ],
    recommendedTimeframes: ['1h', '4h', '1d', '1w'],
    academicNotes: 'MACD è uno degli indicatori più popolari. Appel (2005) lo sviluppò per identificare cambiamenti di momentum. Attenzione: in mercati laterali, MACD genera molti falsi segnali.',
    academicNotesEn: 'MACD is one of the most popular indicators. Appel (2005) developed it to identify momentum changes. Warning: in sideways markets, MACD generates many false signals.'
  },
  {
    id: 'bollinger-bands',
    name: 'Bollinger Bands',
    nameEn: 'Bollinger Bands',
    category: 'basic',
    description: 'Strategia basata su Bollinger Bands. Segnale long quando prezzo tocca banda inferiore, short quando tocca banda superiore.',
    descriptionEn: 'Strategy based on Bollinger Bands. Long signal when price touches lower band, short when touches upper band.',
    academicSource: 'Bollinger, J. (2001). Bollinger on Bollinger Bands. McGraw-Hill. ISBN: 978-0071373685',
    parameters: [
      {
        id: 'bbPeriod',
        label: 'BB Period',
        type: 'integer',
        min: 10,
        max: 30,
        step: 1,
        default: 20,
        academicTooltip: {
          description: 'Periodo per calcolo media mobile centrale. Standard: 20.',
          source: 'Bollinger (2001) raccomanda 20 come periodo standard. Valori 10-30 sono validi ma 20 è ottimale.',
          recommendation: 'Standard: 20. Range ottimale: 18-22. Per timeframe < 1h: 15-20.',
          academicContext: 'Bollinger (2001) scelse 20 basandosi su cicli di trading. Valori < 15 aumentano volatilità, valori > 25 riducono sensibilità.'
        }
      },
      {
        id: 'bbStdDev',
        label: 'Standard Deviations',
        type: 'number',
        min: 1.5,
        max: 3.0,
        step: 0.1,
        default: 2.0,
        academicTooltip: {
          description: 'Numero di deviazioni standard per le bande. Standard: 2.0.',
          source: 'Bollinger (2001) stabilì 2.0 come standard. Valori 1.5-2.5 sono comuni, 2.0 cattura ~95% dei movimenti.',
          recommendation: 'Standard: 2.0. Conservativo: 2.5. Aggressivo: 1.5-1.8.',
          academicContext: 'Bollinger (2001) scelse 2.0 perché in distribuzione normale cattura ~95% dei movimenti. Valori < 1.5 generano troppi segnali, valori > 2.5 sono troppo conservativi.'
        }
      }
    ],
    recommendedTimeframes: ['15m', '30m', '1h', '4h', '1d'],
    academicNotes: 'Bollinger Bands combinano volatilità e trend. Bollinger (2001) le sviluppò per identificare condizioni estreme. Attenzione: in trend forti, il prezzo può rimanere vicino a una banda per periodi prolungati.',
    academicNotesEn: 'Bollinger Bands combine volatility and trend. Bollinger (2001) developed them to identify extreme conditions. Warning: in strong trends, price can remain near one band for extended periods.'
  },
  {
    id: 'momentum',
    name: 'Momentum Strategy',
    nameEn: 'Momentum Strategy',
    category: 'advanced',
    description: 'Strategia momentum basata su rate of change. Segnale long quando momentum > soglia, short quando momentum < -soglia.',
    descriptionEn: 'Momentum strategy based on rate of change. Long signal when momentum > threshold, short when momentum < -threshold.',
    academicSource: 'Jegadeesh, N., & Titman, S. (1993). Returns to buying winners and selling losers: Implications for stock market efficiency. Journal of Finance, 48(1), 65-91. https://doi.org/10.2307/2328882',
    parameters: [
      {
        id: 'momentumPeriod',
        label: 'Momentum Period',
        type: 'integer',
        min: 5,
        max: 60,
        step: 1,
        default: 12,
        academicTooltip: {
          description: 'Periodo per calcolo momentum (rate of change). Valori tipici: 10-20.',
          source: 'Jegadeesh & Titman (1993) trovarono che momentum 3-12 mesi mostra significatività. Chan (2013) suggerisce 10-20 per timeframe giornalieri.',
          recommendation: 'Per timeframe giornalieri: 10-20. Per timeframe intraday: 5-15. Standard: 12.',
          academicContext: 'Jegadeesh & Titman (1993) dimostrarono che momentum 3-12 mesi è statisticamente significativo. Valori < 5 sono troppo rumorosi, valori > 60 perdono sensibilità.'
        }
      },
      {
        id: 'momentumThreshold',
        label: 'Momentum Threshold',
        type: 'number',
        min: 0.5,
        max: 5.0,
        step: 0.1,
        default: 2.0,
        academicTooltip: {
          description: 'Soglia minima per segnale momentum. Valori tipici: 1.5-3.0.',
          source: 'Chan (2013) raccomanda soglie 1.5-3.0% per evitare falsi segnali. Valori più alti riducono frequenza ma aumentano qualità.',
          recommendation: 'Conservativo: 2.5-3.0. Aggressivo: 1.5-2.0. Deve essere adattato al timeframe.',
          academicContext: 'Soglie troppo basse (< 1.0) generano molti falsi segnali. Soglie troppo alte (> 4.0) riducono eccessivamente la frequenza di trading.'
        }
      }
    ],
    recommendedTimeframes: ['1h', '4h', '1d', '1w'],
    academicNotes: 'Momentum è una delle anomalie più studiate in finanza. Jegadeesh & Titman (1993) dimostrarono significatività per momentum 3-12 mesi. Attenzione: momentum può invertirsi rapidamente (reversal effect).',
    academicNotesEn: 'Momentum is one of the most studied anomalies in finance. Jegadeesh & Titman (1993) demonstrated significance for 3-12 month momentum. Warning: momentum can reverse quickly (reversal effect).'
  },
  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    nameEn: 'Mean Reversion',
    category: 'advanced',
    description: 'Strategia di mean reversion basata su deviazione dalla media. Segnale long quando prezzo < media - deviazione, short quando prezzo > media + deviazione.',
    descriptionEn: 'Mean reversion strategy based on deviation from mean. Long signal when price < mean - deviation, short when price > mean + deviation.',
    academicSource: 'Lo, A.W., & MacKinlay, A.C. (1999). A Non-Random Walk Down Wall Street. Princeton University Press. ISBN: 978-0691118295',
    parameters: [
      {
        id: 'meanPeriod',
        label: 'Mean Period',
        type: 'integer',
        min: 10,
        max: 100,
        step: 5,
        default: 20,
        academicTooltip: {
          description: 'Periodo per calcolo media mobile. Valori tipici: 20-50.',
          source: 'Lo & MacKinlay (1999) suggeriscono 20-50 per mean reversion. Periodi più lunghi catturano trend, periodi più brevi sono più sensibili.',
          recommendation: 'Standard: 20. Range ottimale: 20-50. Per timeframe < 1h: 15-30.',
          academicContext: 'Lo & MacKinlay (1999) dimostrarono che mean reversion è più forte su orizzonti brevi (giornalieri) e si indebolisce su orizzonti lunghi.'
        }
      },
      {
        id: 'deviationMultiplier',
        label: 'Deviation Multiplier',
        type: 'number',
        min: 1.0,
        max: 3.0,
        step: 0.1,
        default: 2.0,
        academicTooltip: {
          description: 'Moltiplicatore di deviazione standard per segnali. Standard: 2.0.',
          source: 'Lo & MacKinlay (1999) suggeriscono 1.5-2.5 deviazioni standard. Valori più alti riducono frequenza ma aumentano qualità.',
          recommendation: 'Standard: 2.0. Conservativo: 2.5. Aggressivo: 1.5-1.8.',
          academicContext: 'In distribuzione normale, 2.0 deviazioni standard catturano ~95% dei movimenti. Valori < 1.5 generano troppi segnali, valori > 2.5 sono troppo conservativi.'
        }
      }
    ],
    recommendedTimeframes: ['15m', '30m', '1h', '4h', '1d'],
    academicNotes: 'Mean reversion è un fenomeno ben documentato. Lo & MacKinlay (1999) dimostrarono che è più forte su orizzonti brevi. Attenzione: in trend forti, mean reversion fallisce.',
    academicNotesEn: 'Mean reversion is a well-documented phenomenon. Lo & MacKinlay (1999) demonstrated it is stronger on short horizons. Warning: in strong trends, mean reversion fails.'
  },
  {
    id: 'atr-trailing-stop',
    name: 'ATR Trailing Stop',
    nameEn: 'ATR Trailing Stop',
    category: 'advanced',
    description: 'Strategia basata su trailing stop dinamico usando ATR. Stop loss si adatta alla volatilità.',
    descriptionEn: 'Strategy based on dynamic trailing stop using ATR. Stop loss adapts to volatility.',
    academicSource: 'Kaufman, P.J. (2013). Trading Systems and Methods. Wiley. ISBN: 978-1118443926',
    parameters: [
      {
        id: 'atrPeriod',
        label: 'ATR Period',
        type: 'integer',
        min: 7,
        max: 30,
        step: 1,
        default: 14,
        academicTooltip: {
          description: 'Periodo per calcolo ATR. Standard: 14.',
          source: 'Kaufman (2013) raccomanda 14 come periodo standard. Wilder (1978) stabilì 14 per ATR, validato empiricamente.',
          recommendation: 'Standard: 14. Range ottimale: 10-20. Per timeframe < 1h: 10-14.',
          academicContext: 'Wilder (1978) scelse 14 per ATR basandosi su cicli di mercato. Valori < 7 sono troppo sensibili, valori > 30 perdono reattività.'
        }
      },
      {
        id: 'atrMultiplier',
        label: 'ATR Multiplier',
        type: 'number',
        min: 1.0,
        max: 5.0,
        step: 0.1,
        default: 2.0,
        academicTooltip: {
          description: 'Moltiplicatore ATR per distanza stop loss. Standard: 2.0.',
          source: 'Kaufman (2013) suggerisce 1.5-3.0 ATR per stop loss. Valori più alti riducono stop out ma aumentano rischio per trade.',
          recommendation: 'Standard: 2.0. Conservativo: 2.5-3.0. Aggressivo: 1.5-2.0.',
          academicContext: 'Kaufman (2013) dimostrò che 2.0 ATR bilancia protezione e spazio per movimento. Valori < 1.5 generano troppi stop out, valori > 3.0 espongono a rischio eccessivo.'
        }
      }
    ],
    recommendedTimeframes: ['15m', '30m', '1h', '4h', '1d'],
    academicNotes: 'ATR Trailing Stop è una tecnica avanzata per gestione rischio. Kaufman (2013) la raccomanda per adattarsi alla volatilità. Attenzione: in mercati volatili, stop può essere troppo largo.',
    academicNotesEn: 'ATR Trailing Stop is an advanced risk management technique. Kaufman (2013) recommends it to adapt to volatility. Warning: in volatile markets, stop can be too wide.'
  }
];

export function getStrategyById(id: StrategyType): AcademicStrategy | undefined {
  return ACADEMIC_STRATEGIES.find(s => s.id === id);
}

export function getStrategiesByCategory(category: 'basic' | 'advanced' | 'all'): AcademicStrategy[] {
  if (category === 'all') return ACADEMIC_STRATEGIES;
  return ACADEMIC_STRATEGIES.filter(s => s.category === category);
}
