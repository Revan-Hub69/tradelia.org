import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/reports
 * Lista tutti i report disponibili per l'utente
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Permetti accesso anche senza sessione (guest access)
    // Guest vede solo report pubblici/attivi

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const reportId = searchParams.get('id');

    // Se viene richiesto un report specifico per ID, restituisci quello completo
    if (reportId) {
      const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) {
        console.error('Error fetching report:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json(report);
    }

    let query = supabase
      .from('reports')
      .select('id, slug, title, description, report_type, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    // Se non autenticato, mostra solo report attivi
    if (!user) {
      query = query.eq('status', 'active');
    } else {
      // Utente autenticato: filtra per status se specificato
      if (status !== 'all') {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/dashboard/reports:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

