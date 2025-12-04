import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Start API
 * Start tournament (change status to in_progress) - Admin only
 */

/**
 * POST /api/tournaments/[id]/start
 * Start tournament (begin trading period)
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

    if (tournament.status !== 'open_registration') {
      return NextResponse.json(
        { error: `Tournament must be in open_registration status, currently: ${tournament.status}` },
        { status: 400 }
      );
    }

    // Check if registration period has ended
    const now = new Date();
    const regEnd = new Date(tournament.registration_end);

    if (now < regEnd) {
      return NextResponse.json(
        { error: 'Registration period has not ended yet' },
        { status: 400 }
      );
    }

    // Update status to in_progress
    const { data: updated, error: updateError } = await supabase
      .from('paper_trading_tournaments')
      .update({ status: 'in_progress' })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error starting tournament:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in POST /api/tournaments/[id]/start:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
