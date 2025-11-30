import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndUnlockAchievements } from '@/lib/gamification/achievement-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { actionType } = body;

    if (!actionType || !['lesson_completed', 'course_completed', 'report_viewed', 'daily_login'].includes(actionType)) {
      return NextResponse.json(
        { error: 'Tipo azione non valido' },
        { status: 400 }
      );
    }

    const { unlocked, error } = await checkAndUnlockAchievements(user.id, actionType);

    if (error) {
      return NextResponse.json(
        { error: 'Errore nel controllo achievement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ unlocked });
  } catch (error) {
    console.error('Error in check-achievements API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

