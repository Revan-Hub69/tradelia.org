/**
 * Admin API - Table Data Management
 * Gestisce dati di una specifica tabella
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - Dati tabella
export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const table = params.table;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const orderBy = searchParams.get('orderBy') || 'created_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    const { data, error, count } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending: order === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      table,
      data: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Inserisci dati
export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const table = params.table;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error inserting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
