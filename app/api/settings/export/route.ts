import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/settings/export
 * Esporta tutti i dati utente (GDPR compliance)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Raccogli tutti i dati utente
    const [profile, portfolio, trades, alerts, expenses, courses, notes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('portfolio_positions').select('*').eq('user_id', user.id),
      supabase.from('trading_journal').select('*').eq('user_id', user.id),
      supabase.from('watchlist_alerts').select('*').eq('user_id', user.id),
      supabase.from('expenses').select('*').eq('user_id', user.id),
      supabase.from('education_user_progress').select('*').eq('user_id', user.id),
      supabase.from('lesson_notes').select('*').eq('user_id', user.id).catch(() => ({ data: null })),
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profile.data,
      portfolio: portfolio.data || [],
      trades: trades.data || [],
      alerts: alerts.data || [],
      expenses: expenses.data || [],
      courses: courses.data || [],
      notes: notes.data || [],
    };

    // Ritorna JSON (può essere esteso per CSV/PDF)
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tradelia-export-${user.id}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/settings/export:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

