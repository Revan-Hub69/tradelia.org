// /api/billing.js
// API Vercel - Billing e Pagamenti (CONSOLIDATO)
// Consolida: create-stripe-checkout.js, cancel-subscription.js, save-billing-data.js, create-order.js, activate-order.js

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";
import { runtimeFetch as fetch } from "./_lib/fetch.js";

const supabase = getServiceSupabase();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

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
      case "checkout":
        return await handleCheckout(req, res);
      case "subscription":
        if (req.method === "DELETE") {
          return await handleCancelSubscription(req, res);
        }
        return res.status(405).json({ ok: false, error: "Method not allowed" });
      case "data":
        return await handleSaveBillingData(req, res);
      case "order":
        if (req.method === "POST") {
          return await handleCreateOrder(req, res);
        }
        if (req.method === "PATCH") {
          return await handleActivateOrder(req, res);
        }
        return res.status(405).json({ ok: false, error: "Method not allowed" });
      default:
        return res.status(400).json({ ok: false, error: "Azione non valida. Usa: checkout, subscription, data, order" });
    }
  } catch (error) {
    return handleRouteError(res, error);
  }
}

// ===== CREATE STRIPE CHECKOUT =====
async function handleCheckout(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // TODO: Implementare logica create-stripe-checkout.js
  // Richiede STRIPE_SECRET_KEY per creare session Stripe

  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({ ok: false, error: "Stripe non configurato" });
  }

  return sendJSON(res, 200, {
    ok: true,
    message: "Checkout session created",
    // TODO: Restituire session ID Stripe
  });
}

// ===== CANCEL SUBSCRIPTION =====
async function handleCancelSubscription(req, res) {
  const { token } = req.body;
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!userId) {
    throw new HttpError(401, "Utente non autenticato");
  }

  // Cerca abbonamento attivo
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    return sendJSON(res, 200, { ok: false, error: "Nessun abbonamento attivo trovato" });
  }

  // Aggiorna status a cancelled
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);

  if (updateError) {
    console.error("[Billing] Errore cancellazione:", updateError);
    return res.status(500).json({ ok: false, error: "Errore cancellazione abbonamento" });
  }

  return sendJSON(res, 200, { ok: true, message: "Abbonamento cancellato con successo" });
}

// ===== SAVE BILLING DATA =====
async function handleSaveBillingData(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { token, billingData } = req.body;
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!userId) {
    throw new HttpError(401, "Utente non autenticato");
  }

  // Salva dati billing
  // TODO: Implementare logica save-billing-data.js

  return sendJSON(res, 200, { ok: true, message: "Dati billing salvati" });
}

// ===== CREATE ORDER =====
async function handleCreateOrder(req, res) {
  const { token, orderData } = req.body;
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });

  // Crea ordine
  // TODO: Implementare logica create-order.js

  return sendJSON(res, 200, { ok: true, message: "Ordine creato", orderId: null });
}

// ===== ACTIVATE ORDER =====
async function handleActivateOrder(req, res) {
  const { token, orderId } = req.body;
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: true }); // Richiede admin

  if (!context.isAdmin) {
    throw new HttpError(403, "Accesso negato - richiesto admin");
  }

  // Attiva ordine
  // TODO: Implementare logica activate-order.js

  return sendJSON(res, 200, { ok: true, message: "Ordine attivato" });
}

