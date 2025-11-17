// /api/validate-dashboard-token.js
// API Vercel - Valida token dashboard e ritorna dati utente/abbonamento

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const ADMIN_PLAN_ROLES = new Set(['admin', 'internal', 'staff', 'team', 'founder']);

// Wrapper per gestire errori non catturati
export default async function handler(req, res) {
  // CORS headers PRIMA di tutto
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (headerError) {
    console.error('[Validate Token] Errore header CORS:', headerError);
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Wrapper interno per catturare TUTTI gli errori
  try {
    return await validateTokenHandler(req, res);
  } catch (unhandledError) {
    console.error('[Validate Token] ERRORE NON GESTITO:', unhandledError);
    console.error('[Validate Token] Stack:', unhandledError?.stack);
    
    // Restituisci sempre JSON valido
    try {
      res.status(500);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        ok: false,
        error: 'Errore server interno',
        message: unhandledError?.message || 'Errore sconosciuto'
      }));
    } catch (finalError) {
      console.error('[Validate Token] ERRORE CRITICO nel response:', finalError);
      // Ultimo tentativo
      return res.status(500).send(JSON.stringify({ ok: false, error: 'Errore critico' }));
    }
  }
}

async function validateTokenHandler(req, res) {
  // Verifica variabili ambiente
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[Validate Token] Variabili ambiente mancanti:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_SERVICE_KEY
    });
    return res.status(500).json({
      ok: false,
      error: 'Configurazione server incompleta',
      details: 'Variabili ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurate in Vercel'
    });
  }
  
  // Inizializza Supabase
  let supabase;
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (initError) {
    console.error('[Validate Token] Errore creazione client Supabase:', initError);
    return res.status(500).json({
      ok: false,
      error: 'Errore inizializzazione database',
      details: initError.message
    });
  }
  
  // Leggi token dal body
  let token;
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        ok: false,
        error: 'Body richiesta non valido'
      });
    }
    token = body.token;
  } catch (bodyError) {
    console.error('[Validate Token] Errore lettura body:', bodyError);
    return res.status(400).json({
      ok: false,
      error: 'Errore lettura richiesta'
    });
  }
  
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'Token mancante o non valido'
    });
  }
  
  // Calcola hash del token
  let tokenHash;
  try {
    tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  } catch (hashError) {
    console.error('[Validate Token] Errore hash token:', hashError);
    return res.status(500).json({
      ok: false,
      error: 'Errore elaborazione token'
    });
  }
  
  // Cerca token in database
  let tokenRecord;
  try {
    const { data, error } = await supabase
      .from('dashboard_access_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('revoked', false)
      .gte('valid_until', new Date().toISOString())
      .maybeSingle();
    
    if (error) {
      console.error('[Validate Token] Errore query database:', error);
      return res.status(500).json({
        ok: false,
        error: 'Errore database',
        details: error.message
      });
    }
    
    if (!data) {
      return res.status(200).json({
        ok: false,
        error: 'Codice non valido o scaduto'
      });
    }
    
    tokenRecord = data;
  } catch (queryError) {
    console.error('[Validate Token] Errore query token:', queryError);
    return res.status(500).json({
      ok: false,
      error: 'Errore ricerca token',
      details: queryError.message
    });
  }
  
  // Aggiorna last_used_at (non bloccante)
  try {
    await supabase
      .from('dashboard_access_tokens')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: (tokenRecord.usage_count || 0) + 1
      })
      .eq('id', tokenRecord.id);
  } catch (updateError) {
    // Non bloccante, solo log
    console.warn('[Validate Token] Errore aggiornamento usage (non bloccante):', updateError);
  }
  
  // Estrai dati
  const userId = tokenRecord.user_id;
  const rawEmail = typeof tokenRecord.email === 'string' ? tokenRecord.email.trim() : '';
  const email = rawEmail || null;
  const normalizedEmail = rawEmail.toLowerCase();
  const planRole = tokenRecord.plan_role;
  const normalizedPlanRole = (planRole || '').toLowerCase();
  const validUntil = tokenRecord.valid_until;

  let isAdmin = ADMIN_PLAN_ROLES.has(normalizedPlanRole);

  if (!isAdmin && normalizedEmail) {
    try {
      const { data: adminEmailRecord, error: adminEmailError } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (adminEmailError) {
        console.warn('[Validate Token] Lookup admin_emails fallita:', adminEmailError);
      } else if (adminEmailRecord) {
        isAdmin = true;
      }
    } catch (lookupError) {
      console.warn('[Validate Token] Errore verifica admin_emails:', lookupError);
    }
  }

  if (!isAdmin && userId) {
    try {
      const { data: adminUserRecord, error: adminUserError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (adminUserError) {
        console.warn('[Validate Token] Lookup admin_users fallita:', adminUserError);
      } else if (adminUserRecord) {
        isAdmin = true;
      }
    } catch (adminUserLookupError) {
      console.warn('[Validate Token] Errore verifica admin_users:', adminUserLookupError);
    }
  }
  
  // Calcola giorni rimanenti
  const now = new Date();
  const expiryDate = new Date(validUntil);
  const msDiff = expiryDate - now;
  const daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
  
  // Valori default
  let canCancel = false;
  let subscriptionStatus = 'active';
  
  // Query opzionali (non bloccanti)
  if (userId) {
    try {
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('status, subscription_id, gateway')
        .eq('auth_user_id', userId)
        .maybeSingle();
      
      if (subscriber) {
        subscriptionStatus = subscriber.status || 'active';
        canCancel = subscriptionStatus === 'active' &&
                   subscriber.gateway &&
                   ['stripe', 'paddle', 'lemonsqueezy'].includes(subscriber.gateway);
      }
    } catch (err) {
      // Ignora
    }
  }
  
  // Restituisci risposta
  return res.status(200).json({
    ok: true,
    userId: userId,
    email: email,
    planRole: planRole,
    status: subscriptionStatus,
    validUntil: validUntil,
    daysLeft: daysLeft,
    canCancel: canCancel,
    isAdmin
  });
}
