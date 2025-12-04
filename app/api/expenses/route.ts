import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/expenses?month=2024-01
 * Lista tutte le spese dell'utente per un mese specifico
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
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // yyyy-MM

    // Calcola inizio e fine mese
    const startDate = `${month}-01T00:00:00Z`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    // Se la tabella non esiste o c'è un errore, restituisci array vuoto
    if (error) {
      // Log solo se non è un errore di tabella mancante
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error fetching expenses:', error);
      }
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    // In caso di errore, restituisci array vuoto invece di 500
    console.error('Error in GET /api/expenses:', error);
    return NextResponse.json([]);
  }
}

/**
 * POST /api/expenses
 * Aggiunge una nuova spesa
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
    const { amount, category, description, date } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Importo non valido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        category: category || 'other',
        description: description || null,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/expenses:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses?id=expense_id
 * Elimina una spesa
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
      return NextResponse.json({ error: 'ID spesa richiesto' }, { status: 400 });
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Sicurezza: solo il proprietario può eliminare

    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/expenses:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

