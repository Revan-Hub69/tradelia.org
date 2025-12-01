import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserCourseProgress, getUserAchievements } from '@/lib/supabase/server-services';

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
        courses: [],
        achievements: [],
      });
    }

    try {
      const [coursesResult, achievementsResult] = await Promise.all([
        getUserCourseProgress(user.id),
        getUserAchievements(user.id),
      ]);

      // Se ci sono errori (es. tabelle mancanti), restituisci dati vuoti
      if (coursesResult.error || achievementsResult.error) {
        console.error('Error getting progress (tables might not exist):', {
          courses: coursesResult.error,
          achievements: achievementsResult.error,
        });
        return NextResponse.json({
          courses: [],
          achievements: [],
        });
      }

      return NextResponse.json({
        courses: coursesResult.data || [],
        achievements: achievementsResult.data || [],
      });
    } catch (dbError) {
      // Se c'è un errore del database (tabelle mancanti), restituisci dati vuoti
      console.error('Database error in progress GET (tables might not exist):', dbError);
      return NextResponse.json({
        courses: [],
        achievements: [],
      });
    }
  } catch (error) {
    console.error('Error in progress API:', error);
    // Restituisci dati vuoti invece di errore
    return NextResponse.json({
      courses: [],
      achievements: [],
    });
  }
}

