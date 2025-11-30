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
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
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
