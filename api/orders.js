/* eslint-env node */
/**
 * API Router Unificato: Ordini e Fatturazione
 * Gestisce: crea ordine, attiva ordine, salva billing data
 * POST /api/orders?action=create|activate|save-billing
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
    const action = req.query?.action || req.body?.action || "create";
    return await handleOrderAction(req, res, action);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleOrderAction(req, res, action) {
  switch (action) {
    case "create":
      return await handleCreateOrder(req, res);
    case "activate":
      return await handleActivateOrder(req, res);
    case "save-billing":
      return await handleSaveBillingData(req, res);
    default:
      throw new HttpError(400, `Action non valida: ${action}`);
  }
}

// ===== CREATE ORDER =====
async function handleCreateOrder(req, res) {
  // Reindirizza alla funzione originale (per compatibilità)
  // TODO: Spostare logica qui per ridurre funzioni
  const originalHandler = await import("./create-order.js");
  return originalHandler.default(req, res);
}

// ===== ACTIVATE ORDER =====
async function handleActivateOrder(req, res) {
  // Reindirizza alla funzione originale (per compatibilità)
  // TODO: Spostare logica qui per ridurre funzioni
  const originalHandler = await import("./activate-order.js");
  return originalHandler.default(req, res);
}

// ===== SAVE BILLING DATA =====
async function handleSaveBillingData(req, res) {
  const body = req.body || {};
  const { token, billing_data } = body;

  if (!token) {
    throw new HttpError(401, "Token richiesto");
  }

  if (!billing_data) {
    throw new HttpError(400, "billing_data richiesto");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!userId) {
    throw new HttpError(401, "Utente non trovato");
  }

  const userType = billing_data.user_type;
  if (!userType || !["individual", "business"].includes(userType)) {
    throw new HttpError(400, 'user_type deve essere "individual" o "business"');
  }

  if (userType === "individual" && !billing_data.email) {
    throw new HttpError(400, "Email richiesta per utente individual");
  }

  if (userType === "business") {
    if (!billing_data.business_name) {
      throw new HttpError(400, "business_name richiesto per utente business");
    }
    if (!billing_data.business_country) {
      throw new HttpError(400, "business_country richiesto per utente business");
    }
  }

  const profileData = {
    user_type: userType,
    business_name: billing_data.business_name || null,
    business_country: billing_data.business_country || null,
    business_language: billing_data.business_language || "it",
    business_address: billing_data.business_address || null,
    business_city: billing_data.business_city || null,
    business_zip: billing_data.business_zip || null,
    business_vat: billing_data.business_vat || null,
    business_tax_id: billing_data.business_tax_id || null,
    business_invoice_days: billing_data.business_invoice_days || 0,
    business_contact_firstname: billing_data.business_contact_firstname || null,
    business_contact_lastname: billing_data.business_contact_lastname || null,
    business_contact_email: billing_data.business_contact_email || billing_data.email || null,
    business_comments: billing_data.business_comments || null,
  };

  const { data: existingProfile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let result;
  if (existingProfile) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(profileData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new HttpError(500, "Errore aggiornamento profilo", error.message);
    }
    result = data;
  } else {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        ...profileData,
      })
      .select()
      .single();

    if (error) {
      throw new HttpError(500, "Errore creazione profilo", error.message);
    }
    result = data;
  }

  return sendJSON(res, 200, {
    ok: true,
    profile: result,
    message: "Dati fatturazione salvati con successo",
  });
}
