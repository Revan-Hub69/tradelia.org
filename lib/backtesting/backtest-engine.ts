/**
 * Backtesting Engine
 * 
 * Framework per testare strategie su dati storici
 * Usa dati gratuiti da Binance API
 * 
 * Riferimenti:
 * - Prado (2018) - "Advances in Financial Machine Learning"
 */

export interface BacktestConfig {
  symbol: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  timeframe: string; // 1m, 5m, 15m, 1h, etc.
  initialCapital: number;
  leverage?: number;
  commission?: number; // 0.001 = 0.1%
}

export interface Trade {
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  side: 'long' | 'short';
  pnl: number;
  pnlPercent: number;
  leverage: number;
}

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  trades: Trade[];
  equityCurve: Array<{ time: number; equity: number }>;
}

/**
 * Fetch historical data from Binance
 */
async function fetchHistoricalData(
  symbol: string,
  interval: string,
  startTime: number,
  endTime: number
): Promise<Array<{
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}>> {
  const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
  const limit = 1000; // Max per request
  const allData: any[] = [];

  let currentStart = startTime;

  while (currentStart < endTime) {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&startTime=${currentStart}&limit=${limit}`,
      { next: { revalidate: 3600 } } // Cache 1 hour
    );

    if (!response.ok) break;

    const data = await response.json();
    if (data.length === 0) break;

    allData.push(...data);

    currentStart = data[data.length - 1][0] + 1; // Next start time
    if (data.length < limit) break; // No more data
  }

  return allData.map((kline) => ({
    timestamp: kline[0],
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
  }));
}

/**
 * Simple backtest engine
 */
export async function runBacktest(
  config: BacktestConfig,
  signalFunction: (data: any[], index: number) => {
    signal: 'buy' | 'sell' | 'hold';
    confidence: number;
    stopLoss?: number;
    takeProfit?: number;
  }
): Promise<BacktestResult> {
  const startTime = new Date(config.startDate).getTime();
  const endTime = new Date(config.endDate).getTime();

  // Fetch historical data
  const data = await fetchHistoricalData(config.symbol, config.timeframe, startTime, endTime);

  if (data.length === 0) {
    throw new Error('No historical data available');
  }

  const trades: Trade[] = [];
  let equity = config.initialCapital;
  const equityCurve: Array<{ time: number; equity: number }> = [
    { time: startTime, equity },
  ];

  let currentPosition: {
    side: 'long' | 'short';
    entryPrice: number;
    entryTime: number;
    quantity: number;
    stopLoss?: number;
    takeProfit?: number;
  } | null = null;

  const leverage = config.leverage || 1;
  const commission = config.commission || 0.001;

  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];

    // Check if current position hit stop loss or take profit
    if (currentPosition) {
      let shouldExit = false;
      let exitPrice = current.close;
      let exitReason = '';

      if (currentPosition.side === 'long') {
        if (currentPosition.stopLoss && current.low <= currentPosition.stopLoss) {
          shouldExit = true;
          exitPrice = currentPosition.stopLoss;
          exitReason = 'stop-loss';
        } else if (currentPosition.takeProfit && current.high >= currentPosition.takeProfit) {
          shouldExit = true;
          exitPrice = currentPosition.takeProfit;
          exitReason = 'take-profit';
        }
      } else {
        // short
        if (currentPosition.stopLoss && current.high >= currentPosition.stopLoss) {
          shouldExit = true;
          exitPrice = currentPosition.stopLoss;
          exitReason = 'stop-loss';
        } else if (currentPosition.takeProfit && current.low <= currentPosition.takeProfit) {
          shouldExit = true;
          exitPrice = currentPosition.takeProfit;
          exitReason = 'take-profit';
        }
      }

      if (shouldExit) {
        // Close position
        const pnl = currentPosition.side === 'long'
          ? (exitPrice - currentPosition.entryPrice) * currentPosition.quantity * leverage
          : (currentPosition.entryPrice - exitPrice) * currentPosition.quantity * leverage;

        const commissionCost = (currentPosition.entryPrice + exitPrice) * currentPosition.quantity * commission;
        const netPnl = pnl - commissionCost;
        const pnlPercent = (netPnl / (currentPosition.entryPrice * currentPosition.quantity)) * 100;

        equity += netPnl;

        trades.push({
          entryTime: currentPosition.entryTime,
          exitTime: current.timestamp,
          entryPrice: currentPosition.entryPrice,
          exitPrice,
          quantity: currentPosition.quantity,
          side: currentPosition.side,
          pnl: netPnl,
          pnlPercent,
          leverage,
        });

        currentPosition = null;
      }
    }

    // Check for new signal if no position
    if (!currentPosition) {
      const signal = signalFunction(data, i);

      if (signal.signal === 'buy' && signal.confidence > 60) {
        // Open long position
        const quantity = (equity * 0.95) / current.close; // Use 95% of equity
        currentPosition = {
          side: 'long',
          entryPrice: current.close,
          entryTime: current.timestamp,
          quantity,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
        };
      } else if (signal.signal === 'sell' && signal.confidence > 60) {
        // Open short position
        const quantity = (equity * 0.95) / current.close;
        currentPosition = {
          side: 'short',
          entryPrice: current.close,
          entryTime: current.timestamp,
          quantity,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
        };
      }
    }

    // Update equity curve
    if (currentPosition) {
      const currentValue = currentPosition.side === 'long'
        ? (current.close - currentPosition.entryPrice) * currentPosition.quantity * leverage + equity
        : (currentPosition.entryPrice - current.close) * currentPosition.quantity * leverage + equity;
      equityCurve.push({ time: current.timestamp, equity: currentValue });
    } else {
      equityCurve.push({ time: current.timestamp, equity });
    }
  }

  // Calculate statistics
  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl <= 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const totalPnL = equity - config.initialCapital;
  const totalPnLPercent = (totalPnL / config.initialCapital) * 100;

  // Max drawdown
  let maxEquity = config.initialCapital;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  equityCurve.forEach((point) => {
    if (point.equity > maxEquity) {
      maxEquity = point.equity;
    }
    const drawdown = maxEquity - point.equity;
    const drawdownPercent = (drawdown / maxEquity) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = drawdownPercent;
    }
  });

  // Sharpe ratio (simplified)
  const returns = equityCurve.slice(1).map((point, i) => {
    const prevEquity = equityCurve[i].equity;
    return (point.equity - prevEquity) / prevEquity;
  });
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized

  // Profit factor
  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length
    : 0;
  const largestWin = winningTrades.length > 0
    ? Math.max(...winningTrades.map((t) => t.pnl))
    : 0;
  const largestLoss = losingTrades.length > 0
    ? Math.min(...losingTrades.map((t) => t.pnl))
    : 0;

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalPnL,
    totalPnLPercent,
    maxDrawdown,
    maxDrawdownPercent,
    sharpeRatio,
    profitFactor,
    avgWin,
    avgLoss,
    largestWin,
    largestLoss,
    trades,
    equityCurve,
  };
}
