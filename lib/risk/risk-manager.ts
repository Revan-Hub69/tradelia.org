/**
 * Risk Manager
 * 
 * Gestione rischio avanzata:
 * - Position sizing
 * - Risk per trade
 * - Maximum drawdown protection
 * - Correlation analysis
 * 
 * Riferimenti:
 * - Van Tharp (2008) - "Trade Your Way to Financial Freedom"
 * - Kelly Criterion for position sizing
 */

export interface RiskConfig {
  accountBalance: number;
  riskPerTrade: number; // % of account (e.g., 1% = 0.01)
  maxRiskPerDay: number; // % of account
  maxPositions: number;
  maxLeverage: number;
  stopLossPercent: number; // % from entry
  takeProfitPercent: number; // % from entry
  useKellyCriterion: boolean;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number; // $ at risk
  riskPercent: number; // % of account
}

export interface RiskAnalysis {
  canOpenPosition: boolean;
  recommendedPositionSize: number;
  recommendedLeverage: number;
  riskAmount: number;
  riskPercent: number;
  reason?: string;
  warnings: string[];
}

class RiskManager {
  private config: RiskConfig;
  private openPositions: Position[] = [];
  private dailyRisk: number = 0;
  private lastResetDate: number = Date.now();

  constructor(config: RiskConfig) {
    this.config = config;
  }

  /**
   * Calculate position size based on risk
   */
  calculatePositionSize(
    entryPrice: number,
    stopLoss: number,
    leverage: number = 1
  ): {
    quantity: number;
    riskAmount: number;
    riskPercent: number;
  } {
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    const riskAmount = this.config.accountBalance * this.config.riskPerTrade;
    const quantity = riskAmount / riskPerShare;
    const riskPercent = this.config.riskPerTrade;

    return {
      quantity: Math.floor(quantity * 100) / 100, // Round to 2 decimals
      riskAmount,
      riskPercent,
    };
  }

  /**
   * Calculate position size using Kelly Criterion
   */
  calculateKellyPositionSize(
    winRate: number, // 0-1
    avgWin: number,
    avgLoss: number,
    entryPrice: number,
    stopLoss: number
  ): {
    quantity: number;
    kellyPercent: number;
    riskAmount: number;
  } {
    if (avgLoss === 0) {
      return this.calculatePositionSize(entryPrice, stopLoss);
    }

    const winLossRatio = Math.abs(avgWin / avgLoss);
    const kellyPercent = winRate - ((1 - winRate) / winLossRatio);

    // Use fractional Kelly (50% of full Kelly for safety)
    const fractionalKelly = kellyPercent * 0.5;
    const safeKelly = Math.max(0, Math.min(fractionalKelly, 0.25)); // Cap at 25%

    const riskPerShare = Math.abs(entryPrice - stopLoss);
    const riskAmount = this.config.accountBalance * safeKelly;
    const quantity = riskAmount / riskPerShare;

    return {
      quantity: Math.floor(quantity * 100) / 100,
      kellyPercent: safeKelly * 100,
      riskAmount,
    };
  }

