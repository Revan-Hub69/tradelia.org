import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createApiClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in billing/credits:', authError);
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? 20);
    const page = Number(searchParams.get('page') ?? 1);
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('credits_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching credits_log:', error);
      // Se la tabella non esiste o c'è un errore RLS, restituisci array vuoto invece di errore
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      // Se errore RLS (permission denied), restituisci array vuoto
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
        console.warn('RLS error in credits_log, returning empty array');
        return NextResponse.json({ data: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mappa i dati per compatibilità con il componente (description -> reason)
    const mappedData = (data || []).map((entry: any) => ({
      id: entry.id,
      user_id: entry.user_id,
      amount: entry.amount,
      reason: entry.description || entry.transaction_type || 'Unknown',
      metadata: {
        transaction_type: entry.transaction_type,
        related_payment_id: entry.related_payment_id,
        related_report_id: entry.related_report_id,
        balance_after: entry.balance_after,
      },
      created_at: entry.created_at,
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error: any) {
    console.error('Unexpected error in billing/credits GET:', error);
    return NextResponse.json({ error: error.message || 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createApiClient(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const body = await request.json();
  const { amount, reason, metadata } = body;

  if (typeof amount !== 'number' || !reason) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
  }

  // Mappa reason a description e transaction_type per compatibilità con schema
  const { data, error } = await supabaseAdmin
    .from('credits_log')
    .insert({
      user_id: user.id,
      amount,
      description: reason,
      transaction_type: metadata?.transaction_type || 'usage',
      balance_after: 0, // TODO: Calcola balance_after dal saldo corrente
      related_payment_id: metadata?.payment_id || null,
      related_report_id: metadata?.report_id || null,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
