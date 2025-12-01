import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Permetti accesso guest - restituisci statistiche di default invece di 401
    if (authError || !user) {
      return NextResponse.json({
        total_xp: 0,
        current_level: 1,
        xp_to_next_level: 100,
        streak_days: 0,
        last_activity_date: null,
      });
    }

    try {
      const { data: stats, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Se c'è un errore (es. tabella non esiste o record non trovato), restituisci default
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting gamification stats (table might not exist):', error);
        return NextResponse.json({
          total_xp: 0,
          current_level: 1,
          xp_to_next_level: 100,
          streak_days: 0,
          last_activity_date: null,
        });
      }

      // Return default stats if not found
      return NextResponse.json({
        total_xp: stats?.total_xp || 0,
        current_level: stats?.current_level || 1,
        xp_to_next_level: stats?.xp_to_next_level || 100,
        streak_days: stats?.streak_days || 0,
        last_activity_date: stats?.last_activity_date || null,
      });
    } catch (dbError) {
      // Se c'è un errore del database (tabella mancante), restituisci default
      console.error('Database error in gamification stats GET (table might not exist):', dbError);
      return NextResponse.json({
        total_xp: 0,
        current_level: 1,
        xp_to_next_level: 100,
        streak_days: 0,
        last_activity_date: null,
      });
    }
  } catch (error) {
    console.error('Error in stats API:', error);
    // Restituisci statistiche di default invece di errore
    return NextResponse.json({
      total_xp: 0,
      current_level: 1,
      xp_to_next_level: 100,
      streak_days: 0,
      last_activity_date: null,
    });
  }
}

