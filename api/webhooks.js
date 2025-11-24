// /api/webhooks.js
// API Vercel - Webhooks (CONSOLIDATO)
// Consolida: webhook-stripe.js, webhook-role-sync.js

import { getServiceSupabase } from "./_lib/supabase.js";
import { handleRouteError } from "./_lib/http.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supabase = getServiceSupabase();

// NOTA: Funzione disabilitata per rispettare limite Vercel Hobby (12 funzioni)
// Consolidata in api/billing.js?action=webhook-*
// export default async function handler(req, res) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { type } = req.query;

    switch (type) {
      case "stripe":
        return await handleStripeWebhook(req, res);
      case "role-sync":
        return await handleRoleSyncWebhook(req, res);
      default:
        return res
          .status(400)
          .json({ ok: false, error: "Tipo webhook non valido. Usa: stripe, role-sync" });
    }
  } catch (error) {
    return handleRouteError(res, error, req);
  }
}

async function handleStripeWebhook(req, res) {
  // Implementazione webhook Stripe
  // TODO: Implementare logica webhook-stripe.js qui

  return res.status(200).json({ ok: true, received: true });
}

async function handleRoleSyncWebhook(req, res) {
  // Implementazione webhook role sync
  // TODO: Implementare logica webhook-role-sync.js qui

  return res.status(200).json({ ok: true, received: true });
}
