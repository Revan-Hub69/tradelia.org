import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Strategy Comparison API
 * Confronto performance tra strategie diverse
 * 
 * Best Practice: Academic compliance, solo analisi descrittiva
 */

interface StrategyComparison {
  strategies: Array<{
    strategy: string;
    trades: number;
    totalReturn: number;
    totalReturnPercent: number;
    avgReturn: number;
    winRate: number;
    sharpeRatio: number;
    calmarRatio: number;
    maxDrawdown: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    expectancy: number;
  }>;
  ranking: {
    byReturn: Array<{ strategy: string; rank: number }>;
    bySharpe: Array<{ strategy: string; rank: number }>;
    byWinRate: Array<{ strategy: string; rank: number }>;
    byProfitFactor: Array<{ strategy: string; rank: number }>;
  };
  correlations: Array<{
    strategy1: string;
    strategy2: string;
    correlation: number;
  }>;
  summary: {
    bestByReturn: string;
    bestBySharpe: string;
    bestByWinRate: string;
    mostConsistent: string;
  };
}

/**
 * Calculate correlation between two strategy returns
 */
function calculateCorrelation(returns1: number[], returns2: number[]): number {
  if (returns1.length !== returns2.length || returns1.length === 0) return 0;

  const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
  const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;

  let numerator = 0;
  let sumSq1 = 0;
  let sumSq2 = 0;

  for (let i = 0; i < returns1.length; i++) {
    const diff1 = returns1[i] - mean1;
    const diff2 = returns2[i] - mean2;
    numerator += diff1 * diff2;
    sumSq1 += diff1 * diff1;
    sumSq2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sumSq1 * sumSq2);
  return denominator > 0 ? numerator / denominator : 0;
}

