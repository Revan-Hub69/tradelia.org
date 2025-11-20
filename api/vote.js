// /api/vote.js
// API Vercel - Gestione votazioni (Supabase)
// Usa Supabase invece di Vercel KV (gratuito)

import { createClient } from '@supabase/supabase-js';

// Configurazione Supabase da variabili ambiente
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY devono essere configurati');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { ticker, votes, userId } = req.body;
      
      if (!ticker || !votes || votes < 1 || votes > 10) {
        return res.status(400).json({ error: 'Ticker e voti (1-10) richiesti' });
      }

      // Trova subscriber_id se userId è fornito
      let subscriberId = null;
      if (userId) {
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('id')
          .eq('auth_user_id', userId)
          .single();
        
        if (subscriber) {
          subscriberId = subscriber.id;
        }
      }

      // Salva voto in Supabase
      const today = new Date().toISOString().split('T')[0];
      const voteData = {
        ticker: ticker.toUpperCase(),
        votes: parseInt(votes),
        user_id: subscriberId,
        auth_user_id: userId || null,
        date: today
      };

      const { data: newVote, error } = await supabase
        .from('votes')
        .insert(voteData)
        .select()
        .single();

      if (error) {
        console.error('[API] Errore salvataggio voto:', error);
        return res.status(500).json({ error: 'Errore server', details: error.message });
      }

      return res.status(200).json({ 
        success: true, 
        vote: {
          id: newVote.id,
          ticker: newVote.ticker,
          votes: newVote.votes,
          userId: newVote.auth_user_id,
          date: newVote.date,
          timestamp: newVote.created_at
        }
      });
    } catch (err) {
      console.error('[API] Errore voto:', err);
      return res.status(500).json({ error: 'Errore server', details: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      // Recupera tutti i voti di oggi
      const today = new Date().toISOString().split('T')[0];
      const { data: votes, error } = await supabase
        .from('votes')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[API] Errore recupero voti:', error);
        return res.status(500).json({ error: 'Errore server', details: error.message });
      }

      // Formatta voti per compatibilità con il codice esistente
      const formattedVotes = (votes || []).map(vote => ({
        ticker: vote.ticker,
        votes: vote.votes,
        userId: vote.auth_user_id || 'anonymous',
        date: vote.date,
        timestamp: vote.created_at
      }));

      return res.status(200).json({ votes: formattedVotes });
    } catch (err) {
      console.error('[API] Errore recupero voti:', err);
      return res.status(500).json({ error: 'Errore server', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
