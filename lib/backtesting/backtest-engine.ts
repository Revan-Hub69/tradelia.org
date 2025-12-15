/**
 * Backtesting Engine - Tradelia
 * 
 * Engine per backtesting reale di strategie su dati storici OHLCV
 * 
 * Best Practice:
 * - Walk-Forward Optimization
 * - Out-of-Sample Testing
 * - Realistic execution simulation (slippage, commissions)
 * 
 * References:
 * - Prado, M. L. (2018): "Advances in Financial Machine Learning"
 * - Chan, E. P. (2013): "Algorithmic Trading: Winning Strategies and Their Rationale"
 */

export interface OHLCV {
  timestamp: number; // Unix timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
  strategyId: string;
  parameters: Record<string, number>;
}

export interface BacktestResult {
  trades: Trade[];
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  expectancy: number;
  equityCurve: Array<{ timestamp: number; equity: number }>;
}

export interface StrategySignal {
  type: 'buy' | 'sell' | 'hold';
  confidence?: number;
  price?: number;
}

export type StrategyFunction = (
  data: OHLCV[],
  currentIndex: number,
  parameters: Record<string, number>
) => StrategySignal;

/**
 * Backtesting Engine
 * 
 * Esegue backtesting di una strategia su dati storici OHLCV
 */
export class BacktestEngine {
  private data: OHLCV[];
  private strategy: StrategyFunction;
  private parameters: Record<string, number>;
  private initialCapital: number;
  private slippage: number; // Slippage percentuale (es. 0.001 = 0.1%)
  private commission: number; // Commissione fissa per trade

  constructor(
    data: OHLCV[],
    strategy: StrategyFunction,
    parameters: Record<string, number>,
    options: {
      initialCapital?: number;
      slippage?: number;
      commission?: number;
    } = {}
  ) {
    this.data = data;
    this.strategy = strategy;
    this.parameters = parameters;
    this.initialCapital = options.initialCapital || 10000;
    this.slippage = options.slippage || 0.001; // 0.1% default
    this.commission = options.commission || 0; // No commission default
  }

