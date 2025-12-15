/**
 * Strategy Implementations - Tradelia
 * 
 * Implementazioni concrete delle strategie accademiche per backtesting
 */

// Types (defined here since not exported from backtest-engine)
export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategySignal {
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  stopLoss?: number;
  takeProfit?: number;
}

export type StrategyFunction = (
  data: OHLCV[],
  currentIndex: number,
  parameters: Record<string, number>
) => StrategySignal;

/**
 * Moving Average Crossover Strategy
 */
export function movingAverageCrossover(
  data: OHLCV[],
  currentIndex: number,
  parameters: Record<string, number>
): StrategySignal {
  const fastMA = parameters.fastMA || 10;
  const slowMA = parameters.slowMA || 50;

  if (currentIndex < slowMA) {
    return { type: 'hold', confidence: 0 };
  }

  // Calculate moving averages
  let fastSum = 0;
  let slowSum = 0;

  for (let i = currentIndex - fastMA + 1; i <= currentIndex; i++) {
    fastSum += data[i].close;
  }
  for (let i = currentIndex - slowMA + 1; i <= currentIndex; i++) {
    slowSum += data[i].close;
  }

  const fastMAValue = fastSum / fastMA;
  const slowMAValue = slowSum / slowMA;

  // Previous values
  let prevFastSum = 0;
  let prevSlowSum = 0;
  for (let i = currentIndex - fastMA; i < currentIndex; i++) {
    prevFastSum += data[i].close;
  }
  for (let i = currentIndex - slowMA; i < currentIndex; i++) {
    prevSlowSum += data[i].close;
  }

  const prevFastMA = prevFastSum / fastMA;
  const prevSlowMA = prevSlowSum / slowMA;

  // Crossover detection
  if (fastMAValue > slowMAValue && prevFastMA <= prevSlowMA) {
    return { type: 'buy', confidence: 1.0 };
  } else if (fastMAValue < slowMAValue && prevFastMA >= prevSlowMA) {
    return { type: 'sell', confidence: 1.0 };
  }

  return { type: 'hold', confidence: 0 };
}

/**
 * RSI Mean Reversion Strategy
 */
export function rsiMeanReversion(
  data: OHLCV[],
  currentIndex: number,
  parameters: Record<string, number>
): StrategySignal {
  const period = parameters.rsiPeriod || 14;
  const oversold = parameters.oversold || 30;
  const overbought = parameters.overbought || 70;

  if (currentIndex < period) {
    return { type: 'hold', confidence: 0 };
  }

  // Calculate RSI
  let gains = 0;
  let losses = 0;

  for (let i = currentIndex - period + 1; i <= currentIndex; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) {
    return { type: 'hold', confidence: 0 };
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  if (rsi < oversold) {
    return { type: 'buy', confidence: (oversold - rsi) / oversold };
  } else if (rsi > overbought) {
    return { type: 'sell', confidence: (rsi - overbought) / (100 - overbought) };
  }

  return { type: 'hold', confidence: 0 };
}

/**
 * MACD Trend Following Strategy
 */
export function macdTrend(
  data: OHLCV[],
  currentIndex: number,
  parameters: Record<string, number>
): StrategySignal {
  const fastEMA = parameters.fastEMA || 12;
  const slowEMA = parameters.slowEMA || 26;
  const signalPeriod = parameters.signalPeriod || 9;

  if (currentIndex < slowEMA + signalPeriod) {
    return { type: 'hold', confidence: 0 };
  }

  // Calculate EMAs
  let fastEMAValue = data[currentIndex - fastEMA + 1].close;
  let slowEMAValue = data[currentIndex - slowEMA + 1].close;

  // Smoothing factor
  const fastAlpha = 2 / (fastEMA + 1);
  const slowAlpha = 2 / (slowEMA + 1);

  for (let i = currentIndex - fastEMA + 2; i <= currentIndex; i++) {
    fastEMAValue = fastAlpha * data[i].close + (1 - fastAlpha) * fastEMAValue;
  }

  for (let i = currentIndex - slowEMA + 2; i <= currentIndex; i++) {
    slowEMAValue = slowAlpha * data[i].close + (1 - slowAlpha) * slowEMAValue;
  }

  const macdLine = fastEMAValue - slowEMAValue;

  // Calculate Signal Line (EMA of MACD)
  let signalLine = macdLine;
  const signalAlpha = 2 / (signalPeriod + 1);

  // Simplified: use recent MACD values
  for (let i = currentIndex - signalPeriod + 1; i < currentIndex; i++) {
    // Approximate MACD for previous periods
    const prevFastEMA = fastEMAValue * (1 - fastAlpha) + fastAlpha * data[i].close;
    const prevSlowEMA = slowEMAValue * (1 - slowAlpha) + slowAlpha * data[i].close;
    const prevMACD = prevFastEMA - prevSlowEMA;
    signalLine = signalAlpha * prevMACD + (1 - signalAlpha) * signalLine;
  }

  // Previous MACD
  const prevFastEMA = fastEMAValue * (1 - fastAlpha) + fastAlpha * data[currentIndex - 1].close;
  const prevSlowEMA = slowEMAValue * (1 - slowAlpha) + slowAlpha * data[currentIndex - 1].close;
  const prevMACD = prevFastEMA - prevSlowEMA;

  // Crossover detection
  if (macdLine > signalLine && prevMACD <= signalLine) {
    return { type: 'buy', confidence: 1.0 };
  } else if (macdLine < signalLine && prevMACD >= signalLine) {
    return { type: 'sell', confidence: 1.0 };
  }

  return { type: 'hold', confidence: 0 };
}

/**
 * Strategy function mapper
 */
export const STRATEGY_FUNCTIONS: Record<string, StrategyFunction> = {
  'moving-average-crossover': movingAverageCrossover,
  'rsi-mean-reversion': rsiMeanReversion,
  'macd-trend': macdTrend,
  'high-precision-signal': rsiMeanReversion, // Fallback to RSI for now
  'order-flow-only': rsiMeanReversion, // Fallback
  'multi-timeframe': macdTrend, // Fallback
  // Add more strategies as needed
};

/**
 * Get strategy function by name
 * Returns a function that accepts only data and index (parameters are already bound)
 */
export function getStrategyFunction(
  strategyName: string,
  parameters: Record<string, number> = {}
): (data: OHLCV[], currentIndex: number) => StrategySignal {
  const strategy = STRATEGY_FUNCTIONS[strategyName] || STRATEGY_FUNCTIONS['rsi-mean-reversion'];
  
  return (data: OHLCV[], currentIndex: number) => {
    return strategy(data, currentIndex, parameters);
  };
}
