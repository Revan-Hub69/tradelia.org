/**
 * Multi-Timeframe Analysis
 * 
 * Analisi multi-timeframe per conferma segnali
 * Timeframes: 1m, 5m, 15m, 1h, 4h, 1d
 * 
 * Strategia:
 * - Scalping: 1m, 5m, 15m
 * - Intraday: 5m, 15m, 1h
 * - Swing: 1h, 4h, 1d
 * 
 * Riferimenti:
 * - Elder (2002) - "Trading for a Living" (Triple Screen System)
 */

export interface TimeframeSignal {
  timeframe: string;
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  confidence: number;
  trend: 'uptrend' | 'downtrend' | 'sideways';
  indicators: {
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number };
    volume?: number;
    priceChange?: number;
  };
}

export interface MultiTimeframeAnalysis {
  timeframes: TimeframeSignal[];
  consensus: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  consensusConfidence: number;
  alignment: number; // 0-100: % timeframes aligned
  recommendation: string;
}

/**
 * Analizza multiple timeframes e calcola consensus
 */
export function analyzeMultiTimeframe(
  signals: TimeframeSignal[]
): MultiTimeframeAnalysis {
  if (signals.length === 0) {
    return {
      timeframes: [],
      consensus: 'neutral',
      consensusConfidence: 0,
      alignment: 0,
      recommendation: 'No data available',
    };
  }

  // Conta segnali per direzione
  const signalCounts = {
    'strong-buy': 0,
    'buy': 0,
    'neutral': 0,
    'sell': 0,
    'strong-sell': 0,
  };

  let totalConfidence = 0;

  signals.forEach((signal) => {
    signalCounts[signal.signal]++;
    totalConfidence += signal.confidence;
  });

  // Calcola consensus
  const maxCount = Math.max(...Object.values(signalCounts));
  const consensus = Object.entries(signalCounts).find(
    ([, count]) => count === maxCount
  )?.[0] as 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';

  // Calcola confidence media
  const consensusConfidence = totalConfidence / signals.length;

  // Calcola alignment (% timeframes allineati)
  const alignedCount = signals.filter((s) => s.signal === consensus).length;
  const alignment = (alignedCount / signals.length) * 100;

  // Genera recommendation
  let recommendation = '';
  if (alignment >= 80) {
    recommendation = `Strong ${consensus} signal - ${alignment.toFixed(0)}% timeframes aligned`;
  } else if (alignment >= 60) {
    recommendation = `${consensus} signal - ${alignment.toFixed(0)}% timeframes aligned`;
  } else {
    recommendation = `Mixed signals - ${alignment.toFixed(0)}% alignment. Wait for better setup.`;
  }

  return {
    timeframes: signals,
    consensus,
    consensusConfidence,
    alignment,
    recommendation,
  };
}

/**
 * Triple Screen System (Elder)
 * 
 * Screen 1: Trend (timeframe superiore)
 * Screen 2: Momentum (timeframe medio)
 * Screen 3: Entry (timeframe inferiore)
 */
