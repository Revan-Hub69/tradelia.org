import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLocaleFromRequest } from '@/lib/i18n/api-messages';
import { localizeContentArray } from '@/lib/i18n/dynamic-content';

/**
 * GET /api/dashboard/reports
 * Lista tutti i report disponibili per l'utente
 * Best Practice: Supports multilingual content and locale detection
 */
export async function GET(request: NextRequest) {
  try {
    // Detect locale from request
    const locale = getLocaleFromRequest(request);
    
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
        const { getApiMessages } = await import('@/lib/i18n/api-messages');
        const messages = getApiMessages(locale);
        return NextResponse.json({ error: messages.errors.notFound }, { status: 404 });
      }

      // Localize report content
      const localizedReport = localizeContentArray([report], locale)[0];
      return NextResponse.json(localizedReport);
    }

    let query = supabase
      .from('reports')
      .select('id, slug, title, title_it, title_en, description, description_it, description_en, report_type, status, created_at, updated_at')
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

    // Se la tabella non esiste o c'è un errore, restituisci array vuoto
    if (error) {
      // Log solo se non è un errore di tabella mancante
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error fetching reports:', error);
      }
      return NextResponse.json([]);
    }

    // Localize reports content
    const localizedReports = localizeContentArray(data || [], locale);
    return NextResponse.json(localizedReports);
  } catch (error) {
    // In caso di errore, restituisci array vuoto invece di 500
    console.error('Error in GET /api/dashboard/reports:', error);
    return NextResponse.json([]);
  }
}

