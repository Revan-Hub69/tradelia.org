// /api/community.js
// API Vercel - Community e Votazioni (CONSOLIDATO)
// Consolida: vote.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY devono essere configurati');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// NOTA: Funzione disabilitata per rispettare limite Vercel Hobby (12 funzioni)
// Consolidata in api/admin.js?action=community-*
// export default async function handler(req, res) {
async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'vote':
        return await handleVote(req, res);
      case 'proposals':
        return await handleProposals(req, res);
      default:
        return res.status(400).json({ ok: false, error: 'Azione non valida. Usa: vote, proposals' });
    }
  } catch (error) {
    console.error('[Community] Errore:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Errore server' });
  }
}

async function handleVote(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { ticker, votes, userId } = req.body;

  if (!ticker || !votes || votes < 1 || votes > 10) {
    return res.status(400).json({ ok: false, error: 'Ticker e voti (1-10) richiesti' });
  }

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

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('asset_votes')
    .upsert(
      {
        ticker,
        votes,
        subscriber_id: subscriberId,
        user_id: userId,
        voted_at: today,
      },
      {
        onConflict: 'ticker,subscriber_id,voted_at',
      }
    )
    .select();

  if (error) {
    console.error('[Community] Errore votazione:', error);
    return res.status(500).json({ ok: false, error: 'Errore salvataggio voto' });
  }

  return res.status(200).json({ ok: true, data });
}

async function handleProposals(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('asset_proposals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Community] Errore proposte:', error);
    return res.status(500).json({ ok: false, error: 'Errore caricamento proposte' });
  }

  return res.status(200).json({ ok: true, proposals: data || [] });
}

