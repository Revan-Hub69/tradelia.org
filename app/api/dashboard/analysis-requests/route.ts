import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/analysis-requests
 * Lista tutte le richieste di analisi dell'utente
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('analysis_requests')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analysis requests:', error);
      return NextResponse.json(
        { error: 'Error fetching analysis requests' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in analysis requests API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/analysis-requests
 * Crea una nuova richiesta di analisi
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { asset_symbol, asset_name, priority, notes } = body;

    // Validazione
    if (!asset_symbol || typeof asset_symbol !== 'string') {
      return NextResponse.json(
        { error: 'asset_symbol is required' },
        { status: 400 }
      );
    }

    // Verifica che l'utente sia Pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || (profile.role !== 'pro' && profile.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Pro account required' },
        { status: 403 }
      );
    }

    // Crea richiesta
    const { data, error } = await supabase
      .from('analysis_requests')
      .insert({
        user_id: session.user.id,
        asset_symbol: asset_symbol.toUpperCase().trim(),
        asset_name: asset_name || asset_symbol.toUpperCase().trim(),
        priority: priority || 'normal',
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating analysis request:', error);
      return NextResponse.json(
        { error: 'Error creating analysis request', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in analysis requests POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
