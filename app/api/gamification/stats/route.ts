import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Errore nel recupero statistiche' },
        { status: 500 }
      );
    }

    // Return default stats if not found
    return NextResponse.json({
      total_xp: stats?.total_xp || 0,
      current_level: stats?.current_level || 1,
      xp_to_next_level: stats?.xp_to_next_level || 100,
      streak_days: stats?.streak_days || 0,
      last_activity_date: stats?.last_activity_date || null,
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

