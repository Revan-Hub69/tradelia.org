import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/trading-journal
 * Recupera tutti i trade dell'utente
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
    const symbol = searchParams.get('symbol');
    const isClosed = searchParams.get('isClosed');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('trading_journal')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(limit);

    if (symbol) {
      query = query.eq('symbol', symbol.toUpperCase());
    }

    if (isClosed !== null) {
      query = query.eq('is_closed', isClosed === 'true');
    }

    const { data: trades, error } = await query;

    if (error) {
      console.error('Error fetching trades:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(trades || []);
  } catch (error) {
    console.error('Error in GET /api/trading-journal:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trading-journal
 * Crea nuovo trade entry
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
      symbol,
      trade_type,
      entry_date,
      exit_date,
      entry_price,
      exit_price,
      quantity,
      entry_fee,
      exit_fee,
      strategy,
      setup_type,
      timeframe,
      entry_reason,
      exit_reason,
      notes,
      emotions,
      tags,
      category,
    } = body;

    // Validazione
    if (!symbol || !trade_type || !entry_date || !entry_price || !quantity) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    const symbolUpper = symbol.trim().toUpperCase().slice(0, 10);
    if (!/^[A-Z]{1,10}$/.test(symbolUpper)) {
      return NextResponse.json({ error: 'Simbolo non valido' }, { status: 400 });
    }

    if (!['buy', 'sell', 'long', 'short'].includes(trade_type)) {
      return NextResponse.json({ error: 'Tipo trade non valido' }, { status: 400 });
    }

    const qty = parseFloat(quantity);
    const entryPrc = parseFloat(entry_price);
    if (isNaN(qty) || isNaN(entryPrc) || qty <= 0 || entryPrc <= 0) {
      return NextResponse.json({ error: 'Quantità e prezzo entry devono essere numeri positivi' }, { status: 400 });
    }

    // Crea trade
    const { data: trade, error } = await supabase
      .from('trading_journal')
      .insert({
        user_id: user.id,
        symbol: symbolUpper,
        trade_type,
        entry_date: new Date(entry_date).toISOString(),
        exit_date: exit_date ? new Date(exit_date).toISOString() : null,
        entry_price: Math.round(entryPrc * 100) / 100,
        exit_price: exit_price ? Math.round(parseFloat(exit_price) * 100) / 100 : null,
        quantity: Math.round(qty * 100) / 100,
        entry_fee: entry_fee ? Math.round(parseFloat(entry_fee) * 100) / 100 : 0,
        exit_fee: exit_fee ? Math.round(parseFloat(exit_fee) * 100) / 100 : 0,
        strategy: strategy || null,
        setup_type: setup_type || null,
        timeframe: timeframe || null,
        entry_reason: entry_reason || null,
        exit_reason: exit_reason || null,
        notes: notes || null,
        emotions: emotions || null,
        tags: tags || [],
        category: category || null,
        is_closed: !!exit_price,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trade:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/trading-journal:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

