import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/watchlist
 * Lista tutti gli asset in watchlist dell'utente
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
    const includeAlerts = searchParams.get('includeAlerts') === 'true';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = supabase
      .from('watchlist')
      .select(includeAlerts ? '*, watchlist_alerts(*)' : '*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching watchlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/watchlist:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/watchlist
 * Aggiunge un nuovo asset alla watchlist
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
    const { asset_symbol, asset_name, asset_type, exchange, notes, tags, priority } = body;

    if (!asset_symbol) {
      return NextResponse.json({ error: 'Simbolo asset richiesto' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        asset_symbol: asset_symbol.toUpperCase(),
        asset_name: asset_name || null,
        asset_type: asset_type || 'stock',
        exchange: exchange || null,
        notes: notes || null,
        tags: tags || null,
        priority: priority || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      // Se errore è "duplicate key", asset già in watchlist
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Asset già presente in watchlist' }, { status: 409 });
      }
      console.error('Error adding to watchlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/watchlist:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/watchlist?id=watchlist_id
 * Rimuove un asset dalla watchlist
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
      return NextResponse.json({ error: 'ID watchlist richiesto' }, { status: 400 });
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Sicurezza: solo il proprietario può eliminare

    if (error) {
      console.error('Error deleting from watchlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/watchlist:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/watchlist?id=watchlist_id
 * Aggiorna un asset in watchlist
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
      return NextResponse.json({ error: 'ID watchlist richiesto' }, { status: 400 });
    }

    const body = await request.json();
    const { asset_name, notes, tags, priority, is_active } = body;

    const updateData: any = {};
    if (asset_name !== undefined) updateData.asset_name = asset_name;
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (priority !== undefined) updateData.priority = priority;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('watchlist')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Sicurezza: solo il proprietario può aggiornare
      .select()
      .single();

    if (error) {
      console.error('Error updating watchlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/watchlist:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