  /**
   * Esegue il backtesting completo
   */
  run(): BacktestResult {
    const trades: Trade[] = [];
    let position: {
      side: 'long' | 'short';
      entryPrice: number;
      entryTime: number;
      quantity: number;
    } | null = null;

    let equity = this.initialCapital;
    const equityCurve: Array<{ timestamp: number; equity: number }> = [
      { timestamp: this.data[0]?.timestamp || 0, equity }
    ];

    let peakEquity = equity;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    // Iterate through historical data
    for (let i = 1; i < this.data.length; i++) {
      const currentBar = this.data[i];
      const previousBars = this.data.slice(0, i + 1);

      // Get strategy signal
      const signal = this.strategy(previousBars, i, this.parameters);

      // Execute trades based on signal
      if (signal.type === 'buy' && !position) {
        // Open long position
        const entryPrice = this.applySlippage(currentBar.close, 'buy');
        const quantity = Math.floor(equity / entryPrice);
        
        if (quantity > 0) {
          position = {
            side: 'long',
            entryPrice,
            entryTime: currentBar.timestamp,
            quantity,
          };
          equity -= (entryPrice * quantity) + this.commission;
        }
      } else if (signal.type === 'sell' && position) {
        // Close position
        const exitPrice = this.applySlippage(currentBar.close, position.side === 'long' ? 'sell' : 'buy');
        const pnl = position.side === 'long'
          ? (exitPrice - position.entryPrice) * position.quantity
          : (position.entryPrice - exitPrice) * position.quantity;
        const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;

        trades.push({
          entryTime: position.entryTime,
          exitTime: currentBar.timestamp,
          entryPrice: position.entryPrice,
          exitPrice,
          quantity: position.quantity,
          side: position.side,
          pnl: pnl - this.commission,
          pnlPercent,
          strategyId: 'strategy', // Will be set by caller
          parameters: this.parameters,
        });

        equity += (exitPrice * position.quantity) - this.commission;
        position = null;
      }

      // Update equity curve
      if (position) {
        // Mark-to-market: calculate current equity with open position
        const currentPrice = currentBar.close;
        const unrealizedPnl = position.side === 'long'
          ? (currentPrice - position.entryPrice) * position.quantity
          : (position.entryPrice - currentPrice) * position.quantity;
        const currentEquity = equity + (position.entryPrice * position.quantity) + unrealizedPnl;
        equityCurve.push({ timestamp: currentBar.timestamp, equity: currentEquity });

        // Update drawdown
        if (currentEquity > peakEquity) {
          peakEquity = currentEquity;
        }
        const drawdown = peakEquity - currentEquity;
        const drawdownPercent = (drawdown / peakEquity) * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
        if (drawdownPercent > maxDrawdownPercent) {
          maxDrawdownPercent = drawdownPercent;
        }
      } else {
        equityCurve.push({ timestamp: currentBar.timestamp, equity });
        if (equity > peakEquity) {
          peakEquity = equity;
        }
      }
    }

    // Close any open position at the end
    if (position && this.data.length > 0) {
      const lastBar = this.data[this.data.length - 1];
      const exitPrice = this.applySlippage(lastBar.close, position.side === 'long' ? 'sell' : 'buy');
      const pnl = position.side === 'long'
        ? (exitPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - exitPrice) * position.quantity;
      const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;

      trades.push({
        entryTime: position.entryTime,
        exitTime: lastBar.timestamp,
        entryPrice: position.entryPrice,
        exitPrice,
        quantity: position.quantity,
        side: position.side,
        pnl: pnl - this.commission,
        pnlPercent,
        strategyId: 'strategy',
        parameters: this.parameters,
      });

      equity += (exitPrice * position.quantity) - this.commission;
      equityCurve.push({ timestamp: lastBar.timestamp, equity });
    }

    // Calculate statistics
    const totalReturn = equity - this.initialCapital;
    const totalReturnPercent = (totalReturn / this.initialCapital) * 100;

    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

    const averageWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;
    const averageLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / losingTrades.length
      : 0;

    const largestWin = winningTrades.length > 0
      ? Math.max(...winningTrades.map(t => t.pnl))
      : 0;
    const largestLoss = losingTrades.length > 0
      ? Math.min(...losingTrades.map(t => t.pnl))
      : 0;

    const profitFactor = averageLoss > 0
      ? (averageWin * winningTrades.length) / (averageLoss * losingTrades.length)
      : winningTrades.length > 0 ? Infinity : 0;

    const expectancy = (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;

    // Calculate Sharpe Ratio (annualized)
    const returns = equityCurve.slice(1).map((point, i) => {
      const prevEquity = equityCurve[i].equity;
      return (point.equity - prevEquity) / prevEquity;
    });
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Annualize (assuming daily data, 252 trading days)
    const annualizedReturn = avgReturn * 252;
    const annualizedStdDev = stdDev * Math.sqrt(252);
    const riskFreeRate = 0.02; // 2% annual
    const sharpeRatio = annualizedStdDev > 0
      ? (annualizedReturn - riskFreeRate) / annualizedStdDev
      : 0;

    // Calmar Ratio
    const calmarRatio = maxDrawdownPercent > 0
      ? (totalReturnPercent / 100) / (maxDrawdownPercent / 100)
      : 0;

    return {
      trades,
      totalReturn,
      totalReturnPercent,
      sharpeRatio,
      calmarRatio,
      maxDrawdown,
      maxDrawdownPercent,
      winRate,
      profitFactor,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      expectancy,
      equityCurve,
    };
  }

  /**
   * Applica slippage al prezzo di esecuzione
   */
  private applySlippage(price: number, side: 'buy' | 'sell'): number {
    if (side === 'buy') {
      return price * (1 + this.slippage); // Pay more when buying
    } else {
      return price * (1 - this.slippage); // Receive less when selling
    }
  }
}
