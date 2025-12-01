import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/analysis-requests/[id]/results
 * Recupera risultati richiesta analisi (se completata)
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

    // Verifica che la richiesta appartenga all'utente
    const { data: request, error: requestError } = await supabase
      .from('analysis_requests')
      .select('id, status')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (requestError || !request) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
    }

    if (request.status !== 'completed') {
      return NextResponse.json(
        { error: 'Richiesta non ancora completata', status: request.status },
        { status: 400 }
      );
    }

    // Recupera risultati (assumiamo tabella analysis_results o campo results in analysis_requests)
    // Per ora ritorniamo i dati della richiesta con status completed
    const { data: fullRequest } = await supabase
      .from('analysis_requests')
      .select('*, results')
      .eq('id', params.id)
      .single();

    return NextResponse.json({
      request: fullRequest,
      results: fullRequest?.results || null,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/analysis-requests/[id]/results:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

