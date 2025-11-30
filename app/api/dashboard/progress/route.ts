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

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const [coursesResult, achievementsResult] = await Promise.all([
      getUserCourseProgress(user.id),
      getUserAchievements(user.id),
    ]);

    if (coursesResult.error || achievementsResult.error) {
      return NextResponse.json(
        { error: 'Errore recupero dati' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      courses: coursesResult.data,
      achievements: achievementsResult.data,
    });
  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

