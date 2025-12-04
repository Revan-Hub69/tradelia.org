import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/utilities/pac-simulations
 * Lista tutte le simulazioni PAC salvate dell'utente
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('pac_simulations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Se la tabella non esiste o c'è un errore, restituisci array vuoto
    if (error) {
      // Log solo se non è un errore di tabella mancante
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error fetching PAC simulations:', error);
      }
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    // In caso di errore, restituisci array vuoto invece di 500
    console.error('Error in GET /api/utilities/pac-simulations:', error);
    return NextResponse.json([]);
  }
}

/**
 * POST /api/utilities/pac-simulations
 * Salva una nuova simulazione PAC
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      monthly_amount,
      annual_return,
      years,
      frequency,
      future_value,
      total_invested,
      total_return,
      return_percentage,
      yearly_data,
      notes,
    } = body;

    if (
      monthly_amount === undefined ||
      annual_return === undefined ||
      years === undefined ||
      !frequency ||
      future_value === undefined ||
      total_invested === undefined ||
      total_return === undefined ||
      return_percentage === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pac_simulations')
      .insert({
        user_id: user.id,
        monthly_amount: parseFloat(monthly_amount),
        annual_return: parseFloat(annual_return),
        years: parseInt(years),
        frequency,
        future_value: parseFloat(future_value),
        total_invested: parseFloat(total_invested),
        total_return: parseFloat(total_return),
        return_percentage: parseFloat(return_percentage),
        yearly_data: yearly_data || null,
        notes: notes || null,
      })
      .select()
      .single();

    // Se la tabella non esiste, restituisci errore informativo
    if (error) {
      // Log solo se non è un errore di tabella mancante
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error saving PAC simulation:', error);
      }
      return NextResponse.json(
        { error: 'Tabella non disponibile. Il salvataggio non è disponibile al momento.' },
        { status: 503 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/utilities/pac-simulations:', error);
    return NextResponse.json(
      { error: 'Errore interno. Il salvataggio non è disponibile al momento.' },
      { status: 503 }
    );
  }
}

