/* eslint-env node */
/**
 * API Router Unificato: Operazioni Utente
 * Gestisce: validazione token, get user plan, request token
 * POST /api/user?action=validate|plan|request-token
 */

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";

const supabase = getServiceSupabase();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const action = req.query?.action || req.body?.action || "validate";
    return await handleUserAction(req, res, action);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleUserAction(req, res, action) {
  switch (action) {
    case "validate":
      return await handleValidateToken(req, res);
    case "plan":
      return await handleGetUserPlan(req, res);
    case "request-token":
      return await handleRequestToken(req, res);
    default:
      throw new HttpError(400, `Action non valida: ${action}`);
  }
}

// ===== VALIDATE TOKEN =====
async function handleValidateToken(req, res) {
  const body = req.body || {};
  const token = body.token;

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new HttpError(400, "Token mancante o non valido");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const validUntil = context.tokenRecord.valid_until;

  const now = new Date();
  const expiryDate = new Date(validUntil);
  const msDiff = expiryDate - now;
  const daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));

  let canCancel = false;
  let subscriptionStatus = "inactive";

  if (context.userId) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, gateway, plan, renew_at, cancelled_at")
      .eq("user_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription) {
      subscriptionStatus = subscription.status || "active";
      canCancel = subscriptionStatus === "active";
    }
  }

  let reason = null;
  if (daysLeft === 0 && expiryDate < now) {
    reason = "expired_token";
  } else if (context.tokenRecord.revoked) {
    reason = "revoked_token";
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
    isAdmin: context.isAdmin,
    reason,
  });
}

// ===== GET USER PLAN =====
async function handleGetUserPlan(req, res) {
  const body = req.body || {};
  const token = body.token;

  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;
  const email = context.email;
  const isAdmin = context.isAdmin || false;

  if (!userId) {
    return sendJSON(res, 200, {
      ok: true,
      plan: {
        type: "guest",
        status: "active",
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

  const { data: activePlan } = await supabase
    .from("user_plans")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "pending_payment", "pending_manual"])
    .order("plan_type", { ascending: false })
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!activePlan) {
    return sendJSON(res, 200, {
      ok: true,
      plan: {
        type: "guest",
        status: "active",
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

  let planStatus = activePlan.status;
  if (activePlan.plan_type === "desk" && activePlan.expires_at) {
    const expiresAt = new Date(activePlan.expires_at);
    if (expiresAt < new Date()) {
      planStatus = "expired";
    }
  }

  const currentMonth = getCurrentMonth();
  const { data: usage } = await supabase
    .from("plan_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("month_year", currentMonth)
    .maybeSingle();

  let usageData = {
    month: currentMonth,
    proIncludedUsed: 0,
    proExtraUsed: 0,
    proExtraRemaining: activePlan.plan_type === "pro" ? 1 : 0,
    deskIncludedUsed: 0,
    deskExtraUsed: 0,
    deskIncludedRemaining: activePlan.plan_type === "desk" ? 2 : 0,
  };

  if (usage) {
    usageData = {
      month: currentMonth,
      proIncludedUsed: usage.pro_included_used || 0,
      proExtraUsed: usage.pro_extra_used || 0,
      proExtraRemaining:
        activePlan.plan_type === "pro" ? Math.max(0, 1 - (usage.pro_included_used || 0)) : 0,
      deskIncludedUsed: usage.desk_included_used || 0,
      deskExtraUsed: usage.desk_extra_used || 0,
      deskIncludedRemaining:
        activePlan.plan_type === "desk" ? Math.max(0, 2 - (usage.desk_included_used || 0)) : 0,
    };
  }

  if (activePlan.plan_type === "pro") {
    usageData.proExtraRemaining = Math.max(0, 3 - (usageData.proExtraUsed || 0));
  }

  let deskInfo = null;
  if (activePlan.plan_type === "desk" && planStatus === "active") {
    deskInfo = {
      analysesIncluded: 2,
      analysesUsed: usageData.deskIncludedUsed,
      analysesRemaining: usageData.deskIncludedRemaining,
    };
  }

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
      credits: 0,
      email: email || activePlan.email || null,
      userId: userId,
    },
    usage: usageData,
    isAdmin: isAdmin,
  });
}

// ===== REQUEST TOKEN =====
async function handleRequestToken(req, res) {
  // Reindirizza alla funzione originale (per compatibilità)
  // In futuro possiamo spostare la logica qui
  const originalHandler = await import("./request-dashboard-token.js");
  return originalHandler.default(req, res);
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
