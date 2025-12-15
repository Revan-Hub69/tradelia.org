/**
 * Order Flow Indicators
 * 
 * Indicatori basati su order flow per scalping/intraday
 * Obiettivo: Win Rate 80%+
 * 
 * Riferimenti Accademici:
 * - Kyle (1985) - "Continuous Auctions and Insider Trading"
 * - Hasbrouck (2007) - "Empirical Market Microstructure"
 * - Easley et al. (2012) - "The Volume Clock: Insights into the High-Frequency Paradigm"
 */

export interface Trade {
  price: number;
  quantity: number;
  timestamp: number;
  isBuyerMaker: boolean; // true = seller aggressivo, false = buyer aggressivo
  tradeId?: string;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  side: 'bid' | 'ask';
}

/**
 * Delta (Buy vs Sell Pressure)
 * 
 * Calcola differenza tra volume buy e sell
 * Delta positivo = più pressione buy
 * Delta negativo = più pressione sell
 * 
 * Formula: Delta = Σ(Buy Volume) - Σ(Sell Volume)
 */
export function calculateDelta(trades: Trade[]): {
  delta: number;
  buyVolume: number;
  sellVolume: number;
  deltaPercent: number;
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
} {
  let buyVolume = 0;
  let sellVolume = 0;

  trades.forEach((trade) => {
    if (trade.isBuyerMaker) {
      // Seller aggressivo = vendita
      sellVolume += trade.quantity;
    } else {
      // Buyer aggressivo = acquisto
      buyVolume += trade.quantity;
    }
  });

  const delta = buyVolume - sellVolume;
  const totalVolume = buyVolume + sellVolume;
  const deltaPercent = totalVolume > 0 ? (delta / totalVolume) * 100 : 0;

  let signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  if (deltaPercent > 20) signal = 'strong-buy';
  else if (deltaPercent > 5) signal = 'buy';
  else if (deltaPercent < -20) signal = 'strong-sell';
  else if (deltaPercent < -5) signal = 'sell';
  else signal = 'neutral';

  return { delta, buyVolume, sellVolume, deltaPercent, signal };
}

/**
 * Cumulative Volume Delta (CVD)
 * 
 * Delta cumulativo nel tempo
 * Mostra accumulazione/distribuzione
 * 
 * Formula: CVD(t) = CVD(t-1) + Delta(t)
 */
export function calculateCVD(trades: Trade[]): {
  cvd: number[];
  cvdTrend: 'accumulating' | 'distributing' | 'neutral';
  cvdSlope: number;
} {
  const deltas: number[] = [];
  let buyVolume = 0;
  let sellVolume = 0;

  trades.forEach((trade) => {
    if (trade.isBuyerMaker) {
      sellVolume += trade.quantity;
    } else {
      buyVolume += trade.quantity;
    }
    deltas.push(buyVolume - sellVolume);
  });

  const cvd = deltas;
  const cvdSlope = cvd.length > 1 ? cvd[cvd.length - 1] - cvd[0] : 0;

  let cvdTrend: 'accumulating' | 'distributing' | 'neutral';
  if (cvdSlope > 0) cvdTrend = 'accumulating';
  else if (cvdSlope < 0) cvdTrend = 'distributing';
  else cvdTrend = 'neutral';

  return { cvd, cvdTrend, cvdSlope };
}

/**
 * Taker Buy/Sell Ratio
 * 
 * Rapporto tra ordini aggressivi buy vs sell
 * Ratio > 1 = più aggressività buy
 * Ratio < 1 = più aggressività sell
 * 
 * Formula: Taker Buy Volume / Taker Sell Volume
 */
export function calculateTakerRatio(trades: Trade[]): {
  ratio: number;
  buyVolume: number;
  sellVolume: number;
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
} {
  let buyVolume = 0;
  let sellVolume = 0;

  trades.forEach((trade) => {
    if (trade.isBuyerMaker) {
      sellVolume += trade.quantity;
    } else {
      buyVolume += trade.quantity;
    }
  });

  const ratio = sellVolume > 0 ? buyVolume / sellVolume : 1;

  let signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  if (ratio > 1.5) signal = 'strong-buy';
  else if (ratio > 1.1) signal = 'buy';
  else if (ratio < 0.67) signal = 'strong-sell'; // 1/1.5
  else if (ratio < 0.91) signal = 'sell'; // 1/1.1
  else signal = 'neutral';

  return { ratio, buyVolume, sellVolume, signal };
}

/**
 * Order Book Imbalance
 * 
 * Imbalance tra bid e ask nel order book
 * Imbalance positivo = più pressione buy
 * Imbalance negativo = più pressione sell
 * 
 * Formula: (Bid Volume - Ask Volume) / (Bid Volume + Ask Volume)
 */
