import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/voting
 * Lista tutte le proposte di asset per votazione
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Ottieni proposte
    const { data: proposals, error: proposalsError } = await supabase
      .from('asset_proposals')
      .select('id, asset_symbol, asset_name, description, status, created_at')
      .order('created_at', { ascending: false });

    if (proposalsError) {
      console.error('Error fetching proposals:', proposalsError);
      return NextResponse.json({ error: proposalsError.message }, { status: 500 });
    }

    // Ottieni voti per ogni proposta
    const proposalsWithVotes = await Promise.all(
      (proposals || []).map(async (proposal) => {
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

        return {
          ...proposal,
          votes_up: votesUp,
          votes_down: votesDown,
          user_vote: userVote,
        };
      })
    );

    return NextResponse.json(proposalsWithVotes);
  } catch (error) {
    console.error('Error in GET /api/dashboard/voting:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

