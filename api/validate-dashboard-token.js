// /api/validate-dashboard-token.js
// API Vercel - Valida token dashboard e ritorna dati utente/abbonamento

import { getServiceSupabase } from './_lib/supabase.js';
import { getAdminContextFromToken } from './_lib/adminAuth.js';
import { handleRouteError, HttpError, sendJSON } from './_lib/http.js';

const supabase = getServiceSupabase();

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
  
  try {
    return await validateTokenHandler(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function validateTokenHandler(req, res) {
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
    throw new HttpError(400, 'Token mancante o non valido');
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const validUntil = context.tokenRecord.valid_until;

  const now = new Date();
  const expiryDate = new Date(validUntil);
  const msDiff = expiryDate - now;
  const daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));

  let canCancel = false;
  let subscriptionStatus = 'inactive';

  if (context.userId) {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('status, gateway, plan, renew_at, cancelled_at')
      .eq('user_id', context.userId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscriptionError && subscription) {
      subscriptionStatus = subscription.status || 'active';
      canCancel =
        subscriptionStatus === 'active' &&
        subscription.gateway &&
        ['stripe', 'paddle', 'lemonsqueezy'].includes(subscription.gateway);
    }
  }

  return sendJSON(res, 200, {
    ok: true,
    userId: context.userId,
    email: context.email || context.tokenRecord.email || null,
    planRole: context.planRole,
    status: subscriptionStatus,
    validUntil,
    daysLeft,
    canCancel,
    isAdmin: context.isAdmin
  });
}
