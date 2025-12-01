import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/voting/[id]
 * Recupera dettaglio proposta asset
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

    // Recupera proposta
    const { data: proposal, error: proposalError } = await supabase
      .from('asset_proposals')
      .select('*')
      .eq('id', params.id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposta non trovata' }, { status: 404 });
    }

    // Ottieni voti
    const { data: votes } = await supabase
      .from('asset_votes')
      .select('vote')
      .eq('proposal_id', proposal.id);

    const votesUp = votes?.filter((v) => v.vote === 'up').length || 0;
    const votesDown = votes?.filter((v) => v.vote === 'down').length || 0;

    // Se utente autenticato, verifica se ha già votato
    let userVote: 'up' | 'down' | null = null;
    if (user) {
      const { data: userVoteData } = await supabase
        .from('asset_votes')
        .select('vote')
        .eq('proposal_id', proposal.id)
        .eq('user_id', user.id)
        .single();

      userVote = (userVoteData?.vote as 'up' | 'down') || null;
    }

    return NextResponse.json({
      ...proposal,
      votes_up: votesUp,
      votes_down: votesDown,
      user_vote: userVote,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/voting/[id]:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

