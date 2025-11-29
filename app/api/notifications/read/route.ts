import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Endpoint per marcare notifiche come lette
 * POST /api/notifications/read
 * Body: { notificationIds: string[] } oppure { all: true }
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
    const { notificationIds, all } = body;

    if (all) {
      // Marca tutte come lette
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Errore aggiornamento notifiche:', error);
        return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, updated: 'all' });
    }

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'notificationIds richiesto' }, { status: 400 });
    }

    // Marca specifiche notifiche come lette
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .in('id', notificationIds);

    if (error) {
      console.error('Errore aggiornamento notifiche:', error);
      return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated: notificationIds.length });
  } catch (error) {
    console.error('Errore POST notifications/read:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

