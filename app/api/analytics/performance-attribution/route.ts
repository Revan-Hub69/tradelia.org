import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Performance Attribution API
 * Analisi attribuzione rendimento per strategia, asset, timeframe
 * 
 * Best Practice: Academic compliance, MIFID 2, solo analisi descrittiva
 */

interface AttributionBreakdown {
  byStrategy: Array<{
    strategy: string;
    trades: number;
    totalReturn: number;
    totalReturnPercent: number;
    winRate: number;
    sharpeRatio: number;
    contribution: number; // % del rendimento totale
  }>;
  byAsset: Array<{
    symbol: string;
    assetType: string;
    trades: number;
    totalReturn: number;
    totalReturnPercent: number;
    winRate: number;
    contribution: number;
  }>;
  byTimeframe: Array<{
    period: string; // 'daily', 'weekly', 'monthly'
    trades: number;
    totalReturn: number;
    totalReturnPercent: number;
    avgReturn: number;
  }>;
  byDayOfWeek: Array<{
    day: string;
    trades: number;
    totalReturn: number;
    winRate: number;
    avgReturn: number;
  }>;
  summary: {
    totalTrades: number;
    totalReturn: number;
    bestStrategy: string;
    bestAsset: string;
    bestTimeframe: string;
    bestDay: string;
  };
}

/**
 * GET /api/analytics/performance-attribution
 * Get performance attribution analysis
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
      .order('exit_time', { ascending: false });

    if (historyError) {
      console.error('Error fetching history:', historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    if (!history || history.length === 0) {
      return NextResponse.json({
        byStrategy: [],
        byAsset: [],
        byTimeframe: [],
        byDayOfWeek: [],
        summary: {
          totalTrades: 0,
          totalReturn: 0,
          bestStrategy: 'N/A',
          bestAsset: 'N/A',
          bestTimeframe: 'N/A',
          bestDay: 'N/A',
        },
      });
    }

    // Calculate total return
    const totalReturn = history.reduce((sum, trade) => sum + parseFloat(trade.realized_pnl.toString()), 0);

    // Attribution by Strategy
    const strategyMap = new Map<string, any[]>();
    history.forEach(trade => {
      const strategy = trade.strategy || 'No Strategy';
      if (!strategyMap.has(strategy)) {
        strategyMap.set(strategy, []);
      }
      strategyMap.get(strategy)!.push(trade);
    });

    const byStrategy = Array.from(strategyMap.entries()).map(([strategy, trades]) => {
      const strategyReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
      const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0).length;
      const winRate = (winningTrades / trades.length) * 100;
      
      // Calculate Sharpe for strategy (simplified)
      const returns = trades.map(t => parseFloat(t.realized_pnl_percent.toString()) / 100);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? (avgReturn * Math.sqrt(252)) / stdDev : 0;

      return {
        strategy,
        trades: trades.length,
        totalReturn: strategyReturn,
        totalReturnPercent: (strategyReturn / Math.abs(totalReturn)) * 100,
        winRate,
        sharpeRatio,
        contribution: totalReturn !== 0 ? (strategyReturn / totalReturn) * 100 : 0,
      };
    }).sort((a, b) => b.totalReturn - a.totalReturn);

    // Attribution by Asset
    const assetMap = new Map<string, any[]>();
    history.forEach(trade => {
      const key = `${trade.symbol}-${trade.asset_type}`;
      if (!assetMap.has(key)) {
        assetMap.set(key, []);
      }
      assetMap.get(key)!.push(trade);
    });

    const byAsset = Array.from(assetMap.entries()).map(([key, trades]) => {
      const [symbol, assetType] = key.split('-');
      const assetReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
      const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0).length;
      const winRate = (winningTrades / trades.length) * 100;

      return {
        symbol,
        assetType,
        trades: trades.length,
        totalReturn: assetReturn,
        totalReturnPercent: (assetReturn / Math.abs(totalReturn)) * 100,
        winRate,
        contribution: totalReturn !== 0 ? (assetReturn / totalReturn) * 100 : 0,
      };
    }).sort((a, b) => b.totalReturn - a.totalReturn);

    // Attribution by Timeframe (daily, weekly, monthly)
    const timeframeMap = new Map<string, any[]>();
    history.forEach(trade => {
      const entryDate = new Date(trade.entry_time);
      const exitDate = new Date(trade.exit_time);
      const days = Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let period = 'monthly';
      if (days <= 1) period = 'daily';
      else if (days <= 7) period = 'weekly';
      
      if (!timeframeMap.has(period)) {
        timeframeMap.set(period, []);
      }
      timeframeMap.get(period)!.push(trade);
    });

    const byTimeframe = Array.from(timeframeMap.entries()).map(([period, trades]) => {
      const timeframeReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
      const avgReturn = timeframeReturn / trades.length;

      return {
        period,
        trades: trades.length,
        totalReturn: timeframeReturn,
        totalReturnPercent: (timeframeReturn / Math.abs(totalReturn)) * 100,
        avgReturn,
      };
    }).sort((a, b) => b.totalReturn - a.totalReturn);

    // Attribution by Day of Week
    const dayMap = new Map<string, any[]>();
    history.forEach(trade => {
      const exitDate = new Date(trade.exit_time);
      const day = exitDate.toLocaleDateString('it-IT', { weekday: 'long' });
      
      if (!dayMap.has(day)) {
        dayMap.set(day, []);
      }
      dayMap.get(day)!.push(trade);
    });

    const byDayOfWeek = Array.from(dayMap.entries()).map(([day, trades]) => {
      const dayReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
      const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0).length;
      const winRate = (winningTrades / trades.length) * 100;
      const avgReturn = dayReturn / trades.length;

      return {
        day,
        trades: trades.length,
        totalReturn: dayReturn,
        winRate,
        avgReturn,
      };
    }).sort((a, b) => b.totalReturn - a.totalReturn);

    // Summary
    const bestStrategy = byStrategy[0]?.strategy || 'N/A';
    const bestAsset = byAsset[0]?.symbol || 'N/A';
    const bestTimeframe = byTimeframe[0]?.period || 'N/A';
    const bestDay = byDayOfWeek[0]?.day || 'N/A';

    const attribution: AttributionBreakdown = {
      byStrategy,
      byAsset,
      byTimeframe,
      byDayOfWeek,
      summary: {
        totalTrades: history.length,
        totalReturn,
        bestStrategy,
        bestAsset,
        bestTimeframe,
        bestDay,
      },
    };

    return NextResponse.json(attribution);
  } catch (error) {
    console.error('Error in GET /api/analytics/performance-attribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
