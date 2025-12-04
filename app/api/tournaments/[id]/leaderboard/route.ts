import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Leaderboard API
 * Get tournament leaderboard
 */

/**
 * GET /api/tournaments/[id]/leaderboard
 * Get tournament leaderboard (top N participants)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Get tournament
    const { data: tournament } = await supabase
      .from('paper_trading_tournaments')
      .select('status')
      .eq('id', params.id)
      .single();

    if (!tournament || !['in_progress', 'completed'].includes(tournament.status)) {
      return NextResponse.json(
        { error: 'Tournament leaderboard not available' },
        { status: 404 }
      );
    }

    // Get leaderboard
    const { data: leaderboard, error } = await supabase
      .from('paper_trading_tournament_participants')
      .select(`
        id,
        current_rank,
        score,
        total_return_percent,
        sharpe_ratio,
        max_drawdown,
        win_rate,
        total_trades,
        user_id,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('tournament_id', params.id)
      .eq('is_active', true)
      .eq('is_disqualified', false)
      .order('current_rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(leaderboard || []);
  } catch (error) {
    console.error('Error in GET /api/tournaments/[id]/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
