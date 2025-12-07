/**
 * Admin API - Table Data Management
 * Gestisce dati di una specifica tabella
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/middleware/admin-auth';

// GET - Dati tabella
export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  // Verifica autenticazione admin
  const adminCheck = await isAdmin();
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

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

// POST - Inserisci dati (RIMOSSO - troppo pericoloso)
// export async function POST(...) { ... }
