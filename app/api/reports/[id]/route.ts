import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/reports/[id]
 * Recupera report per id o slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Permetti accesso anche senza sessione (guest access)
    // Guest vede solo report pubblici/attivi

    // Verifica se params.id è un UUID (id) o uno slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
    
    let query = supabase
      .from('reports')
      .select('*');
    
    if (isUUID) {
      query = query.eq('id', params.id);
    } else {
      query = query.eq('slug', params.id);
    }
    
    const { data: report, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching report:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Se non autenticato, mostra solo report attivi
    if (!user && report.status !== 'active') {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error in GET /api/reports/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

