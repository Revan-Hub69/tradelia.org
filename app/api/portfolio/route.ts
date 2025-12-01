import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/portfolio
 * Recupera tutte le posizioni portfolio dell'utente
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

    // Recupera posizioni portfolio
    const { data: positions, error } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolio:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Error in GET /api/portfolio:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * Crea nuova posizione portfolio
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
    const { symbol, quantity, price, notes } = body;

    // Validazione
    if (!symbol || !quantity || !price) {
      return NextResponse.json({ error: 'Symbol, quantity e price sono obbligatori' }, { status: 400 });
    }

    const symbolUpper = symbol.trim().toUpperCase().slice(0, 10);
    if (!/^[A-Z]{1,10}$/.test(symbolUpper)) {
      return NextResponse.json({ error: 'Simbolo non valido' }, { status: 400 });
    }

    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    if (isNaN(qty) || isNaN(prc) || qty <= 0 || prc <= 0) {
      return NextResponse.json({ error: 'Quantità e prezzo devono essere numeri positivi' }, { status: 400 });
    }

    // Calcola total
    const total = Math.round(qty * prc * 100) / 100;

    // Crea posizione
    const { data: position, error } = await supabase
      .from('portfolio_positions')
      .insert({
        user_id: user.id,
        symbol: symbolUpper,
        quantity: Math.round(qty * 100) / 100,
        price: Math.round(prc * 100) / 100,
        total_value: total,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/portfolio:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

