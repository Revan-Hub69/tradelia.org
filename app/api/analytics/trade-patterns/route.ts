import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Trade Patterns API
 * Analisi pattern nei trade (giorno, ora, asset, strategia)
 * 
 * Best Practice: Solo analisi descrittiva, NO predizioni
 */

interface TradePatterns {
  byDayOfWeek: Array<{
    day: string;
    trades: number;
    totalReturn: number;
    winRate: number;
    avgReturn: number;
  }>;
  byHour: Array<{
    hour: number;
    trades: number;
    totalReturn: number;
    winRate: number;
    avgReturn: number;
  }>;
  byMonth: Array<{
    month: string;
    trades: number;
    totalReturn: number;
    winRate: number;
    avgReturn: number;
  }>;
  byAssetType: Array<{
    assetType: string;
    trades: number;
    totalReturn: number;
    winRate: number;
    avgReturn: number;
  }>;
  bestPerforming: {
    bestDay: string;
    bestHour: number;
    bestMonth: string;
    bestAssetType: string;
  };
  patterns: Array<{
    pattern: string;
    description: string;
    evidence: string;
  }>;
}

/**
 * GET /api/analytics/trade-patterns
 * Analyze trade patterns
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
        byDayOfWeek: [],
        byHour: [],
        byMonth: [],
        byAssetType: [],
        bestPerforming: {
          bestDay: 'N/A',
          bestHour: -1,
          bestMonth: 'N/A',
          bestAssetType: 'N/A',
        },
        patterns: [],
      });
    }

    // Patterns by Day of Week
    const dayMap = new Map<string, any[]>();
    history.forEach(trade => {
      const date = new Date(trade.exit_time);
      const day = date.toLocaleDateString('it-IT', { weekday: 'long' });
      if (!dayMap.has(day)) {
        dayMap.set(day, []);
      }
      dayMap.get(day)!.push(trade);
    });

    const byDayOfWeek = Array.from(dayMap.entries()).map(([day, trades]) => {
      const totalReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
      const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0).length;
      const winRate = (winningTrades / trades.length) * 100;
      const avgReturn = totalReturn / trades.length;

      return {
        day,
        trades: trades.length,
        totalReturn,
        winRate,
        avgReturn,
      };
    }).sort((a, b) => b.totalReturn - a.totalReturn);

    // Patterns by Hour
    const hourMap = new Map<number, any[]>();
    history.forEach(trade => {
      const date = new Date(trade.exit_time);
      const hour = date.getHours();
      if (!hourMap.has(hour)) {
        hourMap.set(hour, []);
      }
      hourMap.get(hour)!.push(trade);
    });

    const byHour = Array.from(hourMap.entries())
      .map(([hour, trades]) => {
        const totalReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
        const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0).length;
        const winRate = (winningTrades / trades.length) * 100;
        const avgReturn = totalReturn / trades.length;

        return {
          hour,
          trades: trades.length,
          totalReturn,
          winRate,
          avgReturn,
        };
      })
      .sort((a, b) => a.hour - b.hour);

    // Patterns by Month
    const monthMap = new Map<string, any[]>();
    history.forEach(trade => {
      const date = new Date(trade.exit_time);
      const month = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      if (!monthMap.has(month)) {
        monthMap.set(month, []);
      }
      monthMap.get(month)!.push(trade);
    });

    const byMonth = Array.from(monthMap.entries()).map(([month, trades]) => {
      const totalReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
      const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0).length;
      const winRate = (winningTrades / trades.length) * 100;
      const avgReturn = totalReturn / trades.length;

      return {
        month,
        trades: trades.length,
        totalReturn,
        winRate,
        avgReturn,
      };
    }).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateB.getTime() - dateA.getTime();
    });

    // Patterns by Asset Type
    const assetTypeMap = new Map<string, any[]>();
    history.forEach(trade => {
      const assetType = trade.asset_type;
      if (!assetTypeMap.has(assetType)) {
        assetTypeMap.set(assetType, []);
      }
      assetTypeMap.get(assetType)!.push(trade);
    });

    const byAssetType = Array.from(assetTypeMap.entries()).map(([assetType, trades]) => {
      const totalReturn = trades.reduce((sum, t) => sum + parseFloat(t.realized_pnl.toString()), 0);
      const winningTrades = trades.filter(t => parseFloat(t.realized_pnl.toString()) > 0).length;
      const winRate = (winningTrades / trades.length) * 100;
      const avgReturn = totalReturn / trades.length;

      return {
        assetType,
        trades: trades.length,
        totalReturn,
        winRate,
        avgReturn,
      };
    }).sort((a, b) => b.totalReturn - a.totalReturn);

    // Best Performing
    const bestDay = byDayOfWeek[0]?.day || 'N/A';
    const bestHour = byHour.sort((a, b) => b.totalReturn - a.totalReturn)[0]?.hour || -1;
    const bestMonth = byMonth.sort((a, b) => b.totalReturn - a.totalReturn)[0]?.month || 'N/A';
    const bestAssetType = byAssetType[0]?.assetType || 'N/A';

    // Identify Patterns (descriptive only, based on data)
    const patterns: Array<{ pattern: string; description: string; evidence: string }> = [];

    // Pattern: Day of week performance
    if (byDayOfWeek.length > 0) {
      const bestDayData = byDayOfWeek[0];
      const worstDayData = byDayOfWeek[byDayOfWeek.length - 1];
      if (bestDayData.totalReturn > worstDayData.totalReturn * 1.5) {
        patterns.push({
          pattern: 'Day of Week Performance',
          description: `Migliori performance il ${bestDayData.day}`,
          evidence: `${bestDayData.day}: ${bestDayData.totalReturn.toFixed(2)} vs ${worstDayData.day}: ${worstDayData.totalReturn.toFixed(2)}`,
        });
      }
    }

    // Pattern: Asset type preference
    if (byAssetType.length > 1) {
      const bestAsset = byAssetType[0];
      const totalTrades = byAssetType.reduce((sum, a) => sum + a.trades, 0);
      const assetPercent = (bestAsset.trades / totalTrades) * 100;
      if (assetPercent > 50) {
        patterns.push({
          pattern: 'Asset Type Concentration',
          description: `Concentrazione su ${bestAsset.assetType}`,
          evidence: `${assetPercent.toFixed(1)}% dei trade su ${bestAsset.assetType}`,
        });
      }
    }

    // Pattern: Win rate consistency
    const avgWinRate = byDayOfWeek.reduce((sum, d) => sum + d.winRate, 0) / byDayOfWeek.length;
    const winRateStdDev = Math.sqrt(
      byDayOfWeek.reduce((sum, d) => sum + Math.pow(d.winRate - avgWinRate, 2), 0) / byDayOfWeek.length
    );
    if (winRateStdDev < 5) {
      patterns.push({
        pattern: 'Consistent Win Rate',
        description: 'Win rate consistente tra giorni della settimana',
        evidence: `Deviazione standard win rate: ${winRateStdDev.toFixed(2)}%`,
      });
    }

    const tradePatterns: TradePatterns = {
      byDayOfWeek,
      byHour,
      byMonth,
      byAssetType,
      bestPerforming: {
        bestDay,
        bestHour,
        bestMonth,
        bestAssetType,
      },
      patterns,
    };

    return NextResponse.json(tradePatterns);
  } catch (error) {
    console.error('Error in GET /api/analytics/trade-patterns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
