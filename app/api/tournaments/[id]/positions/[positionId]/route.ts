import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Position API (Single)
 * Update or close position in tournament
 */

/**
 * PATCH /api/tournaments/[id]/positions/[positionId]
 * Update position (e.g., update current price)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; positionId: string } }
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

    // Get participant
    const { data: participant } = await supabase
      .from('paper_trading_tournament_participants')
      .select('id')
      .eq('tournament_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not registered in tournament' }, { status: 404 });
    }

    // Get position
    const { data: position, error: fetchError } = await supabase
      .from('paper_trading_tournament_positions')
      .select('*')
      .eq('id', params.positionId)
      .eq('participant_id', participant.id)
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
      .from('paper_trading_tournament_positions')
      .update({
        current_price: newPrice,
        unrealized_pnl: unrealizedPnL,
        unrealized_pnl_percent: unrealizedPnLPercent,
      })
      .eq('id', params.positionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tournament position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/tournaments/[id]/positions/[positionId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tournaments/[id]/positions/[positionId]
 * Close position (move to history and update participant stats)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; positionId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get participant
    const { data: participant } = await supabase
      .from('paper_trading_tournament_participants')
      .select('*')
      .eq('tournament_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not registered in tournament' }, { status: 404 });
    }

    // Get position
    const { data: position, error: fetchError } = await supabase
      .from('paper_trading_tournament_positions')
      .select('*')
      .eq('id', params.positionId)
      .eq('participant_id', participant.id)
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
      .from('paper_trading_tournament_history')
      .insert({
        tournament_id: params.id,
        participant_id: participant.id,
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
      });

    if (historyError) {
      console.error('Error saving to tournament history:', historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    // Delete position
    const { error: deleteError } = await supabase
      .from('paper_trading_tournament_positions')
      .delete()
      .eq('id', params.positionId);

    if (deleteError) {
      console.error('Error deleting tournament position:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update participant stats
    const newTotalPnL = participant.total_pnl + realizedPnL;
    const newTotalTrades = participant.total_trades + 1;
    const newWinningTrades = realizedPnL > 0 ? participant.winning_trades + 1 : participant.winning_trades;
    const newLosingTrades = realizedPnL <= 0 ? participant.losing_trades + 1 : participant.losing_trades;
    const newWinRate = newTotalTrades > 0 ? (newWinningTrades / newTotalTrades) * 100 : 0;
    const newEquity = participant.current_equity + realizedPnL;
    const newReturnPercent = ((newEquity - participant.initial_capital) / participant.initial_capital) * 100;

    await supabase
      .from('paper_trading_tournament_participants')
      .update({
        total_pnl: newTotalPnL,
        total_trades: newTotalTrades,
        winning_trades: newWinningTrades,
        losing_trades: newLosingTrades,
        win_rate: newWinRate,
        current_equity: newEquity,
        total_return_percent: newReturnPercent,
        last_update: new Date().toISOString(),
      })
      .eq('id', participant.id);

    // Update rankings
    await supabase.rpc('update_tournament_rankings', {
      p_tournament_id: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/tournaments/[id]/positions/[positionId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
