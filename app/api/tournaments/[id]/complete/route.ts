import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Completion API
 * Manually trigger tournament completion and prize distribution (admin only)
 */

/**
 * POST /api/tournaments/[id]/complete
 * Complete tournament and award prizes
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('paper_trading_tournaments')
      .select('*')
      .eq('id', params.id)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    if (tournament.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Tournament must be in progress to complete' },
        { status: 400 }
      );
    }

    // Update final rankings
    const { error: rankingError } = await supabase.rpc('update_tournament_rankings', {
      p_tournament_id: params.id,
    });

    if (rankingError) {
      console.error('Error updating rankings:', rankingError);
      return NextResponse.json({ error: rankingError.message }, { status: 500 });
    }

    // Set final ranks
    const { data: participants } = await supabase
      .from('paper_trading_tournament_participants')
      .select('id, current_rank')
      .eq('tournament_id', params.id)
      .eq('is_active', true)
      .eq('is_disqualified', false)
      .not('current_rank', 'is', null)
      .order('current_rank', { ascending: true });

    if (participants) {
      for (const participant of participants) {
        await supabase
          .from('paper_trading_tournament_participants')
          .update({ final_rank: participant.current_rank })
          .eq('id', participant.id);
      }
    }

    // Mark tournament as completed (trigger will award prizes)
    const { data: updated, error: updateError } = await supabase
      .from('paper_trading_tournaments')
      .update({ status: 'completed' })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error completing tournament:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Manually trigger prize award (in case trigger doesn't fire)
    const { error: prizeError } = await supabase.rpc('award_tournament_prizes', {
      p_tournament_id: params.id,
    });

    if (prizeError) {
      console.error('Error awarding prizes:', prizeError);
      // Continue anyway, prizes can be awarded manually later
    }

    return NextResponse.json({
      ...updated,
      prizesAwarded: !prizeError,
    });
  } catch (error) {
    console.error('Error in POST /api/tournaments/[id]/complete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
