import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/utilities/calculations
 * Lista tutte le calcoli salvati dell'utente
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'compound', 'present', 'future', 'annuity'

    let query = supabase
      .from('financial_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('calculation_type', type);
    }

    const { data, error } = await query;

    // Se la tabella non esiste o c'è un errore, restituisci array vuoto
    if (error) {
      // Log solo se non è un errore di tabella mancante
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error fetching calculations:', error);
      }
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    // In caso di errore, restituisci array vuoto invece di 500
    console.error('Error in GET /api/utilities/calculations:', error);
    return NextResponse.json([]);
  }
}

/**
 * POST /api/utilities/calculations
 * Salva un nuovo calcolo
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
    const { calculation_type, inputs, result, notes } = body;

    if (!calculation_type || !inputs || result === undefined) {
      return NextResponse.json(
        { error: 'calculation_type, inputs, and result are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('financial_calculations')
      .insert({
        user_id: user.id,
        calculation_type,
        inputs,
        result: parseFloat(result),
        notes: notes || null,
      })
      .select()
      .single();

    // Se la tabella non esiste, restituisci errore informativo
    if (error) {
      // Log solo se non è un errore di tabella mancante
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error saving calculation:', error);
      }
      return NextResponse.json(
        { error: 'Tabella non disponibile. Il salvataggio non è disponibile al momento.' },
        { status: 503 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/utilities/calculations:', error);
    return NextResponse.json(
      { error: 'Errore interno. Il salvataggio non è disponibile al momento.' },
      { status: 503 }
    );
  }
}

