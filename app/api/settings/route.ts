import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/settings
 * Recupera impostazioni utente
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Recupera profilo utente
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('display_name, bio, language, timezone, email_notifications, push_notifications')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile || {});
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings
 * Aggiorna impostazioni utente
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const {
      display_name,
      bio,
      language,
      timezone,
      email_notifications,
      push_notifications,
    } = body;

    // Validazione con Zod (opzionale, già fatto lato client)
    const updateData: any = {};
    if (display_name !== undefined) updateData.display_name = display_name?.trim() || null;
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in PATCH /api/settings:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

