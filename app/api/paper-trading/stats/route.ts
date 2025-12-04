import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Paper Trading Stats API
 * 
 * Best Practice: Statistics per gamification e performance tracking
 * Academic references: Sharpe (1964), Calmar ratio, Win rate analysis
 */

/**
 * GET /api/paper-trading/stats
 * Get user paper trading statistics
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

    // Get or create stats
    let { data: stats, error } = await supabase
      .from('paper_trading_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Stats don't exist, create them
      const { data: newStats, error: createError } = await supabase
        .from('paper_trading_stats')
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating stats:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      stats = newStats;
    } else if (error) {
      console.error('Error fetching stats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate additional metrics from history
    const { data: history } = await supabase
      .from('paper_trading_history')
      .select('*')
      .eq('user_id', user.id)
      .order('exit_time', { ascending: false });

    if (history && history.length > 0) {
      // Calculate Sharpe Ratio (simplified)
      const returns = history.map(h => h.realized_pnl_percent / 100);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? (avgReturn * 252 - 0.02) / (stdDev * Math.sqrt(252)) : 0;

      // Calculate max drawdown
      let peak = 0;
      let maxDrawdown = 0;
      let cumulativePnL = 0;

      for (const trade of history.sort((a, b) => 
        new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
      )) {
        cumulativePnL += trade.realized_pnl;
        if (cumulativePnL > peak) {
          peak = cumulativePnL;
        }
        const drawdown = peak - cumulativePnL;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }

      // Update stats with calculated metrics
      const { error: updateError } = await supabase
        .from('paper_trading_stats')
        .update({
          sharpe_ratio: sharpeRatio,
          max_drawdown: maxDrawdown > 0 ? (maxDrawdown / Math.abs(peak)) * 100 : 0,
        })
        .eq('user_id', user.id);

      if (!updateError && stats) {
        stats.sharpe_ratio = sharpeRatio;
        stats.max_drawdown = maxDrawdown > 0 ? (maxDrawdown / Math.abs(peak)) * 100 : 0;
      }
    }

    return NextResponse.json(stats || {
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      total_pnl: 0,
      max_drawdown: 0,
      sharpe_ratio: 0,
      current_win_streak: 0,
      max_win_streak: 0,
    });
  } catch (error) {
    console.error('Error in GET /api/paper-trading/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
