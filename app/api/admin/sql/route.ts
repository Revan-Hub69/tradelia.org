/**
 * Admin API - SQL Query (SICURA - solo SELECT)
 * Esegue query SQL personalizzate (solo SELECT per sicurezza)
 * 
 * POST /api/admin/sql
 * Body: { query: "SELECT * FROM users LIMIT 10" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/middleware/admin-auth';

export async function POST(request: NextRequest) {
  // Verifica autenticazione admin
  const adminCheck = await isAdmin();
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

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
        { error: 'Only SELECT queries are allowed for security reasons' },
        { status: 400 }
      );
    }

    // Blocca query pericolose anche se iniziano con SELECT
    const dangerousKeywords = [
      'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE',
      'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'CALL'
    ];
    
    const hasDangerousKeyword = dangerousKeywords.some(keyword => 
      trimmedQuery.includes(keyword)
    );

    if (hasDangerousKeyword) {
      return NextResponse.json(
        { error: 'Query contains dangerous keywords. Only SELECT queries are allowed.' },
        { status: 400 }
      );
    }

    // Esegui query usando RPC (se disponibile) o direttamente
    // Nota: Supabase non supporta query SQL dirette via client
    // Dobbiamo usare una funzione RPC o restituire un messaggio informativo
    
    return NextResponse.json({
      error: 'Direct SQL execution not available via API for security.',
      suggestion: 'Use specific table endpoints instead: GET /api/admin/tables/[table]',
      note: 'For complex queries, create a dedicated RPC function in Supabase.',
    }, { status: 400 });

    // Se in futuro vogliamo supportare query SQL SELECT, possiamo creare una funzione RPC:
    // const { data, error } = await supabaseAdmin.rpc('execute_select_query', { query_text: query });
  } catch (error) {
    console.error('Error executing query:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
