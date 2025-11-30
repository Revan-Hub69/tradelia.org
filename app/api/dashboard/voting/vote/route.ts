import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/dashboard/voting/vote
 * Registra un voto su una proposta asset
 * PRO ONLY
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Verifica se è Pro
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isPro = roleData?.role === 'pro' || roleData?.role === 'admin';

    if (!isPro) {
      return NextResponse.json({ error: 'Account Pro richiesto' }, { status: 403 });
    }

    const body = await request.json();
    const { proposal_id, vote } = body;

    if (!proposal_id || !vote || !['up', 'down'].includes(vote)) {
      return NextResponse.json({ error: 'Dati mancanti o non validi' }, { status: 400 });
    }

    // Verifica se ha già votato
    const { data: existingVote } = await supabase
      .from('asset_votes')
      .select('id, vote')
      .eq('proposal_id', proposal_id)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      // Aggiorna voto esistente
      const { error: updateError } = await supabase
        .from('asset_votes')
        .update({ vote })
        .eq('id', existingVote.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      // Crea nuovo voto
      const { error: insertError } = await supabase
        .from('asset_votes')
        .insert({
          proposal_id,
          user_id: user.id,
          vote,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/dashboard/voting/vote:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

