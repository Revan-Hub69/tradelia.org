/**
 * Admin API - Custom SQL Query
 * Esegue query SQL personalizzate (solo SELECT per sicurezza)
 * 
 * POST /api/admin/query
 * Body: { query: "SELECT * FROM users LIMIT 10" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Sicurezza: permettere solo SELECT
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return NextResponse.json(
        { error: 'Only SELECT queries are allowed' },
        { status: 400 }
      );
    }

    // Esegui query usando RPC o direttamente
    // Nota: Supabase non supporta query SQL dirette, dobbiamo usare RPC
    // Per ora, restituiamo un messaggio che indica di usare le API specifiche
    // In futuro, possiamo creare una funzione RPC che accetta query SELECT

    return NextResponse.json({
      error: 'Direct SQL queries are not supported. Use specific table endpoints instead.',
      suggestion: 'Use GET /api/admin/tables/[table] to query table data',
    }, { status: 400 });

    // Se in futuro vogliamo supportare query SQL, possiamo creare una funzione RPC:
    // const { data, error } = await supabaseAdmin.rpc('execute_select_query', { query_text: query });
  } catch (error) {
    console.error('Error executing query:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
