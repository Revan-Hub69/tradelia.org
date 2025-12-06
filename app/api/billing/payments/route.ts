import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');
  
  // Se c'è un paymentId specifico, permette accesso anche senza auth (per success page)
  if (paymentId) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  }

  // Per lista pagamenti, richiede autenticazione
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in billing/payments:', authError);
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const limit = Number(searchParams.get('limit') ?? 20);
    const page = Number(searchParams.get('page') ?? 1);
    const offset = (page - 1) * limit;

    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching payments:', error);
      // Se la tabella non esiste o c'è un errore RLS, restituisci array vuoto
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
        console.warn('RLS error in payments, returning empty array');
        return NextResponse.json({ data: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mappa i dati per compatibilità con il componente
    const mappedData = (data || []).map((payment: any) => ({
      id: payment.id,
      user_id: payment.user_id,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.payment_provider || payment.provider || 'unknown',
      status: payment.status === 'completed' ? 'succeeded' : payment.status === 'failed' ? 'failed' : payment.status === 'refunded' ? 'refunded' : 'pending',
      metadata: payment.metadata,
      created_at: payment.created_at,
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error: any) {
    console.error('Unexpected error in billing/payments GET:', error);
    return NextResponse.json({ error: error.message || 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const body = await request.json();
  const { amount, currency, provider, status, metadata } = body;

  if (typeof amount !== 'number' || !currency || !provider) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      user_id: user.id,
      amount,
      currency,
      provider,
      status: status ?? 'pending',
      metadata: metadata ?? {},
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
