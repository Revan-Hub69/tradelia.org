import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/analysis-requests/[id]
 * Recupera dettaglio richiesta analisi
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

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Recupera richiesta
    const { data: request, error } = await supabase
      .from('analysis_requests')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !request) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error in GET /api/dashboard/analysis-requests/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