export function calculateOrderBookImbalance(
  bids: OrderBookLevel[],
  asks: OrderBookLevel[]
): {
  imbalance: number;
  bidVolume: number;
  askVolume: number;
  imbalancePercent: number;
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
} {
  const bidVolume = bids.reduce((sum, level) => sum + level.quantity, 0);
  const askVolume = asks.reduce((sum, level) => sum + level.quantity, 0);

  const totalVolume = bidVolume + askVolume;
  const imbalance = bidVolume - askVolume;
  const imbalancePercent = totalVolume > 0 ? (imbalance / totalVolume) * 100 : 0;

  let signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  if (imbalancePercent > 20) signal = 'strong-buy';
  else if (imbalancePercent > 5) signal = 'buy';
  else if (imbalancePercent < -20) signal = 'strong-sell';
  else if (imbalancePercent < -5) signal = 'sell';
  else signal = 'neutral';

  return { imbalance, bidVolume, askVolume, imbalancePercent, signal };
}

/**
 * Volume-Weighted Delta
 * 
 * Delta ponderato per volume
 * Più accurato del delta semplice
 * 
 * Formula: Σ(Delta × Volume) / Σ(Volume)
 */
export function calculateVolumeWeightedDelta(trades: Trade[]): {
  vwd: number;
  totalVolume: number;
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
} {
  let weightedSum = 0;
  let totalVolume = 0;

  trades.forEach((trade) => {
    const delta = trade.isBuyerMaker ? -trade.quantity : trade.quantity;
    weightedSum += delta * trade.quantity;
    totalVolume += trade.quantity;
  });

  const vwd = totalVolume > 0 ? weightedSum / totalVolume : 0;

  let signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  if (vwd > 0.2) signal = 'strong-buy';
  else if (vwd > 0.05) signal = 'buy';
  else if (vwd < -0.2) signal = 'strong-sell';
  else if (vwd < -0.05) signal = 'sell';
  else signal = 'neutral';

  return { vwd, totalVolume, signal };
}

/**
 * Market Depth Imbalance
 * 
 * Imbalance a diversi livelli di profondità
 * Mostra support/resistance dinamici
 */
export function calculateMarketDepthImbalance(
  bids: OrderBookLevel[],
  asks: OrderBookLevel[],
  levels: number[] = [1, 5, 10, 20]
): {
  level: number;
  bidVolume: number;
  askVolume: number;
  imbalance: number;
  imbalancePercent: number;
}[] {
  return levels.map((level) => {
    const topBids = bids.slice(0, level);
    const topAsks = asks.slice(0, level);

    const bidVolume = topBids.reduce((sum, l) => sum + l.quantity, 0);
    const askVolume = topAsks.reduce((sum, l) => sum + l.quantity, 0);

    const totalVolume = bidVolume + askVolume;
    const imbalance = bidVolume - askVolume;
    const imbalancePercent = totalVolume > 0 ? (imbalance / totalVolume) * 100 : 0;

    return {
      level,
      bidVolume,
      askVolume,
      imbalance,
      imbalancePercent,
    };
  });
}

/**
 * Time & Sales Analysis
 * 
 * Analizza flusso di trade in tempo reale
 * Identifica pattern aggressività
 */
export function analyzeTimeAndSales(
  trades: Trade[],
  timeWindow = 60 // secondi
): {
  tradesCount: number;
  buyTrades: number;
  sellTrades: number;
  avgTradeSize: number;
  largestTrade: Trade | null;
  tradeRate: number; // trades per secondo
  aggressiveness: 'very-high' | 'high' | 'medium' | 'low';
} {
  if (trades.length === 0) {
    return {
      tradesCount: 0,
      buyTrades: 0,
      sellTrades: 0,
      avgTradeSize: 0,
      largestTrade: null,
      tradeRate: 0,
      aggressiveness: 'low',
    };
  }

  const now = Date.now();
  const windowStart = now - timeWindow * 1000;
  const recentTrades = trades.filter((t) => t.timestamp >= windowStart);

  const buyTrades = recentTrades.filter((t) => !t.isBuyerMaker).length;
  const sellTrades = recentTrades.filter((t) => t.isBuyerMaker).length;

  const totalVolume = recentTrades.reduce((sum, t) => sum + t.quantity, 0);
  const avgTradeSize = totalVolume / recentTrades.length;

  const largestTrade = recentTrades.reduce((max, t) =>
    t.quantity > max.quantity ? t : max
  );

  const timeSpan = (now - windowStart) / 1000; // secondi
  const tradeRate = timeSpan > 0 ? recentTrades.length / timeSpan : 0;

  let aggressiveness: 'very-high' | 'high' | 'medium' | 'low';
  if (tradeRate > 10) aggressiveness = 'very-high';
  else if (tradeRate > 5) aggressiveness = 'high';
  else if (tradeRate > 1) aggressiveness = 'medium';
  else aggressiveness = 'low';

  return {
    tradesCount: recentTrades.length,
    buyTrades,
    sellTrades,
    avgTradeSize,
    largestTrade,
    tradeRate,
    aggressiveness,
  };
}