  /**
   * Analyze risk before opening position
   */
  analyzeRisk(
    symbol: string,
    entryPrice: number,
    stopLoss: number,
    takeProfit: number,
    leverage: number,
    winRate?: number,
    avgWin?: number,
    avgLoss?: number
  ): RiskAnalysis {
    const warnings: string[] = [];
    let canOpen = true;
    let reason = '';

    // Reset daily risk if new day
    const now = Date.now();
    const today = new Date(now).toDateString();
    const lastDate = new Date(this.lastResetDate).toDateString();
    if (today !== lastDate) {
      this.dailyRisk = 0;
      this.lastResetDate = now;
    }

    // Check max positions
    if (this.openPositions.length >= this.config.maxPositions) {
      canOpen = false;
      reason = `Maximum positions reached (${this.config.maxPositions})`;
      return { canOpenPosition: false, recommendedPositionSize: 0, recommendedLeverage: 1, riskAmount: 0, riskPercent: 0, reason, warnings };
    }

    // Check max leverage
    if (leverage > this.config.maxLeverage) {
      warnings.push(`Leverage ${leverage}x exceeds maximum ${this.config.maxLeverage}x`);
      leverage = this.config.maxLeverage;
    }

    // Calculate position size
    let positionSize: { quantity: number; riskAmount: number; riskPercent: number };
    
    if (this.config.useKellyCriterion && winRate && avgWin && avgLoss) {
      const kelly = this.calculateKellyPositionSize(winRate, avgWin, avgLoss, entryPrice, stopLoss);
      positionSize = {
        quantity: kelly.quantity,
        riskAmount: kelly.riskAmount,
        riskPercent: (kelly.riskAmount / this.config.accountBalance) * 100,
      };
      if (kelly.kellyPercent > 10) {
        warnings.push(`Kelly Criterion suggests ${kelly.kellyPercent.toFixed(1)}% position (using 50% for safety)`);
      }
    } else {
      positionSize = this.calculatePositionSize(entryPrice, stopLoss, leverage);
    }

    // Check daily risk limit
    const newDailyRisk = this.dailyRisk + positionSize.riskAmount;
    if (newDailyRisk > this.config.accountBalance * this.config.maxRiskPerDay) {
      canOpen = false;
      reason = `Daily risk limit reached (${(this.dailyRisk / this.config.accountBalance * 100).toFixed(1)}% used)`;
      return { canOpenPosition: false, recommendedPositionSize: 0, recommendedLeverage: leverage, riskAmount: 0, riskPercent: 0, reason, warnings };
    }

    // Check if same symbol already open
    const existingPosition = this.openPositions.find((p) => p.symbol === symbol);
    if (existingPosition) {
      warnings.push(`Position already open for ${symbol}`);
    }

    // Check stop loss distance
    const stopLossPercent = (Math.abs(entryPrice - stopLoss) / entryPrice) * 100;
    if (stopLossPercent > 5) {
      warnings.push(`Stop loss is ${stopLossPercent.toFixed(1)}% away - consider tighter stop`);
    }

    // Check risk/reward ratio
    const reward = Math.abs(takeProfit - entryPrice);
    const risk = Math.abs(entryPrice - stopLoss);
    const riskRewardRatio = reward / risk;
    if (riskRewardRatio < 1.5) {
      warnings.push(`Risk/Reward ratio is ${riskRewardRatio.toFixed(2)} - aim for at least 2:1`);
    }

    return {
      canOpenPosition: canOpen,
      recommendedPositionSize: positionSize.quantity,
      recommendedLeverage: leverage,
      riskAmount: positionSize.riskAmount,
      riskPercent: positionSize.riskPercent,
      warnings,
    };
  }

  /**
   * Open position
   */
  openPosition(position: Position): boolean {
    const analysis = this.analyzeRisk(
      position.symbol,
      position.entryPrice,
      position.stopLoss,
      position.takeProfit,
      position.leverage
    );

    if (!analysis.canOpenPosition) {
      return false;
    }

    // Adjust position size if needed
    if (analysis.recommendedPositionSize !== position.quantity) {
      position.quantity = analysis.recommendedPositionSize;
      position.riskAmount = analysis.riskAmount;
      position.riskPercent = analysis.riskPercent;
    }

    this.openPositions.push(position);
    this.dailyRisk += position.riskAmount;

    return true;
  }

  /**
   * Close position
   */
  closePosition(symbol: string): Position | null {
    const index = this.openPositions.findIndex((p) => p.symbol === symbol);
    if (index === -1) return null;

    const position = this.openPositions[index];
    this.openPositions.splice(index, 1);
    this.dailyRisk = Math.max(0, this.dailyRisk - position.riskAmount);

    return position;
  }

  /**
   * Get open positions
   */
  getOpenPositions(): Position[] {
    return [...this.openPositions];
  }

  /**
   * Get total risk
   */
  getTotalRisk(): {
    totalRiskAmount: number;
    totalRiskPercent: number;
    dailyRiskUsed: number;
    dailyRiskPercent: number;
  } {
    const totalRiskAmount = this.openPositions.reduce((sum, p) => sum + p.riskAmount, 0);
    const totalRiskPercent = (totalRiskAmount / this.config.accountBalance) * 100;
    const dailyRiskPercent = (this.dailyRisk / this.config.accountBalance) * 100;

    return {
      totalRiskAmount,
      totalRiskPercent,
      dailyRiskUsed: this.dailyRisk,
      dailyRiskPercent,
    };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<RiskConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export function createRiskManager(config: RiskConfig): RiskManager {
  return new RiskManager(config);
}

