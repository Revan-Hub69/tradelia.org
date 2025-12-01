import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/settings/password
 * Cambia password utente
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Password attuale e nuova password sono obbligatorie' }, { status: 400 });
    }

    // Validazione password (min 8 caratteri, maiuscola, minuscola, numero)
    if (new_password.length < 8) {
      return NextResponse.json({ error: 'Password minimo 8 caratteri' }, { status: 400 });
    }
    if (!/[A-Z]/.test(new_password)) {
      return NextResponse.json({ error: 'Password deve contenere almeno una maiuscola' }, { status: 400 });
    }
    if (!/[a-z]/.test(new_password)) {
      return NextResponse.json({ error: 'Password deve contenere almeno una minuscola' }, { status: 400 });
    }
    if (!/[0-9]/.test(new_password)) {
      return NextResponse.json({ error: 'Password deve contenere almeno un numero' }, { status: 400 });
    }

    // Verifica password attuale
    const { data: { user: verifiedUser }, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password,
    });

    if (signInError || !verifiedUser) {
      return NextResponse.json({ error: 'Password attuale non corretta' }, { status: 401 });
    }

    // Aggiorna password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password aggiornata con successo' });
  } catch (error) {
    console.error('Error in PATCH /api/settings/password:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

