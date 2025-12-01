import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/dashboard/voting/propose
 * Proponi un nuovo asset per la votazione community
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
    const { asset_symbol, asset_name, description } = body;

    // Validazione
    if (!asset_symbol || typeof asset_symbol !== 'string') {
      return NextResponse.json(
        { error: 'asset_symbol is required' },
        { status: 400 }
      );
    }

    if (!asset_name || typeof asset_name !== 'string') {
      return NextResponse.json(
        { error: 'asset_name is required' },
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

    // Verifica se esiste già una proposta per questo asset
    const { data: existing } = await supabase
      .from('asset_proposals')
      .select('id')
      .eq('asset_symbol', asset_symbol.toUpperCase().trim())
      .eq('status', 'open')
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Asset already proposed' },
        { status: 409 }
      );
    }

    // Crea proposta
    const { data, error } = await supabase
      .from('asset_proposals')
      .insert({
        user_id: session.user.id,
        asset_symbol: asset_symbol.toUpperCase().trim(),
        asset_name: asset_name.trim(),
        description: description?.trim() || null,
        status: 'open',
        votes_up: 0,
        votes_down: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating asset proposal:', error);
      return NextResponse.json(
        { error: 'Error creating asset proposal', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in voting propose API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

