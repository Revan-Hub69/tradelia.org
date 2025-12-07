/**
 * Admin API - Tables Management
 * Gestisce tabelle e dati su Supabase
 * 
 * GET /api/admin/tables - Lista tutte le tabelle
 * GET /api/admin/tables/[table] - Dati di una tabella
 * POST /api/admin/tables/[table] - Inserisci dati
 * PUT /api/admin/tables/[table]/[id] - Aggiorna dati
 * DELETE /api/admin/tables/[table]/[id] - Elimina dati
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/middleware/admin-auth';

// GET - Lista tutte le tabelle
export async function GET(request: NextRequest) {
  // Verifica autenticazione admin
  const adminCheck = await isAdmin();
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get('table');

    // Se specificata una tabella, ottieni i dati
    if (tableName) {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '100');
      const search = searchParams.get('search') || '';
      const orderBy = searchParams.get('orderBy') || 'created_at';
      const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

      let query = supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: order === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

      // Se c'è un campo searchable, filtra
      // Nota: questo è un esempio base, potresti voler specificare i campi searchable per tabella
      if (search) {
        // Prova a cercare in campi comuni
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,title.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        table: tableName,
        data: data || [],
        total: count || 0,
        page,
        limit,
      });
    }

    // Altrimenti, lista le tabelle disponibili
    // Nota: Supabase non ha un endpoint diretto per listare tabelle
    // Possiamo usare una lista hardcoded delle tabelle principali o fare una query a information_schema
    const commonTables = [
      'users',
      'user_roles',
      'user_stats',
      'user_preferences',
      'notifications',
      'widget_notifications',
      'favorites',
      'reports',
      'watchlist',
      'watchlist_alerts',
      'trading_journal',
      'portfolio',
      'paper_trading_positions',
      'paper_trading_stats',
      'paper_trading_tournaments',
      'paper_trading_tournament_participants',
      'achievements',
      'user_achievements',
      'courses',
      'lessons',
      'user_progress',
      'asset_proposals',
      'asset_votes',
      'reviews',
    ];

    return NextResponse.json({
      tables: commonTables,
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
