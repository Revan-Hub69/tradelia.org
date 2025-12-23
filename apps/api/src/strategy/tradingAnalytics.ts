import { PrismaClient } from '@prisma/client'

interface TradeRecord {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  quantity: number
  entryPrice: number
  exitPrice: number
  entryTime: Date
  exitTime: Date
  pnl: number
  pnlPct: number
  commission: number
  setupType?: string
  regime?: string
}

interface PerformanceMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  totalPnl: number
  totalPnlPct: number
  avgTradeDuration: number
  bestTrade: number
  worstTrade: number
  expectancy: number
}

interface DailyStats {
  date: string
  pnl: number
  trades: number
  winRate: number
  volume: number
}

export class TradingAnalytics {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Record a completed trade (simplified implementation)
   */
  async recordTrade(trade: Omit<TradeRecord, 'id'>): Promise<void> {
    try {
      // For now, just log the trade - in production would use a dedicated trade table
      console.log(`📊 Trade recorded: ${trade.symbol} ${trade.side} P&L: ${trade.pnl.toFixed(2)} (${trade.pnlPct.toFixed(2)}%)`)

      // Could extend OrderRecord with trade data or create separate TradeRecord table
      // For MVP, we just log and return
    } catch (error) {
      console.error('Failed to record trade:', error)
    }
  }

