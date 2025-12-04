import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Stats API
 * Get participant statistics in tournament
 */

/**
 * GET /api/tournaments/[id]/stats
 * Get current user's stats in tournament
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

    // Get participant stats
    const { data: participant, error } = await supabase
      .from('paper_trading_tournament_participants')
      .select('*')
      .eq('tournament_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not registered in tournament' }, { status: 404 });
      }
      console.error('Error fetching tournament stats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get open positions count
    const { count: openPositions } = await supabase
      .from('paper_trading_tournament_positions')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', params.id)
      .eq('participant_id', participant.id);

    // Get tournament details for context
    const { data: tournament } = await supabase
      .from('paper_trading_tournaments')
      .select('name, scoring_method, min_trades_required')
      .eq('id', params.id)
      .single();

    return NextResponse.json({
      ...participant,
      openPositions: openPositions || 0,
      tournament: tournament || null,
    });
  } catch (error) {
    console.error('Error in GET /api/tournaments/[id]/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