export function tripleScreenAnalysis(
  longTerm: TimeframeSignal, // 1h, 4h, 1d
  mediumTerm: TimeframeSignal, // 15m, 1h
  shortTerm: TimeframeSignal // 1m, 5m
): {
  trend: 'uptrend' | 'downtrend' | 'sideways';
  momentum: 'bullish' | 'bearish' | 'neutral';
  entry: 'buy' | 'sell' | 'wait';
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
} {
  // Screen 1: Trend (long-term)
  const trend = longTerm.trend;

  // Screen 2: Momentum (medium-term)
  let momentum: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (mediumTerm.signal.includes('buy')) momentum = 'bullish';
  else if (mediumTerm.signal.includes('sell')) momentum = 'bearish';

  // Screen 3: Entry (short-term)
  let entry: 'buy' | 'sell' | 'wait' = 'wait';
  if (shortTerm.signal.includes('buy')) entry = 'buy';
  else if (shortTerm.signal.includes('sell')) entry = 'sell';

  // Generate signal
  let signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
  let confidence = 50;

  // Uptrend + Bullish momentum + Buy entry = STRONG BUY
  if (trend === 'uptrend' && momentum === 'bullish' && entry === 'buy') {
    signal = 'STRONG_BUY';
    confidence = 85;
  }
  // Uptrend + Bullish momentum + Sell entry = Wait (correzione)
  else if (trend === 'uptrend' && momentum === 'bullish' && entry === 'sell') {
    signal = 'NEUTRAL';
    confidence = 40;
  }
  // Downtrend + Bearish momentum + Sell entry = STRONG SELL
  else if (trend === 'downtrend' && momentum === 'bearish' && entry === 'sell') {
    signal = 'STRONG_SELL';
    confidence = 85;
  }
  // Downtrend + Bearish momentum + Buy entry = Wait (rimbalzo)
  else if (trend === 'downtrend' && momentum === 'bearish' && entry === 'buy') {
    signal = 'NEUTRAL';
    confidence = 40;
  }
  // Sideways = NEUTRAL
  else if (trend === 'sideways') {
    signal = 'NEUTRAL';
    confidence = 30;
  }
  // Conflitti = NEUTRAL
  else {
    signal = 'NEUTRAL';
    confidence = 50;
  }

  return { trend, momentum, entry, signal, confidence };
}

/**
 * Scalping Multi-Timeframe (1m, 5m, 15m)
 */
export function scalpingMultiTimeframe(
  m1: TimeframeSignal,
  m5: TimeframeSignal,
  m15: TimeframeSignal
): {
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  timeframeAlignment: number;
} {
  const analysis = analyzeMultiTimeframe([m1, m5, m15]);

  // Per scalping, allineamento 1m e 5m è critico
  const m1m5Aligned = m1.signal === m5.signal;
  const allAligned = m1.signal === m5.signal && m5.signal === m15.signal;

  let signal = analysis.consensus;
  let confidence = analysis.consensusConfidence;

  // Boost confidence se 1m e 5m allineati
  if (m1m5Aligned) {
    confidence += 10;
  }

  // Boost se tutti allineati
  if (allAligned) {
    confidence += 15;
    if (signal === 'buy') signal = 'strong-buy';
    else if (signal === 'sell') signal = 'strong-sell';
  }

  // Penalizza se conflitti
  if (!m1m5Aligned) {
    confidence -= 20;
    if (confidence < 50) signal = 'neutral';
  }

  confidence = Math.min(95, Math.max(30, confidence));

  return {
    signal: signal.toUpperCase().replace('-', '_') as any,
    confidence,
    timeframeAlignment: analysis.alignment,
  };
}

/**
 * Intraday Multi-Timeframe (5m, 15m, 1h)
 */
export function intradayMultiTimeframe(
  m5: TimeframeSignal,
  m15: TimeframeSignal,
  h1: TimeframeSignal
): {
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  trend: 'uptrend' | 'downtrend' | 'sideways';
} {
  const analysis = analyzeMultiTimeframe([m5, m15, h1]);

  // Trend dal timeframe più lungo (1h)
  const trend = h1.trend;

  let signal = analysis.consensus;
  let confidence = analysis.consensusConfidence;

  // Boost se trend e segnali allineati
  if (trend === 'uptrend' && (signal === 'buy' || signal === 'strong-buy')) {
    confidence += 15;
    if (signal === 'buy') signal = 'strong-buy';
  } else if (trend === 'downtrend' && (signal === 'sell' || signal === 'strong-sell')) {
    confidence += 15;
    if (signal === 'sell') signal = 'strong-sell';
  }

  // Penalizza se conflitto trend-segnali
  if (trend === 'uptrend' && (signal === 'sell' || signal === 'strong-sell')) {
    confidence -= 30;
    signal = 'neutral';
  } else if (trend === 'downtrend' && (signal === 'buy' || signal === 'strong-buy')) {
    confidence -= 30;
    signal = 'neutral';
  }

  confidence = Math.min(95, Math.max(40, confidence));

  return {
    signal: signal.toUpperCase().replace('-', '_') as any,
    confidence,
    trend,
  };
}