  /**
   * Get performance metrics (simplified - returns mock data for now)
   */
  async getPerformanceMetrics(
    startDate?: Date,
    endDate?: Date,
    symbol?: string
  ): Promise<PerformanceMetrics> {
    // Simplified implementation - in production would query actual trade data
    // For now return realistic mock data
    const mockTrades = this.generateMockTrades()

    if (mockTrades.length === 0) {
      return this.getEmptyMetrics()
    }

    const winningTrades = mockTrades.filter(t => t.pnl > 0)
    const losingTrades = mockTrades.filter(t => t.pnl < 0)

    const totalPnl = mockTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))

    const winRate = winningTrades.length / mockTrades.length
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0

    // Sharpe ratio (simplified)
    const returns = mockTrades.map(t => t.pnlPct)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    )
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(365) : 0

    // Max drawdown (simplified)
    let peak = 0
    let maxDrawdown = 0
    let runningPnl = 0

    for (const trade of mockTrades) {
      runningPnl += trade.pnl
      if (runningPnl > peak) {
        peak = runningPnl
      }
      const drawdown = peak - runningPnl
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    // Trade duration
    const durations = mockTrades.map(t =>
      t.exitTime.getTime() - t.entryTime.getTime()
    )
    const avgTradeDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length

    // Best/worst trades
    const bestTrade = Math.max(...mockTrades.map(t => t.pnl))
    const worstTrade = Math.min(...mockTrades.map(t => t.pnl))

    // Expectancy (Kelly criterion)
    const expectancy = winRate * avgWin - (1 - winRate) * avgLoss

    const totalPnlPct = mockTrades.reduce((sum, t) => sum + t.pnlPct, 0)

    return {
      totalTrades: mockTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      totalPnl,
      totalPnlPct,
      avgTradeDuration,
      bestTrade,
      worstTrade,
      expectancy
    }
  }

  /**
   * Generate mock trade data for demonstration
   */
  private generateMockTrades(): TradeRecord[] {
    const mockTrades: TradeRecord[] = []
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']
    const setups = ['SQUEEZE', 'VWAP', 'BREAKOUT']
    const regimes = ['TREND_UP', 'RANGE', 'VOLATILE_BREAKOUT']

    for (let i = 0; i < 50; i++) {
      const entryTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      const duration = Math.random() * 8 * 60 * 60 * 1000 + 30 * 60 * 1000 // 30min to 8hours
      const exitTime = new Date(entryTime.getTime() + duration)

      const pnlPct = (Math.random() - 0.45) * 0.1 // -4.5% to +5.5% roughly
      const quantity = Math.random() * 0.5 + 0.1 // 0.1 to 0.6
      const entryPrice = 50000 + Math.random() * 10000 // Mock price
      const pnl = pnlPct * entryPrice * quantity

      mockTrades.push({
        id: `mock_trade_${i}`,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        side: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        quantity,
        entryPrice,
        exitPrice: entryPrice * (1 + pnlPct),
        entryTime,
        exitTime,
        pnl,
        pnlPct,
        commission: Math.abs(pnl) * 0.0004, // 0.04% commission
        setupType: setups[Math.floor(Math.random() * setups.length)],
        regime: regimes[Math.floor(Math.random() * regimes.length)]
      })
    }

    return mockTrades.sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime())
  }

  /**
   * Get daily statistics (simplified - returns mock data)
   */
  async getDailyStats(startDate?: Date, endDate?: Date): Promise<DailyStats[]> {
    // Simplified implementation - in production would query actual trade data
    const mockTrades = this.generateMockTrades()

    // Group by date
    const dailyMap = new Map<string, { pnl: number; trades: TradeRecord[]; volume: number }>()

    for (const trade of mockTrades) {
      const dateKey = trade.exitTime.toISOString().split('T')[0]
      const existing = dailyMap.get(dateKey) || { pnl: 0, trades: [], volume: 0 }

      existing.pnl += trade.pnl
      existing.trades.push(trade)
      existing.volume += trade.quantity * trade.entryPrice
      dailyMap.set(dateKey, existing)
    }

    // Convert to array
    const dailyStats: DailyStats[] = []

    for (const [date, data] of dailyMap) {
      const winningTrades = data.trades.filter(t => t.pnl > 0).length
      const winRate = data.trades.length > 0 ? winningTrades / data.trades.length : 0

      dailyStats.push({
        date,
        pnl: data.pnl,
        trades: data.trades.length,
        winRate,
        volume: data.volume
      })
    }

    return dailyStats.sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get trades by setup type
   */
  async getSetupPerformance(): Promise<Record<string, PerformanceMetrics>> {
    const setupTypes = ['SQUEEZE', 'VWAP', 'BREAKOUT', 'FADE']

    const setupMetrics: Record<string, PerformanceMetrics> = {}

    for (const setupType of setupTypes) {
      setupMetrics[setupType] = await this.getPerformanceMetrics(
        undefined,
        undefined,
        undefined // Could filter by setup type if stored
      )
    }

    return setupMetrics
  }

  /**
   * Get trades by regime
   */
  async getRegimePerformance(): Promise<Record<string, PerformanceMetrics>> {
    const regimes = ['TREND_UP', 'TREND_DOWN', 'RANGE', 'VOLATILE_BREAKOUT']

    const regimeMetrics: Record<string, PerformanceMetrics> = {}

    for (const regime of regimes) {
      regimeMetrics[regime] = await this.getPerformanceMetrics(
        undefined,
        undefined,
        undefined // Could filter by regime if stored
      )
    }

    return regimeMetrics
  }

  /**
   * Calculate drawdown periods (simplified - returns mock data)
   */
  async getDrawdownPeriods(): Promise<Array<{
    startDate: Date
    endDate: Date
    maxDrawdown: number
    duration: number
    recoveryTime?: number
  }>> {
    // Simplified implementation - in production would calculate from actual trade data
    const mockTrades = this.generateMockTrades()

    if (mockTrades.length < 2) return []

    const drawdownPeriods: Array<{
      startDate: Date
      endDate: Date
      maxDrawdown: number
      duration: number
      recoveryTime?: number
    }> = []

    let peak = 0
    let runningPnl = 0
    let drawdownStart: Date | null = null
    let maxDrawdownInPeriod = 0

    for (let i = 0; i < mockTrades.length; i++) {
      const trade = mockTrades[i]
      runningPnl += trade.pnl

      if (runningPnl > peak) {
        // End of drawdown period
        if (drawdownStart) {
          drawdownPeriods.push({
            startDate: drawdownStart,
            endDate: trade.exitTime,
            maxDrawdown: maxDrawdownInPeriod,
            duration: trade.exitTime.getTime() - drawdownStart.getTime()
          })
          drawdownStart = null
          maxDrawdownInPeriod = 0
        }
        peak = runningPnl
      } else {
        // In drawdown
        const drawdown = peak - runningPnl
        if (drawdown > maxDrawdownInPeriod) {
          maxDrawdownInPeriod = drawdown
        }
        if (!drawdownStart) {
          drawdownStart = trade.exitTime
        }
      }
    }

    return drawdownPeriods
  }

  /**
   * Get risk-adjusted metrics (simplified - returns mock data)
   */
  async getRiskMetrics(): Promise<{
    calmarRatio: number
    sortinoRatio: number
    ulcerIndex: number
    valueAtRisk: number
  }> {
    const mockTrades = this.generateMockTrades()

    if (mockTrades.length < 30) {
      return { calmarRatio: 0, sortinoRatio: 0, ulcerIndex: 0, valueAtRisk: 0 }
    }

    const returns = mockTrades.map(t => t.pnlPct)
    const totalPnl = mockTrades.reduce((sum, t) => sum + t.pnl, 0)

    // Calmar ratio (annual return / max drawdown)
    const metrics = await this.getPerformanceMetrics()
    const annualReturn = (totalPnl / 10000) * (365 / (mockTrades.length / 30)) // Rough annualization
    const calmarRatio = metrics.maxDrawdown > 0 ? annualReturn / metrics.maxDrawdown : 0

    // Sortino ratio (downside deviation)
    const negativeReturns = returns.filter(r => r < 0)
    const downsideStdDev = negativeReturns.length > 0
      ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length)
      : 0
    const sortinoRatio = downsideStdDev > 0 ? (annualReturn / downsideStdDev) : 0

    // Ulcer Index (drawdown volatility)
    const drawdowns = await this.getDrawdownPeriods()
    const avgDrawdown = drawdowns.length > 0 ? drawdowns.reduce((sum, d) => sum + d.maxDrawdown, 0) / drawdowns.length : 0
    const ulcerIndex = Math.sqrt(avgDrawdown)

    // Value at Risk (95% confidence)
    returns.sort((a, b) => a - b)
    const varIndex = Math.floor(returns.length * 0.05)
    const valueAtRisk = returns[varIndex] || 0

    return {
      calmarRatio,
      sortinoRatio,
      ulcerIndex,
      valueAtRisk
    }
  }

  /**
   * Export trades to CSV (simplified - returns mock data)
   */
  async exportTradesToCSV(startDate?: Date, endDate?: Date): Promise<string> {
    const mockTrades = this.generateMockTrades()

    const csvHeader = 'Date,Symbol,Side,Quantity,Entry Price,Exit Price,P&L,P&L %,Setup,Regime\n'
    const csvRows = mockTrades.map(trade =>
      `${trade.exitTime.toISOString()},${trade.symbol},${trade.side},${trade.quantity},${trade.entryPrice},${trade.exitPrice},${trade.pnl},${trade.pnlPct},${trade.setupType || ''},${trade.regime || ''}`
    ).join('\n')

    return csvHeader + csvRows
  }

  /**
   * Get empty metrics structure
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      totalPnl: 0,
      totalPnlPct: 0,
      avgTradeDuration: 0,
      bestTrade: 0,
      worstTrade: 0,
      expectancy: 0
    }
  }
}
