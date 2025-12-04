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

    // Ottieni proposte - gestisci errori gracefully
    const { data: proposals, error: proposalsError } = await supabase
      .from('asset_proposals')
      .select('id, asset_symbol, asset_name, description, status, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    // Se la tabella non esiste o c'è un errore, restituisci array vuoto
    if (proposalsError) {
      // Log solo se non è un errore di tabella mancante
      if (!proposalsError.message.includes('relation') && !proposalsError.message.includes('does not exist')) {
        console.error('Error fetching proposals:', proposalsError);
      }
      return NextResponse.json([]);
    }

    // Se non ci sono proposte, restituisci array vuoto
    if (!proposals || proposals.length === 0) {
      return NextResponse.json([]);
    }

    // Ottieni voti per ogni proposta
    const proposalsWithVotes = await Promise.all(
      proposals.map(async (proposal) => {
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
    // In caso di errore, restituisci array vuoto invece di 500
    console.error('Error in GET /api/dashboard/voting:', error);
    return NextResponse.json([]);
  }
}

