/* eslint-env node */
/**
 * API: Salva Dati Fatturazione
 * POST /api/save-billing-data
 *
 * Salva dati fatturazione (individual o business) in user_profiles
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
    return await handleSaveBillingData(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleSaveBillingData(req, res) {
  const body = req.body || {};
  const { token, billing_data } = body;

  if (!token) {
    throw new HttpError(401, "Token richiesto");
  }

  if (!billing_data) {
    throw new HttpError(400, "billing_data richiesto");
  }

  // Valida token e ottiene utente
  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!userId) {
    throw new HttpError(401, "Utente non trovato");
  }

  // Valida tipo utente
  const userType = billing_data.user_type;
  if (!userType || !["individual", "business"].includes(userType)) {
    throw new HttpError(400, 'user_type deve essere "individual" o "business"');
  }

  // Valida dati individual
  if (userType === "individual") {
    if (!billing_data.email) {
      throw new HttpError(400, "Email richiesta per utente individual");
    }
  }

  // Valida dati business
  if (userType === "business") {
    if (!billing_data.business_name) {
      throw new HttpError(400, "business_name richiesto per utente business");
    }
    if (!billing_data.business_country) {
      throw new HttpError(400, "business_country richiesto per utente business");
    }
    // P.IVA opzionale ma consigliata per B2B
  }

  // Prepara dati per user_profiles
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

  // Cerca o crea user_profile
  const { data: existingProfile, error: fetchError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("[Save Billing Data] Errore verifica profile:", fetchError);
    throw new HttpError(500, "Errore verifica profilo utente", fetchError.message);
  }

  let result;
  if (existingProfile) {
    // Aggiorna profilo esistente
    const { data, error } = await supabase
      .from("user_profiles")
      .update(profileData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[Save Billing Data] Errore aggiornamento profile:", error);
      throw new HttpError(500, "Errore aggiornamento profilo", error.message);
    }
    result = data;
  } else {
    // Crea nuovo profilo
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        ...profileData,
      })
      .select()
      .single();

    if (error) {
      console.error("[Save Billing Data] Errore creazione profile:", error);
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
