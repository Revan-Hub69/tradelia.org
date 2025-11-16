// /api/validate-dashboard-token.js
// API Vercel - Valida token dashboard e ritorna dati utente/abbonamento

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Calcola hash SHA-256 del token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { token } = req.body;
    
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Token mancante o non valido' 
      });
    }
    
    // Calcola hash del token
    const tokenHash = hashToken(token.trim());
    
    // Cerca token in dashboard_access_tokens
    // Nota: non facciamo join con user_roles perché potrebbe non esistere (token solo email)
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('dashboard_access_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('revoked', false)
      .gte('valid_until', new Date().toISOString())
      .single();
    
    if (tokenError || !tokenRecord) {
      console.log('[Validate Token] Token non trovato o scaduto:', tokenError?.message || 'not found');
      return res.status(200).json({ 
        ok: false, 
        error: 'Codice non valido o scaduto' 
      });
    }
    
    // Aggiorna last_used_at e usage_count
    await supabase
      .from('dashboard_access_tokens')
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: (tokenRecord.usage_count || 0) + 1
      })
      .eq('id', tokenRecord.id);
    
    // Estrai dati utente
    const userId = tokenRecord.user_id;
    let email = tokenRecord.email;
    
    // Se non abbiamo email ma abbiamo user_id, recupera email da auth.users
    if (!email && userId) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (authUser && authUser.user) {
        email = authUser.user.email;
      }
    }
    
    const planRole = tokenRecord.plan_role;
    const validUntil = tokenRecord.valid_until;
    
    // Calcola giorni rimanenti
    const now = new Date();
    const expiryDate = new Date(validUntil);
    const msDiff = expiryDate - now;
    const daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
    
    // Verifica se può cancellare (solo se ha subscription attiva e non già cancellata)
    // Cerca in subscribers se esiste
    let canCancel = false;
    let subscriptionStatus = 'active';
    
    if (userId) {
      // Cerca subscriber per user_id
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('status, subscription_id, gateway')
        .eq('auth_user_id', userId)
        .single();
      
      if (subscriber) {
        subscriptionStatus = subscriber.status || 'active';
        // Può cancellare se status è 'active' e ha un gateway integrato
        canCancel = subscriptionStatus === 'active' && 
                   subscriber.gateway && 
                   ['stripe', 'paddle', 'lemonsqueezy'].includes(subscriber.gateway);
      }
    }
    
    // Se non ha subscriber, verifica da user_roles
    if (!subscriptionStatus || subscriptionStatus === 'active') {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, valid_until')
        .eq('user_id', userId)
        .single();
      
      if (userRole) {
        const roleValidUntil = new Date(userRole.valid_until || validUntil);
        if (roleValidUntil < now) {
          subscriptionStatus = 'expired';
          canCancel = false;
        }
      }
    }
    
    return res.status(200).json({
      ok: true,
      userId: userId,
      email: email,
      planRole: planRole,
      status: subscriptionStatus,
      validUntil: validUntil,
      daysLeft: daysLeft,
      canCancel: canCancel
    });
    
  } catch (err) {
    console.error('[Validate Token] Errore:', err);
    return res.status(500).json({ 
      ok: false, 
      error: 'Errore server', 
      details: err.message 
    });
  }
}