/**
 * Combined Order Flow Signal
 * 
 * Combina tutti gli indicatori order flow per segnale finale
 * Obiettivo: Win Rate 80%+
 * 
 * Logica:
 * - Delta positivo + CVD positivo + Taker Ratio > 1.1 = STRONG BUY
 * - Delta negativo + CVD negativo + Taker Ratio < 0.91 = STRONG SELL
 * - Conflitti = NEUTRAL
 */
export function calculateCombinedOrderFlowSignal(
  trades: Trade[],
  bids: OrderBookLevel[],
  asks: OrderBookLevel[]
): {
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
  reasons: string[];
  delta: ReturnType<typeof calculateDelta>;
  cvd: ReturnType<typeof calculateCVD>;
  takerRatio: ReturnType<typeof calculateTakerRatio>;
  orderBookImbalance: ReturnType<typeof calculateOrderBookImbalance>;
  vwd: ReturnType<typeof calculateVolumeWeightedDelta>;
  timeAndSales: ReturnType<typeof analyzeTimeAndSales>;
} {
  const delta = calculateDelta(trades);
  const cvd = calculateCVD(trades);
  const takerRatio = calculateTakerRatio(trades);
  const orderBookImbalance = calculateOrderBookImbalance(bids, asks);
  const vwd = calculateVolumeWeightedDelta(trades);
  const timeAndSales = analyzeTimeAndSales(trades);

  const signals: Array<'buy' | 'sell' | 'neutral'> = [
    delta.signal.includes('buy') ? 'buy' : delta.signal.includes('sell') ? 'sell' : 'neutral',
    cvd.cvdTrend === 'accumulating' ? 'buy' : cvd.cvdTrend === 'distributing' ? 'sell' : 'neutral',
    takerRatio.signal.includes('buy') ? 'buy' : takerRatio.signal.includes('sell') ? 'sell' : 'neutral',
    orderBookImbalance.signal.includes('buy') ? 'buy' : orderBookImbalance.signal.includes('sell') ? 'sell' : 'neutral',
    vwd.signal.includes('buy') ? 'buy' : vwd.signal.includes('sell') ? 'sell' : 'neutral',
  ];

  const buyCount = signals.filter((s) => s === 'buy').length;
  const sellCount = signals.filter((s) => s === 'sell').length;
  const neutralCount = signals.filter((s) => s === 'neutral').length;

  let signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  let confidence = 0;
  const reasons: string[] = [];

  if (buyCount >= 4 && sellCount === 0) {
    signal = 'STRONG_BUY';
    confidence = 85 + Math.min(15, buyCount * 3);
    reasons.push(`Delta: ${delta.deltaPercent.toFixed(2)}% (${delta.signal})`);
    reasons.push(`CVD: ${cvd.cvdTrend} (slope: ${cvd.cvdSlope.toFixed(2)})`);
    reasons.push(`Taker Ratio: ${takerRatio.ratio.toFixed(2)} (${takerRatio.signal})`);
    reasons.push(`Order Book: ${orderBookImbalance.imbalancePercent.toFixed(2)}% (${orderBookImbalance.signal})`);
  } else if (sellCount >= 4 && buyCount === 0) {
    signal = 'STRONG_SELL';
    confidence = 85 + Math.min(15, sellCount * 3);
    reasons.push(`Delta: ${delta.deltaPercent.toFixed(2)}% (${delta.signal})`);
    reasons.push(`CVD: ${cvd.cvdTrend} (slope: ${cvd.cvdSlope.toFixed(2)})`);
    reasons.push(`Taker Ratio: ${takerRatio.ratio.toFixed(2)} (${takerRatio.signal})`);
    reasons.push(`Order Book: ${orderBookImbalance.imbalancePercent.toFixed(2)}% (${orderBookImbalance.signal})`);
  } else if (buyCount >= 3 && sellCount <= 1) {
    signal = 'BUY';
    confidence = 70 + buyCount * 5;
    reasons.push(`Majority indicators bullish (${buyCount}/5)`);
  } else if (sellCount >= 3 && buyCount <= 1) {
    signal = 'SELL';
    confidence = 70 + sellCount * 5;
    reasons.push(`Majority indicators bearish (${sellCount}/5)`);
  } else {
    signal = 'NEUTRAL';
    confidence = 50;
    reasons.push(`Mixed signals (${buyCount} buy, ${sellCount} sell, ${neutralCount} neutral)`);
  }

  // Aggiusta confidence basato su time & sales
  if (timeAndSales.aggressiveness === 'very-high') {
    confidence = Math.min(95, confidence + 5);
    reasons.push(`High trade activity: ${timeAndSales.tradeRate.toFixed(1)} trades/sec`);
  }

  return {
    signal,
    confidence,
    reasons,
    delta,
    cvd,
    takerRatio,
    orderBookImbalance,
    vwd,
    timeAndSales,
  };
}

