import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/watchlist/alerts?watchlistId=xxx
 * Lista tutti gli alert per una watchlist o per l'utente
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

    const { searchParams } = new URL(request.url);
    const watchlistId = searchParams.get('watchlistId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = supabase
      .from('watchlist_alerts')
      .select('*, watchlist(asset_symbol, asset_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (watchlistId) {
      query = query.eq('watchlist_id', watchlistId);
    }

    if (activeOnly) {
      query = query.eq('is_active', true).eq('is_triggered', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/watchlist/alerts:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/watchlist/alerts
 * Crea un nuovo alert target
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
    const {
      watchlist_id,
      alert_type,
      target_value,
      comparison_operator,
      notify_via_push,
      notify_via_email,
      notify_via_sms,
      notes,
    } = body;

    if (!watchlist_id || !alert_type || target_value === undefined) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // Verifica che la watchlist appartenga all'utente
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlist')
      .select('id')
      .eq('id', watchlist_id)
      .eq('user_id', user.id)
      .single();

    if (watchlistError || !watchlist) {
      return NextResponse.json({ error: 'Watchlist non trovata' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('watchlist_alerts')
      .insert({
        watchlist_id,
        user_id: user.id,
        alert_type,
        target_value,
        comparison_operator: comparison_operator || '>=',
        notify_via_push: notify_via_push !== false, // Default true
        notify_via_email: notify_via_email || false,
        notify_via_sms: notify_via_sms || false,
        notes: notes || null,
        is_active: true,
        is_triggered: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/watchlist/alerts:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/watchlist/alerts?id=alert_id
 * Aggiorna un alert
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID alert richiesto' }, { status: 400 });
    }

    const body = await request.json();
    const {
      target_value,
      comparison_operator,
      notify_via_push,
      notify_via_email,
      notify_via_sms,
      is_active,
      notes,
    } = body;

    const updateData: any = {};
    if (target_value !== undefined) updateData.target_value = target_value;
    if (comparison_operator !== undefined) updateData.comparison_operator = comparison_operator;
    if (notify_via_push !== undefined) updateData.notify_via_push = notify_via_push;
    if (notify_via_email !== undefined) updateData.notify_via_email = notify_via_email;
    if (notify_via_sms !== undefined) updateData.notify_via_sms = notify_via_sms;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('watchlist_alerts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Sicurezza: solo il proprietario può aggiornare
      .select()
      .single();

    if (error) {
      console.error('Error updating alert:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/watchlist/alerts:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/watchlist/alerts?id=alert_id
 * Elimina un alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID alert richiesto' }, { status: 400 });
    }

    const { error } = await supabase
      .from('watchlist_alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Sicurezza: solo il proprietario può eliminare

    if (error) {
      console.error('Error deleting alert:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/watchlist/alerts:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

