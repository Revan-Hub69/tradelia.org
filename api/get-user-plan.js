/* eslint-env node */
// /api/get-user-plan.js
// API Vercel - Ottiene stato plan, usage e desk per utente
// Consolidato: include logica get-desk-status.js

import { getServiceSupabase } from './_lib/supabase.js';
import { getAdminContextFromToken } from './_lib/adminAuth.js';
import { handleRouteError, HttpError, sendJSON } from './_lib/http.js';

const supabase = getServiceSupabase();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    return await handleRequest(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleRequest(req, res) {
  const body = req.body || {};
  const token = body.token;

  if (!token || typeof token !== 'string') {
    throw new HttpError(401, 'Token mancante');
  }

  // Valida token
  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;
  const email = context.email;
  const isAdmin = context.isAdmin || false;

  if (!userId) {
    // Guest: nessun piano attivo
    return sendJSON(res, 200, {
      ok: true,
      plan: {
        type: 'guest',
        status: 'active',
        startedAt: null,
        expiresAt: null,
        xoloPaymentStatus: null,
        xoloPaymentDueDate: null,
        desk: null,
        email: email || null,
        userId: null,
      },
      usage: {
        month: getCurrentMonth(),
        proIncludedUsed: 0,
        proExtraUsed: 0,
        proExtraRemaining: 0,
        deskIncludedUsed: 0,
        deskExtraUsed: 0,
        deskIncludedRemaining: 0,
      },
      isAdmin: isAdmin,
    });
  }

  // Cerca piano attivo (priorità: desk > pro > guest)
  const { data: activePlan, error: planError } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'pending_payment', 'pending_manual'])
    .order('plan_type', { ascending: false }) // desk prima di pro
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (planError) {
    console.error('[Get User Plan] Errore query user_plans:', planError);
    // Fallback a guest
    return sendJSON(res, 200, {
      ok: true,
      plan: {
        type: 'guest',
        status: 'active',
        startedAt: null,
        expiresAt: null,
        xoloPaymentStatus: null,
        xoloPaymentDueDate: null,
        desk: null,
        email: email || null,
        userId: userId,
      },
      usage: {
        month: getCurrentMonth(),
        proIncludedUsed: 0,
        proExtraUsed: 0,
        proExtraRemaining: 0,
        deskIncludedUsed: 0,
        deskExtraUsed: 0,
        deskIncludedRemaining: 0,
      },
      isAdmin: isAdmin,
    });
  }

  if (!activePlan) {
    // Nessun piano attivo = guest (ma utente autenticato)
    return sendJSON(res, 200, {
      ok: true,
      plan: {
        type: 'authenticated', // Utente autenticato ma senza piano attivo
        status: 'active',
        startedAt: null,
        expiresAt: null,
        xoloPaymentStatus: null,
        xoloPaymentDueDate: null,
        desk: null,
        email: email || null,
        userId: userId,
      },
      usage: {
        month: getCurrentMonth(),
        proIncludedUsed: 0,
        proExtraUsed: 0,
        proExtraRemaining: 0,
        deskIncludedUsed: 0,
        deskExtraUsed: 0,
        deskIncludedRemaining: 0,
      },
      isAdmin: isAdmin,
    });
  }

  // Verifica scadenza (solo per Desk)
  let planStatus = activePlan.status;
  if (activePlan.plan_type === 'desk' && activePlan.expires_at) {
    const expiresAt = new Date(activePlan.expires_at);
    if (expiresAt < new Date()) {
      planStatus = 'expired';
    }
  }

  // Calcola usage corrente
  const currentMonth = getCurrentMonth();
  const { data: usage, error: usageError } = await supabase
    .from('plan_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', currentMonth)
    .maybeSingle();

  let usageData = {
    month: currentMonth,
    proIncludedUsed: 0,
    proExtraUsed: 0,
    proExtraRemaining: activePlan.plan_type === 'pro' ? 1 : 0,
    deskIncludedUsed: 0,
    deskExtraUsed: 0,
    deskIncludedRemaining: activePlan.plan_type === 'desk' ? 2 : 0,
  };

  if (!usageError && usage) {
    usageData = {
      month: currentMonth,
      proIncludedUsed: usage.pro_included_used || 0,
      proExtraUsed: usage.pro_extra_used || 0,
      proExtraRemaining: activePlan.plan_type === 'pro' ? Math.max(0, 1 - (usage.pro_included_used || 0)) : 0,
      deskIncludedUsed: usage.desk_included_used || 0,
      deskExtraUsed: usage.desk_extra_used || 0,
      deskIncludedRemaining: activePlan.plan_type === 'desk' ? Math.max(0, 2 - (usage.desk_included_used || 0)) : 0,
    };
  }

  // Calcola analisi extra rimanenti per Pro
  if (activePlan.plan_type === 'pro') {
    usageData.proExtraRemaining = Math.max(0, 3 - (usageData.proExtraUsed || 0));
  }

  // Info Desk (se piano è Desk)
  let deskInfo = null;
  if (activePlan.plan_type === 'desk' && planStatus === 'active') {
    deskInfo = {
      analysesIncluded: 2,
      analysesUsed: usageData.deskIncludedUsed,
      analysesRemaining: usageData.deskIncludedRemaining,
    };
  }

  // Calcola crediti totali (se necessario in futuro)
  let totalCredits = 0;
  // TODO: Implementare quando tabella user_credits sarà creata

  return sendJSON(res, 200, {
    ok: true,
    plan: {
      type: activePlan.plan_type,
      status: planStatus,
      startedAt: activePlan.started_at,
      expiresAt: activePlan.expires_at,
      xoloPaymentStatus: activePlan.xolo_payment_status,
      xoloPaymentDueDate: activePlan.xolo_payment_due_date,
      desk: deskInfo,
      credits: totalCredits,
      email: email || activePlan.email || null,
      userId: userId,
    },
    usage: usageData,
    isAdmin: isAdmin,
  });
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

