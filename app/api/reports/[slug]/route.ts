import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/reports/[slug]
 * Recupera report per slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Permetti accesso anche senza sessione (guest access)
    // Guest vede solo report pubblici/attivi

    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle();

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
    console.error('Error in GET /api/reports/[slug]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

