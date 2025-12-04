import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Registration API
 * Register user for tournament
 */

/**
 * POST /api/tournaments/[id]/register
 * Register current user for tournament
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

    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('paper_trading_tournaments')
      .select('*')
      .eq('id', params.id)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Check registration period
    const now = new Date();
    const regStart = new Date(tournament.registration_start);
    const regEnd = new Date(tournament.registration_end);

    if (now < regStart || now > regEnd) {
      return NextResponse.json(
        { error: 'Registration period is closed' },
        { status: 400 }
      );
    }

    if (tournament.status !== 'open_registration') {
      return NextResponse.json(
        { error: 'Tournament is not accepting registrations' },
        { status: 400 }
      );
    }

    // Check eligibility
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (tournament.require_pro && profile?.role !== 'pro' && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Pro subscription required' },
        { status: 403 }
      );
    }

    // Check user level
    const { data: stats } = await supabase
      .from('user_stats')
      .select('current_level')
      .eq('user_id', user.id)
      .single();

    if (stats && stats.current_level < tournament.min_level) {
      return NextResponse.json(
        { error: `Minimum level ${tournament.min_level} required` },
        { status: 403 }
      );
    }

    // Check max participants
    if (tournament.max_participants) {
      const { count: currentCount } = await supabase
        .from('paper_trading_tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', params.id)
        .eq('is_active', true);

      if ((currentCount || 0) >= tournament.max_participants) {
        return NextResponse.json(
          { error: 'Tournament is full' },
          { status: 400 }
        );
      }
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('paper_trading_tournament_participants')
      .select('id')
      .eq('tournament_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered' },
        { status: 400 }
      );
    }

    // Register participant
    const { data: participant, error: participantError } = await supabase
      .from('paper_trading_tournament_participants')
      .insert({
        tournament_id: params.id,
        user_id: user.id,
        initial_capital: tournament.initial_capital,
        current_equity: tournament.initial_capital,
      })
      .select()
      .single();

    if (participantError) {
      console.error('Error registering participant:', participantError);
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tournaments/[id]/register:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
