import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/portfolio/[id]
 * Aggiorna posizione portfolio
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
    const { quantity, price, notes } = body;

    // Verifica che la posizione appartenga all'utente
    const { data: existing, error: checkError } = await supabase
      .from('portfolio_positions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Posizione non trovata' }, { status: 404 });
    }

    // Aggiorna solo i campi forniti
    const updateData: any = {};
    if (quantity !== undefined) {
      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: 'Quantità deve essere un numero positivo' }, { status: 400 });
      }
      updateData.quantity = Math.round(qty * 100) / 100;
    }
    if (price !== undefined) {
      const prc = parseFloat(price);
      if (isNaN(prc) || prc <= 0) {
        return NextResponse.json({ error: 'Prezzo deve essere un numero positivo' }, { status: 400 });
      }
      updateData.price = Math.round(prc * 100) / 100;
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    // Ricalcola total se quantity o price cambiano
    if (updateData.quantity !== undefined || updateData.price !== undefined) {
      const { data: current } = await supabase
        .from('portfolio_positions')
        .select('quantity, price')
        .eq('id', params.id)
        .single();

      const finalQty = updateData.quantity ?? current?.quantity;
      const finalPrice = updateData.price ?? current?.price;
      updateData.total_value = Math.round(finalQty * finalPrice * 100) / 100;
    }

    const { data: position, error } = await supabase
      .from('portfolio_positions')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error in PATCH /api/portfolio/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolio/[id]
 * Elimina posizione portfolio
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

    // Verifica che la posizione appartenga all'utente
    const { data: existing, error: checkError } = await supabase
      .from('portfolio_positions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Posizione non trovata' }, { status: 404 });
    }

    const { error } = await supabase
      .from('portfolio_positions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/portfolio/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

