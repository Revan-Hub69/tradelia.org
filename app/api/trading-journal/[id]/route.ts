import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/trading-journal/[id]
 * Aggiorna trade entry
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();

    // Verifica che il trade appartenga all'utente
    const { data: existing, error: checkError } = await supabase
      .from('trading_journal')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Trade non trovato' }, { status: 404 });
    }

    // Aggiorna solo i campi forniti
    const updateData: any = {};
    const allowedFields = [
      'symbol', 'trade_type', 'entry_date', 'exit_date',
      'entry_price', 'exit_price', 'quantity',
      'entry_fee', 'exit_fee', 'strategy', 'setup_type',
      'timeframe', 'entry_reason', 'exit_reason', 'notes',
      'emotions', 'tags', 'category'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['entry_price', 'exit_price', 'quantity', 'entry_fee', 'exit_fee'].includes(field)) {
          const val = parseFloat(body[field]);
          if (!isNaN(val) && val >= 0) {
            updateData[field] = Math.round(val * 100) / 100;
          }
        } else if (field === 'symbol') {
          const symbolUpper = body[field].trim().toUpperCase().slice(0, 10);
          if (/^[A-Z]{1,10}$/.test(symbolUpper)) {
            updateData[field] = symbolUpper;
          }
        } else if (['entry_date', 'exit_date'].includes(field)) {
          updateData[field] = body[field] ? new Date(body[field]).toISOString() : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Se exit_price viene aggiunto, marca come chiuso
    if (updateData.exit_price !== undefined && updateData.exit_price !== null) {
      updateData.is_closed = true;
    }

    const { data: trade, error } = await supabase
      .from('trading_journal')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trade:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error in PATCH /api/trading-journal/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trading-journal/[id]
 * Elimina trade entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Verifica che il trade appartenga all'utente
    const { data: existing, error: checkError } = await supabase
      .from('trading_journal')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Trade non trovato' }, { status: 404 });
    }

    const { error } = await supabase
      .from('trading_journal')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting trade:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/trading-journal/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

