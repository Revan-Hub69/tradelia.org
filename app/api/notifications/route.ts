import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * API unificata per gestire notifiche (subscriptions e preferences)
 * Rispetta il limite di 12 serverless functions di Vercel
 * 
 * GET /api/notifications?type=subscriptions|preferences
 * POST /api/notifications?action=subscribe|unsubscribe|update-preferences
 */

interface SubscriptionPayload {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

interface PreferencesPayload {
  notification_method?: 'email' | 'sms' | 'whatsapp';
  phone_number?: string;
  enabled?: boolean;
}

// GET: Leggi subscriptions o preferences
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'subscriptions';

    if (type === 'subscriptions') {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore lettura subscriptions:', error);
        return NextResponse.json({ error: 'Errore lettura subscriptions' }, { status: 500 });
      }

      return NextResponse.json({ subscriptions: data || [] });
    }

    if (type === 'preferences') {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (normale se non esiste ancora)
        console.error('Errore lettura preferences:', error);
        return NextResponse.json({ error: 'Errore lettura preferences' }, { status: 500 });
      }

      return NextResponse.json({ preferences: data || null });
    }

    return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 });
  } catch (error) {
    console.error('Errore GET notifications:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// POST: Crea/aggiorna subscriptions o preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'subscribe';
    const body = await request.json();

    if (action === 'subscribe') {
      const payload = body as SubscriptionPayload;

      if (!payload.subscription || !payload.subscription.endpoint) {
        return NextResponse.json({ error: 'Subscription non valida' }, { status: 400 });
      }

      // Usa admin per upsert (potrebbe servire per override RLS in alcuni casi)
      const { data, error } = await supabaseAdmin
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user.id,
            subscription: payload.subscription,
          },
          {
            onConflict: 'user_id,endpoint',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Errore salvataggio subscription:', error);
        return NextResponse.json({ error: 'Errore salvataggio subscription' }, { status: 500 });
      }

      return NextResponse.json({ subscription: data });
    }

    if (action === 'unsubscribe') {
      const { endpoint } = body as { endpoint?: string };

      if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint richiesto' }, { status: 400 });
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint);

      if (error) {
        console.error('Errore rimozione subscription:', error);
        return NextResponse.json({ error: 'Errore rimozione subscription' }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === 'update-preferences') {
      const payload = body as PreferencesPayload;

      const { data, error } = await supabaseAdmin
        .from('user_notification_preferences')
        .upsert(
          {
            user_id: user.id,
            notification_method: payload.notification_method || 'email',
            phone_number: payload.phone_number || null,
            enabled: payload.enabled !== undefined ? payload.enabled : true,
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Errore aggiornamento preferences:', error);
        return NextResponse.json({ error: 'Errore aggiornamento preferences' }, { status: 500 });
      }

      return NextResponse.json({ preferences: data });
    }

    return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
  } catch (error) {
    console.error('Errore POST notifications:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

