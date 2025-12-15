import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { PaymentRow } from '@/lib/supabase/types/billing';

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
    const supabase = createApiClient(request);
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
    const mappedData = (data || []).map((payment: PaymentRow) => ({
      id: payment.id,
      user_id: payment.user_id,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.payment_provider || 'unknown',
      status: payment.status === 'completed' ? 'succeeded' : payment.status === 'failed' ? 'failed' : payment.status === 'refunded' ? 'refunded' : 'pending',
      metadata: payment.metadata,
      created_at: payment.created_at,
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error('Unexpected error in billing/payments GET:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore interno del server';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createApiClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in billing/payments POST:', authError);
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, provider, status, metadata } = body;

    if (typeof amount !== 'number' || !currency || typeof currency !== 'string' || !provider || typeof provider !== 'string') {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        amount,
        currency,
        payment_provider: provider,
        status: (status as string) ?? 'pending',
        metadata: metadata ?? {},
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting payment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error in billing/payments POST:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore interno del server';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
