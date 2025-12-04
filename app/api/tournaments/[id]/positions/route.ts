import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Positions API
 * Manage positions within a tournament (isolated from regular paper trading)
 */

/**
 * GET /api/tournaments/[id]/positions
 * Get all open positions for current user in tournament
 */
export async function GET(
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

    // Get participant
    const { data: participant } = await supabase
      .from('paper_trading_tournament_participants')
      .select('id')
      .eq('tournament_id', params.id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not registered in tournament' }, { status: 404 });
    }

    const { data: positions, error } = await supabase
      .from('paper_trading_tournament_positions')
      .select('*')
      .eq('tournament_id', params.id)
      .eq('participant_id', participant.id)
      .order('entry_time', { ascending: false });

    if (error) {
      console.error('Error fetching tournament positions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Error in GET /api/tournaments/[id]/positions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tournaments/[id]/positions
 * Open new position in tournament
 */
export async function POST(
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

    // Get tournament and participant
    const { data: tournament } = await supabase
      .from('paper_trading_tournaments')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!tournament || tournament.status !== 'in_progress') {
      return NextResponse.json({ error: 'Tournament not in progress' }, { status: 400 });
    }

    const { data: participant } = await supabase
      .from('paper_trading_tournament_participants')
      .select('*')
      .eq('tournament_id', params.id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not registered in tournament' }, { status: 404 });
    }

    const body = await request.json();
    const { symbol, assetType, side, quantity, entryPrice, currentPrice, strategy } = body;

    // Validation
    if (!symbol || !assetType || !side || !quantity || !entryPrice || !currentPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check position size limit
    const positionValue = parseFloat(entryPrice) * parseFloat(quantity);
    const maxPositionValue = (participant.current_equity * tournament.max_position_size_percent) / 100;

    if (positionValue > maxPositionValue) {
      return NextResponse.json(
        { error: `Position size exceeds ${tournament.max_position_size_percent}% limit` },
        { status: 400 }
      );
    }

    // Calculate unrealized P&L
    const unrealizedPnL = side === 'long'
      ? (parseFloat(currentPrice) - parseFloat(entryPrice)) * parseFloat(quantity)
      : (parseFloat(entryPrice) - parseFloat(currentPrice)) * parseFloat(quantity);
    const unrealizedPnLPercent = (unrealizedPnL / (parseFloat(entryPrice) * parseFloat(quantity))) * 100;

    const { data: position, error } = await supabase
      .from('paper_trading_tournament_positions')
      .insert({
        tournament_id: params.id,
        participant_id: participant.id,
        symbol: symbol.toUpperCase().trim(),
        asset_type: assetType,
        side,
        quantity: parseFloat(quantity),
        entry_price: parseFloat(entryPrice),
        current_price: parseFloat(currentPrice),
        strategy: strategy || null,
        unrealized_pnl: unrealizedPnL,
        unrealized_pnl_percent: unrealizedPnLPercent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tournament position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tournaments/[id]/positions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
