// /api/check-subscription.js
// API Vercel - Verifica status abbonamento utente

import { createClient } from '@supabase/supabase-js';

// Inizializza Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // Verifica autenticazione
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', hasSubscription: false });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verifica token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token', hasSubscription: false });
    }
    
    // Cerca subscriber per auth_user_id
    const { data: subscriber, error: selectError } = await supabase
      .from('subscribers')
      .select('id, email, subscription_id, status')
      .eq('auth_user_id', user.id)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[Check Subscription] Errore ricerca subscriber:', selectError);
      return res.status(500).json({ error: 'Errore server', hasSubscription: false });
    }
    
    // Verifica se ha abbonamento attivo
    const hasSubscription = subscriber && subscriber.status === 'active';
    
    return res.status(200).json({
      hasSubscription,
      subscriber: subscriber ? {
        id: subscriber.id,
        email: subscriber.email,
        subscription_id: subscriber.subscription_id,
        status: subscriber.status
      } : null
    });
  } catch (err) {
    console.error('[Check Subscription] Errore:', err);
    return res.status(500).json({ error: 'Errore server', hasSubscription: false });
  }
}