/**
 * GET /api/analytics/strategy-comparison
 * Compare performance of different strategies
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all closed trades
    const { data: history, error: historyError } = await supabase
      .from('paper_trading_history')
      .select('*')
      .eq('user_id', user.id)
      .order('exit_time', { ascending: true });

    if (historyError) {
      console.error('Error fetching history:', historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    if (!history || history.length === 0) {
      return NextResponse.json({
        strategies: [],
        ranking: { byReturn: [], bySharpe: [], byWinRate: [], byProfitFactor: [] },
        correlations: [],
        summary: {
          bestByReturn: 'N/A',
          bestBySharpe: 'N/A',
          bestByWinRate: 'N/A',
          mostConsistent: 'N/A',
        },
      });
    }

    // Group by strategy
    const strategyMap = new Map<string, any[]>();
    history.forEach(trade => {
      const strategy = trade.strategy || 'No Strategy';
      if (!strategyMap.has(strategy)) {
        strategyMap.set(strategy, []);
      }
      strategyMap.get(strategy)!.push(trade);
    });

    // Calculate metrics for each strategy
    const strategies = Array.from(strategyMap.entries()).map(([strategy, trades]) => {
      const returns = trades.map(t => parseFloat(t.realized_pnl.toString()));
      const returnPercents = trades.map(t => parseFloat(t.realized_pnl_percent.toString()));
      
      const totalReturn = returns.reduce((sum, r) => sum + r, 0);
      const totalReturnPercent = returnPercents.reduce((sum, r) => sum + r, 0);
      const avgReturn = totalReturn / trades.length;

      const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0);
      const losingTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) <= 0);
      const winRate = (winningTrades.length / trades.length) * 100;

      const avgWin = winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0) / winningTrades.length
        : 0;
      const avgLoss = losingTrades.length > 0
        ? losingTrades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0) / losingTrades.length
        : 0;

      const largestWin = Math.max(...returns, 0);
      const largestLoss = Math.min(...returns, 0);

      const grossProfit = winningTrades.reduce((sum, t) => sum + Math.abs(parseFloat(t.realized_pnl.toString())), 0);
      const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

      const expectancy = (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss;

      // Calculate Sharpe Ratio
      const avgReturnPercent = returnPercents.reduce((sum, r) => sum + r, 0) / returnPercents.length;
      const variance = returnPercents.reduce((sum, r) => sum + Math.pow(r - avgReturnPercent, 2), 0) / returnPercents.length;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? (avgReturnPercent * Math.sqrt(252)) / (stdDev * Math.sqrt(252)) : 0;

      // Calculate Max Drawdown and Calmar Ratio
      let peak = 0;
      let maxDrawdown = 0;
      let cumulativeReturn = 0;

      for (const trade of trades) {
        cumulativeReturn += parseFloat(trade.realized_pnl.toString());
        if (cumulativeReturn > peak) {
          peak = cumulativeReturn;
        }
        const drawdown = peak - cumulativeReturn;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }

      const calmarRatio = maxDrawdown > 0 && peak > 0 ? (totalReturn / Math.abs(peak)) / (maxDrawdown / Math.abs(peak)) : 0;

      return {
        strategy,
        trades: trades.length,
        totalReturn,
        totalReturnPercent,
        avgReturn,
        winRate,
        sharpeRatio,
        calmarRatio,
        maxDrawdown,
        profitFactor,
        avgWin,
        avgLoss,
        largestWin,
        largestLoss,
        expectancy,
      };
    });

    // Rankings
    const byReturn = strategies
      .map(s => ({ strategy: s.strategy, rank: 0 }))
      .sort((a, b) => {
        const aReturn = strategies.find(s => s.strategy === a.strategy)!.totalReturn;
        const bReturn = strategies.find(s => s.strategy === b.strategy)!.totalReturn;
        return bReturn - aReturn;
      })
      .map((s, i) => ({ ...s, rank: i + 1 }));

    const bySharpe = strategies
      .map(s => ({ strategy: s.strategy, rank: 0 }))
      .sort((a, b) => {
        const aSharpe = strategies.find(s => s.strategy === a.strategy)!.sharpeRatio;
        const bSharpe = strategies.find(s => s.strategy === b.strategy)!.sharpeRatio;
        return bSharpe - aSharpe;
      })
      .map((s, i) => ({ ...s, rank: i + 1 }));

    const byWinRate = strategies
      .map(s => ({ strategy: s.strategy, rank: 0 }))
      .sort((a, b) => {
        const aWinRate = strategies.find(s => s.strategy === a.strategy)!.winRate;
        const bWinRate = strategies.find(s => s.strategy === b.strategy)!.winRate;
        return bWinRate - aWinRate;
      })
      .map((s, i) => ({ ...s, rank: i + 1 }));

    const byProfitFactor = strategies
      .map(s => ({ strategy: s.strategy, rank: 0 }))
      .sort((a, b) => {
        const aPF = strategies.find(s => s.strategy === a.strategy)!.profitFactor;
        const bPF = strategies.find(s => s.strategy === b.strategy)!.profitFactor;
        return bPF - aPF;
      })
      .map((s, i) => ({ ...s, rank: i + 1 }));

    // Calculate correlations between strategies
    const correlations: Array<{ strategy1: string; strategy2: string; correlation: number }> = [];
    const strategyNames = Array.from(strategyMap.keys());

    for (let i = 0; i < strategyNames.length; i++) {
      for (let j = i + 1; j < strategyNames.length; j++) {
        const strategy1 = strategyNames[i];
        const strategy2 = strategyNames[j];

        // Get returns for both strategies (aligned by time)
        const trades1 = strategyMap.get(strategy1)!;
        const trades2 = strategyMap.get(strategy2)!;

        // Create time-aligned return series
        const allDates = new Set([
          ...trades1.map(t => new Date(t.exit_time).toISOString().split('T')[0]),
          ...trades2.map(t => new Date(t.exit_time).toISOString().split('T')[0]),
        ]);

        const returns1: number[] = [];
        const returns2: number[] = [];

        Array.from(allDates).sort().forEach(date => {
          const trade1 = trades1.find(t => new Date(t.exit_time).toISOString().split('T')[0] === date);
          const trade2 = trades2.find(t => new Date(t.exit_time).toISOString().split('T')[0] === date);

          returns1.push(trade1 ? parseFloat(trade1.realized_pnl_percent.toString()) : 0);
          returns2.push(trade2 ? parseFloat(trade2.realized_pnl_percent.toString()) : 0);
        });

        const correlation = calculateCorrelation(returns1, returns2);
        correlations.push({ strategy1, strategy2, correlation });
      }
    }

    // Summary
    const bestByReturn = byReturn[0]?.strategy || 'N/A';
    const bestBySharpe = bySharpe[0]?.strategy || 'N/A';
    const bestByWinRate = byWinRate[0]?.strategy || 'N/A';
    const mostConsistent = strategies
      .sort((a, b) => {
        // Consistency = low std dev of returns
        const aStdDev = Math.sqrt(
          strategyMap.get(a.strategy)!.reduce((sum, t, i, arr) => {
            const mean = a.avgReturn;
            const val = parseFloat(t.realized_pnl.toString());
            return sum + Math.pow(val - mean, 2);
          }, 0) / strategyMap.get(a.strategy)!.length
        );
        const bStdDev = Math.sqrt(
          strategyMap.get(b.strategy)!.reduce((sum, t, i, arr) => {
            const mean = b.avgReturn;
            const val = parseFloat(t.realized_pnl.toString());
            return sum + Math.pow(val - mean, 2);
          }, 0) / strategyMap.get(b.strategy)!.length
        );
        return aStdDev - bStdDev;
      })[0]?.strategy || 'N/A';

    const comparison: StrategyComparison = {
      strategies,
      ranking: {
        byReturn,
        bySharpe,
        byWinRate,
        byProfitFactor,
      },
      correlations,
      summary: {
        bestByReturn,
        bestBySharpe,
        bestByWinRate,
        mostConsistent,
      },
    };

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error in GET /api/analytics/strategy-comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
