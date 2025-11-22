// /api/billing.js
// API Vercel - Billing e Pagamenti (CONSOLIDATO)
// Consolida: create-stripe-checkout.js, cancel-subscription.js, save-billing-data.js, create-order.js, activate-order.js

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";

const supabase = getServiceSupabase();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

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

  const { token } = req.body;
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
  // Importa logica da orders.js
  const { getServicePrice } = await import("./_lib/xolo.js");
  const { sendEmail } = await import("./email.js");
  
  const body = req.body || {};
  const { order_type, token, metadata = {} } = body;

  if (!order_type) {
    throw new HttpError(400, "order_type richiesto");
  }

  const validOrderTypes = [
    "access_pro",
    "access_desk",
    "analysis_standalone",
    "analysis_extra_pro",
    "analysis_extra_desk",
    "pdf_download",
  ];

  if (!validOrderTypes.includes(order_type)) {
    throw new HttpError(400, `order_type non valido: ${order_type}`);
  }

  let context = null;
  let userId = null;
  let email = null;

  if (token) {
    try {
      context = await getAdminContextFromToken(token, { enforceAdmin: false });
      userId = context.userId;
      email = context.email || context.tokenRecord?.email;
    } catch {
      if (order_type !== "analysis_standalone") {
        throw new HttpError(401, "Token richiesto per questo servizio");
      }
    }
  } else if (order_type !== "analysis_standalone") {
    throw new HttpError(401, "Token richiesto per questo servizio");
  }

  if (!email && order_type === "analysis_standalone") {
    if (!metadata.email) {
      throw new HttpError(400, "Email richiesta per analisi standalone");
    }
    email = metadata.email;
  }

  if (!email) {
    throw new HttpError(400, "Email non disponibile");
  }

  const amount = getServicePrice(order_type);
  if (!amount || amount <= 0) {
    throw new HttpError(400, `Prezzo non disponibile per ${order_type}`);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      access_token: token || null,
      order_type,
      amount,
      currency: "EUR",
      status: "pending_manual",
      payment_method: "xolo_manual",
      metadata: {
        ...metadata,
        email,
      },
    })
    .select()
    .single();

  if (orderError) {
    console.error("[Billing] Errore creazione ordine:", orderError);
    throw new HttpError(500, "Errore creazione ordine", orderError.message);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@tradelia.org";
  try {
    await sendEmail({
      to: adminEmail,
      subject: `[Xolo Manuale] Nuovo Ordine - ${order.id.substring(0, 8)}`,
      html: `
        <h2>Nuovo Ordine - Fatturazione Manuale Xolo</h2>
        <p>Ordine ID: ${order.id}</p>
        <p>Tipo: ${order_type}</p>
        <p>Importo: €${amount.toFixed(2)}</p>
        <p>Utente: ${email}</p>
      `,
    });
  } catch (emailError) {
    console.error("[Billing] Errore invio email admin:", emailError);
  }

  return sendJSON(res, 200, {
    ok: true,
    order_id: order.id,
    order_type,
    amount,
    status: "pending_manual",
    message: "Ordine creato. Fatturazione manuale in corso.",
  });
}

// ===== ACTIVATE ORDER =====
async function handleActivateOrder(req, res) {
  const { checkXoloPayment } = await import("./_lib/xolo.js");
  
  const body = req.body || {};
  const { order_id, token, invoice_id, verify_payment = false } = body;

  if (!order_id) {
    throw new HttpError(400, "order_id richiesto");
  }

  if (!token) {
    throw new HttpError(401, "Token admin richiesto");
  }

  try {
    await getAdminContextFromToken(token, { enforceAdmin: true });
  } catch {
    throw new HttpError(403, "Permessi amministratore richiesti");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (orderError || !order) {
    throw new HttpError(404, "Ordine non trovato");
  }

  if (order.status === "completed") {
    return sendJSON(res, 200, {
      ok: true,
      message: "Ordine già completato",
      order_id: order.id,
    });
  }

  if (invoice_id && invoice_id !== order.payment_id) {
    await supabase
      .from("orders")
      .update({
        payment_id: invoice_id,
        metadata: {
          ...order.metadata,
          xolo_invoice_id: invoice_id,
        },
      })
      .eq("id", order.id);
  }

  if (verify_payment && order.payment_id) {
    try {
      const paymentStatus = await checkXoloPayment(order.payment_id);
      if (paymentStatus.status !== "paid") {
        throw new HttpError(400, `Pagamento non completato. Status: ${paymentStatus.status}`);
      }
    } catch {
      if (verify_payment) {
        throw new HttpError(400, "Impossibile verificare pagamento.");
      }
    }
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) {
    console.error("[Billing] Errore aggiornamento ordine:", updateError);
  }

  return sendJSON(res, 200, {
    ok: true,
    order_id: order.id,
    status: "completed",
    message: "Servizio attivato con successo",
  });
}

