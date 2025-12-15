/**
 * Performance Tracker
 * 
 * Traccia performance dei segnali in tempo reale
 * Calcola win rate reale, profit factor, drawdown
 * 
 * Obiettivo: Verificare se raggiungiamo 80% win rate
 */

export interface SignalPerformance {
  signalId: string;
  timestamp: number;
  symbol: string;
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  status: 'open' | 'closed' | 'stopped' | 'target';
  exitPrice?: number;
  exitTime?: number;
  pnl?: number;
  pnlPercent?: number;
  duration?: number; // seconds
}

export interface PerformanceStats {
  totalSignals: number;
  openSignals: number;
  closedSignals: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  totalPnL: number;
  totalPnLPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  avgConfidence: number;
  avgDuration: number; // seconds
  bySignalType: {
    'STRONG_BUY': SignalStats;
    'BUY': SignalStats;
    'SELL': SignalStats;
    'STRONG_SELL': SignalStats;
  };
}

interface SignalStats {
  count: number;
  winRate: number;
  avgPnL: number;
}

class PerformanceTracker {
  private signals: Map<string, SignalPerformance> = new Map();
  private maxSignals = 1000; // Keep last 1000 signals

  /**
   * Record a new signal
   */
  recordSignal(signal: Omit<SignalPerformance, 'status' | 'signalId' | 'timestamp'>): string {
    const signalId = `${signal.symbol}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const performance: SignalPerformance = {
      ...signal,
      signalId,
      timestamp: Date.now(),
      status: 'open',
    };

    this.signals.set(signalId, performance);

    // Cleanup old signals
    if (this.signals.size > this.maxSignals) {
      const sorted = Array.from(this.signals.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      sorted.slice(0, sorted.length - this.maxSignals).forEach(([id]) => {
        this.signals.delete(id);
      });
    }

    return signalId;
  }

  /**
   * Update signal status (closed, stopped, target)
   */
  updateSignal(
    signalId: string,
    status: 'closed' | 'stopped' | 'target',
    exitPrice: number
  ): boolean {
    const signal = this.signals.get(signalId);
    if (!signal || signal.status !== 'open') return false;

    const pnl = signal.signal.includes('BUY')
      ? (exitPrice - signal.entryPrice) * (signal.leverage || 1)
      : (signal.entryPrice - exitPrice) * (signal.leverage || 1);

    const pnlPercent = (pnl / signal.entryPrice) * 100;
    const duration = Date.now() - signal.timestamp;

    signal.status = status;
    signal.exitPrice = exitPrice;
    signal.exitTime = Date.now();
    signal.pnl = pnl;
    signal.pnlPercent = pnlPercent;
    signal.duration = duration;

    return true;
  }

  /**
   * Get performance statistics
   */
  getStats(timeframe?: '24h' | '7d' | '30d' | 'all'): PerformanceStats {
    const now = Date.now();
    let cutoff = 0;

    if (timeframe === '24h') cutoff = now - 24 * 60 * 60 * 1000;
    else if (timeframe === '7d') cutoff = now - 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === '30d') cutoff = now - 30 * 24 * 60 * 60 * 1000;

    const filtered = Array.from(this.signals.values()).filter(
      (s) => !timeframe || s.timestamp >= cutoff
    );

    const closed = filtered.filter((s) => s.status !== 'open');
    const open = filtered.filter((s) => s.status === 'open');
    const winning = closed.filter((s) => s.pnl && s.pnl > 0);
    const losing = closed.filter((s) => s.pnl && s.pnl <= 0);

    const winRate = closed.length > 0 ? (winning.length / closed.length) * 100 : 0;

    const totalPnL = closed.reduce((sum, s) => sum + (s.pnl || 0), 0);
    const totalPnLPercent = closed.length > 0
      ? closed.reduce((sum, s) => sum + (s.pnlPercent || 0), 0) / closed.length
      : 0;

    const avgWin = winning.length > 0
      ? winning.reduce((sum, s) => sum + (s.pnl || 0), 0) / winning.length
      : 0;
    const avgLoss = losing.length > 0
      ? losing.reduce((sum, s) => sum + (s.pnl || 0), 0) / losing.length
      : 0;

    const profitFactor = Math.abs(avgLoss) > 0
      ? Math.abs(avgWin) / Math.abs(avgLoss)
      : avgWin > 0 ? 999 : 0;

    // Max drawdown
    let maxEquity = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let runningPnL = 0;

    closed
      .sort((a, b) => (a.exitTime || a.timestamp) - (b.exitTime || b.timestamp))
      .forEach((s) => {
        runningPnL += s.pnl || 0;
        if (runningPnL > maxEquity) maxEquity = runningPnL;
        const drawdown = maxEquity - runningPnL;
        const drawdownPercent = maxEquity > 0 ? (drawdown / maxEquity) * 100 : 0;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
          maxDrawdownPercent = drawdownPercent;
        }
      });

    const avgConfidence = filtered.length > 0
      ? filtered.reduce((sum, s) => sum + s.confidence, 0) / filtered.length
      : 0;

    const avgDuration = closed.length > 0
      ? closed.reduce((sum, s) => sum + (s.duration || 0), 0) / closed.length
      : 0;

    // By signal type
    const bySignalType = {
      'STRONG_BUY': this.getSignalTypeStats(filtered, 'STRONG_BUY'),
      'BUY': this.getSignalTypeStats(filtered, 'BUY'),
      'SELL': this.getSignalTypeStats(filtered, 'SELL'),
      'STRONG_SELL': this.getSignalTypeStats(filtered, 'STRONG_SELL'),
    };

    return {
      totalSignals: filtered.length,
      openSignals: open.length,
      closedSignals: closed.length,
      winningSignals: winning.length,
      losingSignals: losing.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      totalPnL,
      totalPnLPercent,
      maxDrawdown,
      maxDrawdownPercent,
      avgConfidence,
      avgDuration,
      bySignalType,
    };
  }

  private getSignalTypeStats(
    signals: SignalPerformance[],
    type: 'STRONG_BUY' | 'BUY' | 'SELL' | 'STRONG_SELL'
  ): SignalStats {
    const filtered = signals.filter((s) => s.signal === type);
    const closed = filtered.filter((s) => s.status !== 'open');
    const winning = closed.filter((s) => s.pnl && s.pnl > 0);

    return {
      count: filtered.length,
      winRate: closed.length > 0 ? (winning.length / closed.length) * 100 : 0,
      avgPnL: closed.length > 0
        ? closed.reduce((sum, s) => sum + (s.pnl || 0), 0) / closed.length
        : 0,
    };
  }

  /**
   * Get signal by ID
   */
  getSignal(signalId: string): SignalPerformance | undefined {
    return this.signals.get(signalId);
  }

  /**
   * Get all signals
   */
  getAllSignals(): SignalPerformance[] {
    return Array.from(this.signals.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all signals
   */
  clear(): void {
    this.signals.clear();
  }
}

// Singleton instance
let tracker: PerformanceTracker | null = null;

export function getPerformanceTracker(): PerformanceTracker {
  if (!tracker) {
    tracker = new PerformanceTracker();
  }
  return tracker;
}

