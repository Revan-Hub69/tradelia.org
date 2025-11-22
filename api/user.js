// /api/user.js
// API Vercel - Gestione Utente (CONSOLIDATO)
// Consolida: get-user-plan.js

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";

const supabase = getServiceSupabase();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case "plan":
        return await handleGetPlan(req, res);
      default:
        return res.status(400).json({ ok: false, error: "Azione non valida. Usa: plan" });
    }
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleGetPlan(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { token } = req.body;
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
        email: email || null,
        userId: userId,
      },
      usage: getEmptyUsage(),
      isAdmin: isAdmin,
    });
  }

  const currentMonth = getCurrentMonth();
  const { data: usage } = await supabase
    .from("plan_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("month_year", currentMonth)
    .maybeSingle();

  const usageData = usage ? {
    month: currentMonth,
    proIncludedUsed: usage.pro_included_used || 0,
    proExtraUsed: usage.pro_extra_used || 0,
    proExtraRemaining: activePlan.plan_type === "pro" ? Math.max(0, 1 - (usage.pro_included_used || 0)) : 0,
    deskIncludedUsed: usage.desk_included_used || 0,
    deskExtraUsed: usage.desk_extra_used || 0,
    deskIncludedRemaining: activePlan.plan_type === "desk" ? Math.max(0, 2 - (usage.desk_included_used || 0)) : 0,
  } : getEmptyUsage();

  return sendJSON(res, 200, {
    ok: true,
    plan: {
      type: activePlan.plan_type,
      status: activePlan.status,
      startedAt: activePlan.started_at,
      expiresAt: activePlan.expires_at,
      email: email || activePlan.email || null,
      userId: userId,
    },
    usage: usageData,
    isAdmin: isAdmin,
  });
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getEmptyUsage() {
  return {
    month: getCurrentMonth(),
    proIncludedUsed: 0,
    proExtraUsed: 0,
    proExtraRemaining: 0,
    deskIncludedUsed: 0,
    deskExtraUsed: 0,
    deskIncludedRemaining: 0,
  };
}

// ===== USER NOTIFICATIONS =====
async function handleNotifications(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  // Query notifiche utente
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq(userId ? "user_id" : "user_token", userId || token)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[User] Errore notifiche:", error);
    return res.status(500).json({ ok: false, error: "Errore caricamento notifiche" });
  }

  return sendJSON(res, 200, { ok: true, notifications: data || [] });
}

// ===== USER REQUESTS =====
async function handleRequests(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!userId) {
    return sendJSON(res, 200, { ok: true, requests: [] });
  }

  // Query richieste utente
  const { data, error } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[User] Errore richieste:", error);
    return res.status(500).json({ ok: false, error: "Errore caricamento richieste" });
  }

  return sendJSON(res, 200, { ok: true, requests: data || [] });
}

