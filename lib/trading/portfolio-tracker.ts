/**
 * Portfolio Tracker
 * 
 * Gestisce posizioni aperte, P&L, e portfolio management
 */

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: number;
  currentPrice?: number;
  pnl?: number;
  pnlPercent?: number;
  riskAmount: number;
  riskPercent: number;
}

export interface PortfolioStats {
  totalPositions: number;
  openPositions: number;
  totalPnL: number;
  totalPnLPercent: number;
  totalRisk: number;
  totalRiskPercent: number;
  largestWin: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
  winRate: number;
  positions: Position[];
}

class PortfolioTracker {
  private positions: Map<string, Position> = new Map();
  private closedPositions: Position[] = [];

  /**
   * Apri una nuova posizione
   */
  openPosition(position: Omit<Position, 'id' | 'entryTime' | 'pnl' | 'pnlPercent' | 'currentPrice'>): Position {
    const id = `${position.symbol}-${Date.now()}`;
    const newPosition: Position = {
      ...position,
      id,
      entryTime: Date.now(),
      currentPrice: position.entryPrice,
      pnl: 0,
      pnlPercent: 0,
    };

    this.positions.set(id, newPosition);
    this.saveToStorage();
    return newPosition;
  }

  /**
   * Chiudi una posizione
   */
  closePosition(positionId: string, exitPrice: number): Position | null {
    const position = this.positions.get(positionId);
    if (!position) return null;

    const pnl = this.calculatePnL(position, exitPrice);
    const closedPosition: Position = {
      ...position,
      currentPrice: exitPrice,
      pnl,
      pnlPercent: (pnl / (position.entryPrice * position.quantity)) * 100,
    };

    this.positions.delete(positionId);
    this.closedPositions.push(closedPosition);
    this.saveToStorage();
    return closedPosition;
  }

  /**
   * Aggiorna prezzo corrente per tutte le posizioni
   */
  updatePrices(prices: Record<string, number>): void {
    this.positions.forEach((position, id) => {
      const currentPrice = prices[position.symbol];
      if (currentPrice) {
        position.currentPrice = currentPrice;
        position.pnl = this.calculatePnL(position, currentPrice);
        position.pnlPercent = (position.pnl / (position.entryPrice * position.quantity)) * 100;
      }
    });
    this.saveToStorage();
  }

  /**
   * Calcola P&L per una posizione
   */
  private calculatePnL(position: Position, currentPrice: number): number {
    const notional = position.entryPrice * position.quantity * position.leverage;
    if (position.side === 'long') {
      return (currentPrice - position.entryPrice) * position.quantity * position.leverage;
    } else {
      return (position.entryPrice - currentPrice) * position.quantity * position.leverage;
    }
  }

  /**
   * Ottieni tutte le posizioni aperte
   */
  getOpenPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  /**
   * Ottieni posizione per ID
   */
  getPosition(positionId: string): Position | undefined {
    return this.positions.get(positionId);
  }

  /**
   * Ottieni statistiche portfolio
   */
  getStats(accountBalance: number): PortfolioStats {
    const openPositions = this.getOpenPositions();
    const closedPositions = this.closedPositions;

    const totalPnL = openPositions.reduce((sum, p) => sum + (p.pnl || 0), 0) +
                     closedPositions.reduce((sum, p) => sum + (p.pnl || 0), 0);

    const totalRisk = openPositions.reduce((sum, p) => sum + p.riskAmount, 0);
    const totalRiskPercent = accountBalance > 0 ? (totalRisk / accountBalance) * 100 : 0;

    const wins = closedPositions.filter(p => (p.pnl || 0) > 0);
    const losses = closedPositions.filter(p => (p.pnl || 0) < 0);

    const winRate = closedPositions.length > 0
      ? (wins.length / closedPositions.length) * 100
      : 0;

    const avgWin = wins.length > 0
      ? wins.reduce((sum, p) => sum + (p.pnl || 0), 0) / wins.length
      : 0;

    const avgLoss = losses.length > 0
      ? losses.reduce((sum, p) => sum + (p.pnl || 0), 0) / losses.length
      : 0;

    const largestWin = wins.length > 0
      ? Math.max(...wins.map(p => p.pnl || 0))
      : 0;

    const largestLoss = losses.length > 0
      ? Math.min(...losses.map(p => p.pnl || 0))
      : 0;

    return {
      totalPositions: closedPositions.length,
      openPositions: openPositions.length,
      totalPnL,
      totalPnLPercent: accountBalance > 0 ? (totalPnL / accountBalance) * 100 : 0,
      totalRisk,
      totalRiskPercent,
      largestWin,
      largestLoss,
      avgWin,
      avgLoss,
      winRate,
      positions: openPositions,
    };
  }

  /**
   * Salva su localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        positions: Array.from(this.positions.entries()),
        closedPositions: this.closedPositions.slice(-100), // Keep last 100
      };
      localStorage.setItem('portfolio-tracker', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  }

  /**
   * Carica da localStorage
   */
  loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem('portfolio-tracker');
      if (data) {
        const parsed = JSON.parse(data);
        this.positions = new Map(parsed.positions || []);
        this.closedPositions = parsed.closedPositions || [];
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  }

  /**
   * Reset portfolio
   */
  reset(): void {
    this.positions.clear();
    this.closedPositions = [];
    this.saveToStorage();
  }
}

// Singleton
let portfolioTracker: PortfolioTracker | null = null;

export function getPortfolioTracker(): PortfolioTracker {
  if (!portfolioTracker) {
    portfolioTracker = new PortfolioTracker();
    portfolioTracker.loadFromStorage();
  }
  return portfolioTracker;
}

