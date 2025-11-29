import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface OnboardingPayload {
  userId?: string;
  company?: string;
  country?: string;
  role?: string;
  acceptsResearch?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OnboardingPayload;
    const userId = body.userId?.trim();

    if (!userId) {
      return NextResponse.json({ error: 'userId mancante' }, { status: 400 });
    }

    const profileUpdates = {
      country: body.country?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const roleUpdates = {
      role: body.role?.trim() || 'trial',
      onboarding_completed_at: new Date().toISOString(),
    };

    const notificationsUpdates = {
      accepts_research: body.acceptsResearch ?? null,
    };

    const [profileResult, roleResult, notificationResult] = await Promise.all([
      supabaseAdmin.from('user_profiles').update(profileUpdates).eq('user_id', userId),
      supabaseAdmin.from('user_roles').update(roleUpdates).eq('user_id', userId),
      supabaseAdmin
        .from('user_notification_preferences')
        .upsert(
          {
            user_id: userId,
            ...notificationsUpdates,
          },
          { onConflict: 'user_id' }
        ),
    ]);

    if (profileResult.error) {
      console.error('Errore aggiornamento profilo', profileResult.error);
      return NextResponse.json({ error: 'Impossibile aggiornare il profilo' }, { status: 500 });
    }

    if (roleResult.error) {
      console.error('Errore aggiornamento ruolo', roleResult.error);
      return NextResponse.json({ error: 'Impossibile aggiornare il ruolo' }, { status: 500 });
    }

    if (notificationResult.error) {
      console.error('Errore aggiornamento preferenze', notificationResult.error);
      return NextResponse.json({ error: 'Impossibile aggiornare le preferenze' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Errore onboarding', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
