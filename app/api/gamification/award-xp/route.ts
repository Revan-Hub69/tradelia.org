import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { awardXP } from '@/lib/gamification/achievement-engine';

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
    const { amount, source } = body;

    if (!amount || !source) {
      return NextResponse.json(
        { error: 'Campi mancanti' },
        { status: 400 }
      );
    }

    const { success, error } = await awardXP(user.id, amount, source);

    if (!success || error) {
      return NextResponse.json(
        { error: 'Errore nell\'assegnazione XP' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in award-xp API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

