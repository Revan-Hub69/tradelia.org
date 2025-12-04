import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Paper Trading Position API (Single)
 * Update or delete position
 */

/**
 * PATCH /api/paper-trading/positions/[id]
 * Update position (e.g., update current price)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPrice } = body;

    if (!currentPrice || isNaN(parseFloat(currentPrice)) || parseFloat(currentPrice) <= 0) {
      return NextResponse.json({ error: 'Invalid current price' }, { status: 400 });
    }

    // Get current position
    const { data: position, error: fetchError } = await supabase
      .from('paper_trading_positions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    // Calculate new unrealized P&L
    const newPrice = parseFloat(currentPrice);
    const unrealizedPnL = position.side === 'long'
      ? (newPrice - position.entry_price) * position.quantity
      : (position.entry_price - newPrice) * position.quantity;
    const unrealizedPnLPercent = (unrealizedPnL / (position.entry_price * position.quantity)) * 100;

    const { data: updated, error } = await supabase
      .from('paper_trading_positions')
      .update({
        current_price: newPrice,
        unrealized_pnl: unrealizedPnL,
        unrealized_pnl_percent: unrealizedPnLPercent,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/paper-trading/positions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/paper-trading/positions/[id]
 * Close position (move to history)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get position
    const { data: position, error: fetchError } = await supabase
      .from('paper_trading_positions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    const exitPrice = position.current_price;
    const exitTime = new Date().toISOString();
    
    // Calculate realized P&L
    const realizedPnL = position.side === 'long'
      ? (exitPrice - position.entry_price) * position.quantity
      : (position.entry_price - exitPrice) * position.quantity;
    const realizedPnLPercent = (realizedPnL / (position.entry_price * position.quantity)) * 100;

    // Move to history
    const { error: historyError } = await supabase
      .from('paper_trading_history')
      .insert({
        user_id: user.id,
        symbol: position.symbol,
        asset_type: position.asset_type,
        side: position.side,
        quantity: position.quantity,
        entry_price: position.entry_price,
        exit_price: exitPrice,
        entry_time: position.entry_time,
        exit_time: exitTime,
        realized_pnl: realizedPnL,
        realized_pnl_percent: realizedPnLPercent,
        strategy: position.strategy,
        notes: position.notes,
      });

    if (historyError) {
      console.error('Error saving to history:', historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    // Delete position
    const { error: deleteError } = await supabase
      .from('paper_trading_positions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting position:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update stats (for gamification)
    await updatePaperTradingStats(user.id, realizedPnL > 0);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/paper-trading/positions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update paper trading stats for gamification
 */
async function updatePaperTradingStats(userId: string, isWin: boolean) {
  try {
    const supabase = await createClient();
    
    // Get current stats
    const { data: stats } = await supabase
      .from('paper_trading_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentStreak = stats?.current_win_streak || 0;
    const newStreak = isWin ? currentStreak + 1 : 0;
    const maxStreak = Math.max(stats?.max_win_streak || 0, newStreak);

    const { error } = await supabase
      .from('paper_trading_stats')
      .upsert({
        user_id: userId,
        total_trades: (stats?.total_trades || 0) + 1,
        winning_trades: isWin ? (stats?.winning_trades || 0) + 1 : (stats?.winning_trades || 0),
        losing_trades: !isWin ? (stats?.losing_trades || 0) + 1 : (stats?.losing_trades || 0),
        current_win_streak: newStreak,
        max_win_streak: maxStreak,
        last_trade_date: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error updating stats:', error);
    }
  } catch (error) {
    console.error('Error in updatePaperTradingStats:', error);
  }
}
