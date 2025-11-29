import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface BootstrapPayload {
  userId?: string;
  email?: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BootstrapPayload;
    const userId = body.userId?.trim();
    const email = body.email?.toLowerCase().trim();
    const name = body.name?.trim();

    if (!userId || !email || !name) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const profilePromise = supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          user_id: userId,
          display_name: name,
        },
        { onConflict: 'user_id' }
      );

    const rolePromise = supabaseAdmin
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          role: 'trial',
        },
        { onConflict: 'user_id' }
      );

    const [profileResult, roleResult] = await Promise.all([profilePromise, rolePromise]);

    if (profileResult.error) {
      console.error('Errore upsert profilo', profileResult.error);
      return NextResponse.json({ error: 'Impossibile creare il profilo' }, { status: 500 });
    }

    if (roleResult.error) {
      console.error('Errore upsert ruolo', roleResult.error);
      return NextResponse.json({ error: 'Impossibile assegnare il ruolo' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Errore bootstrap utente', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
