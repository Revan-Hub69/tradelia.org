import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateStreak } from '@/lib/gamification/achievement-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Restituisci successo silenzioso invece di 401 per guest access
      // Questo previene errori in console per utenti non autenticati
      return NextResponse.json({ streak: 0, isNewRecord: false }, { status: 200 });
    }

    const { streak, isNewRecord } = await updateStreak(user.id);

    return NextResponse.json({ streak, isNewRecord });
  } catch (error) {
    console.error('Error in update-streak API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

