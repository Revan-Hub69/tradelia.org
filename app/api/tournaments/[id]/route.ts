import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament API (Single)
 * Get, update, or delete tournament
 */

/**
 * GET /api/tournaments/[id]
 * Get tournament details with participants count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: tournament, error } = await supabase
      .from('paper_trading_tournaments')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
      console.error('Error fetching tournament:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get participants count
    const { count: participantsCount } = await supabase
      .from('paper_trading_tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', params.id)
      .eq('is_active', true)
      .eq('is_disqualified', false);

    // Get rules
    const { data: rules } = await supabase
      .from('paper_trading_tournament_rules')
      .select('*')
      .eq('tournament_id', params.id);

    return NextResponse.json({
      ...tournament,
      participantsCount: participantsCount || 0,
      rules: rules || [],
    });
  } catch (error) {
    console.error('Error in GET /api/tournaments/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tournaments/[id]
 * Update tournament (admin only)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, ...updates } = body;

    // Validate status transitions
    if (status) {
      const { data: current } = await supabase
        .from('paper_trading_tournaments')
        .select('status')
        .eq('id', params.id)
        .single();

      if (current) {
        // Validate status transition
        const validTransitions: Record<string, string[]> = {
          draft: ['open_registration', 'cancelled'],
          open_registration: ['in_progress', 'cancelled'],
          in_progress: ['completed', 'cancelled'],
          completed: [],
          cancelled: [],
        };

        if (!validTransitions[current.status]?.includes(status)) {
          return NextResponse.json(
            { error: `Invalid status transition from ${current.status} to ${status}` },
            { status: 400 }
          );
        }
      }
    }

    const { data: updated, error } = await supabase
      .from('paper_trading_tournaments')
      .update({
        ...updates,
        ...(status && { status }),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tournament:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/tournaments/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
