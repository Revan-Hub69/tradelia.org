import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { InvoiceRow } from '@/lib/supabase/types/billing';

export async function GET(request: NextRequest) {
  try {
    const supabase = createApiClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in billing/invoices:', authError);
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? 20);
    const page = Number(searchParams.get('page') ?? 1);
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching invoices:', error);
      // Se la tabella non esiste o c'è un errore RLS, restituisci array vuoto
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
        console.warn('RLS error in invoices, returning empty array');
        return NextResponse.json({ data: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mappa i dati per compatibilità con il componente
    const mappedData = (data || []).map((invoice: InvoiceRow) => ({
      id: invoice.id,
      user_id: invoice.user_id,
      payment_id: invoice.payment_id,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status === 'sent' ? 'issued' : invoice.status === 'paid' ? 'paid' : invoice.status === 'cancelled' ? 'void' : 'draft',
      invoice_number: invoice.invoice_number,
      issued_at: invoice.issued_at,
      due_date: invoice.due_date,
      metadata: invoice.metadata,
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error('Unexpected error in billing/invoices GET:', error);
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
      console.error('Auth error in billing/invoices POST:', authError);
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { payment_id, amount, currency, status, due_date, metadata } = body;

    if (!payment_id || typeof payment_id !== 'string' || typeof amount !== 'number' || !currency || typeof currency !== 'string') {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: user.id,
        payment_id,
        amount,
        currency,
        status: (status as string) ?? 'draft',
        due_date: due_date ?? null,
        metadata: metadata ?? {},
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error in billing/invoices POST:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore interno del server';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
