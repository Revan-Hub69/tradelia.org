import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserAchievements } from '@/lib/supabase/server-services';

/**
 * GET /api/dashboard/progress
 * Restituisce solo achievements (corsi rimossi - focus su analisi)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Permetti accesso guest - restituisci dati vuoti invece di 401
    if (authError || !user) {
      return NextResponse.json({
        achievements: [],
      });
    }

    try {
      const achievementsResult = await getUserAchievements(user.id);

      // Se ci sono errori (es. tabelle mancanti), restituisci dati vuoti
      if (achievementsResult.error) {
        console.error('Error getting achievements (tables might not exist):', achievementsResult.error);
        return NextResponse.json({
          achievements: [],
        });
      }

      return NextResponse.json({
        achievements: achievementsResult.data || [],
      });
    } catch (dbError) {
      // Se c'è un errore del database (tabelle mancanti), restituisci dati vuoti
      console.error('Database error in progress GET (tables might not exist):', dbError);
      return NextResponse.json({
        achievements: [],
      });
    }
  } catch (error) {
    console.error('Error in progress API:', error);
    // Restituisci dati vuoti invece di errore
    return NextResponse.json({
      achievements: [],
    });
  }
}

