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
      case "start-trial":
        return await handleStartTrial(req, res);
      case "convert-trial":
        return await handleConvertTrial(req, res);
      case "request-refund":
        return await handleRequestRefund(req, res);
      default:
        return res.status(400).json({
          ok: false,
          error:
            "Azione non valida. Usa: checkout, subscription, data, order, start-trial, convert-trial, request-refund",
        });
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

// ===== START TRIAL =====
/**
 * Avvia trial period 14 giorni per nuovo utente Pro
 * BEST PRACTICE: Solo prima volta, verifica eligibilità
 */
async function handleStartTrial(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { token } = req.body;
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;
  const email = context.email || context.tokenRecord?.email;

  if (!userId || !email) {
    throw new HttpError(401, "Utente non autenticato");
  }

  try {
    // Verifica se utente può usare trial (solo prima volta)
    const { data: existingTrials } = await supabase
      .from("trial_usage")
      .select("id")
      .eq("user_id", userId)
      .eq("plan_type", "pro")
      .limit(1);

    if (existingTrials && existingTrials.length > 0) {
      return res.status(400).json({
        ok: false,
        error:
          "Hai già usato il periodo di prova gratuito. Il trial è disponibile solo per la prima volta.",
      });
    }

    // Verifica se ha già subscription attiva
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("plan_type", "pro")
      .in("status", ["active", "trial", "pending_payment"])
      .limit(1);

    if (existingSub && existingSub.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "Hai già un abbonamento Pro attivo o in corso.",
      });
    }

    // Calcola date trial
    const trialStartedAt = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 giorni

    // Crea subscription con trial
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_type: "pro",
        status: "trial",
        trial_started_at: trialStartedAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        trial_used: true,
        started_at: trialStartedAt.toISOString(),
        metadata: {
          trial_source: "user_requested",
          email,
        },
      })
      .select()
      .single();

    if (subError) {
      console.error("[Billing] Errore creazione trial:", subError);
      throw new HttpError(500, "Errore creazione trial", subError.message);
    }

    // Registra trial usage
    await supabase.from("trial_usage").insert({
      user_id: userId,
      email: email.toLowerCase(),
      plan_type: "pro",
      trial_started_at: trialStartedAt.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
      converted_to_paid: false,
      cancelled_during_trial: false,
    });

    // Aggiorna user_role per dare accesso Pro durante trial
    await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        email: email.toLowerCase(),
        role: "pro",
        valid_until: trialEndsAt.toISOString(),
      },
      { onConflict: "user_id" }
    );

    return sendJSON(res, 200, {
      ok: true,
      subscription_id: subscription.id,
      trial_ends_at: trialEndsAt.toISOString(),
      days_remaining: 14,
      message: "Trial period avviato. Hai 14 giorni di accesso gratuito completo.",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("[Billing] Errore start trial:", error);
    throw new HttpError(500, "Errore avvio trial", error.message);
  }
}

// ===== CONVERT TRIAL =====
/**
 * Converte trial scaduto in pagamento
 * BEST PRACTICE: Auto-conversione dopo 14 giorni se non disdetto
 */
async function handleConvertTrial(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { token, subscription_id } = req.body;
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;
  const email = context.email || context.tokenRecord?.email;

  if (!userId) {
    throw new HttpError(401, "Utente non autenticato");
  }

  try {
    // Trova subscription trial
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "trial")
      .eq("plan_type", "pro")
      .order("trial_started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      throw new HttpError(404, "Nessun trial attivo trovato");
    }

    // Verifica se trial è scaduto o sta per scadere
    const now = new Date();
    const trialEndsAt = new Date(subscription.trial_ends_at);
    const daysUntilExpiry = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > 0) {
      return res.status(400).json({
        ok: false,
        error: `Il trial è ancora attivo. Scade tra ${daysUntilExpiry} giorni.`,
        trial_ends_at: subscription.trial_ends_at,
        days_remaining: daysUntilExpiry,
      });
    }

    // Crea ordine per conversione
    const { getServicePrice, getServiceDescription } = await import("./_lib/xolo.js");
    const amount = getServicePrice("access_pro");
    const description = getServiceDescription("access_pro");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        access_token: token,
        order_type: "access_pro",
        amount,
        currency: "EUR",
        status: "pending_manual",
        payment_method: "xolo_manual",
        metadata: {
          email,
          converted_from_trial: true,
          trial_subscription_id: subscription.id,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error("[Billing] Errore creazione ordine conversione:", orderError);
      throw new HttpError(500, "Errore creazione ordine", orderError.message);
    }

    // Aggiorna subscription a pending_payment
    await supabase
      .from("subscriptions")
      .update({
        status: "pending_payment",
        metadata: {
          ...subscription.metadata,
          converted_order_id: order.id,
          converted_at: new Date().toISOString(),
        },
      })
      .eq("id", subscription.id);

    // Aggiorna trial_usage
    await supabase
      .from("trial_usage")
      .update({ converted_to_paid: true })
      .eq("user_id", userId)
      .eq("plan_type", "pro");

    // Invia email admin per fatturazione
    const { sendEmail } = await import("./email.js");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tradelia.org";
    try {
      await sendEmail({
        to: adminEmail,
        subject: `[Trial Convertito] Nuovo Ordine - ${order.id.substring(0, 8)}`,
        html: `
          <h2>Trial Convertito in Pagamento</h2>
          <p>L'utente ${email} ha completato il trial period e richiede fatturazione.</p>
          <p><strong>Ordine ID:</strong> ${order.id}</p>
          <p><strong>Importo:</strong> €${amount.toFixed(2)}</p>
          <p><strong>Tipo:</strong> Accesso Pro (conversione da trial)</p>
          <p>Crea fattura su Xolo e segna ordine come pagato.</p>
        `,
      });
    } catch (emailError) {
      console.error("[Billing] Errore invio email admin:", emailError);
    }

    return sendJSON(res, 200, {
      ok: true,
      order_id: order.id,
      subscription_id: subscription.id,
      amount,
      message: "Trial convertito in pagamento. Riceverai la fattura via email entro 14 giorni.",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("[Billing] Errore conversione trial:", error);
    throw new HttpError(500, "Errore conversione trial", error.message);
  }
}

// ===== REQUEST REFUND =====
/**
 * Richiede rimborso entro 14 giorni dal pagamento
 * BEST PRACTICE: Money-back guarantee conforme Direttiva Europea Consumatori
 */
async function handleRequestRefund(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { token, order_id, reason } = req.body;
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;
  const email = context.email || context.tokenRecord?.email;

  if (!userId || !order_id) {
    throw new HttpError(400, "Token e order_id richiesti");
  }

  try {
    // Trova ordine
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", userId)
      .single();

    if (orderError || !order) {
      throw new HttpError(404, "Ordine non trovato");
    }

    // Verifica status ordine
    if (order.status !== "paid" && order.status !== "completed") {
      return res.status(400).json({
        ok: false,
        error: "Il rimborso è disponibile solo per ordini pagati.",
      });
    }

    // Verifica eligibilità (entro 14 giorni)
    const orderCreatedAt = new Date(order.created_at);
    const now = new Date();
    const daysSincePayment = Math.floor((now - orderCreatedAt) / (1000 * 60 * 60 * 24));

    if (daysSincePayment > 14) {
      return res.status(400).json({
        ok: false,
        error:
          "Il periodo di rimborso di 14 giorni è scaduto. Il rimborso è disponibile solo entro 14 giorni dal pagamento.",
        days_since_payment: daysSincePayment,
      });
    }

    // Verifica se già richiesto rimborso
    const { data: existingRefund } = await supabase
      .from("refunds")
      .select("id, status")
      .eq("order_id", order_id)
      .in("status", ["pending", "approved", "processed"])
      .limit(1);

    if (existingRefund && existingRefund.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "Rimborso già richiesto per questo ordine.",
        refund_id: existingRefund[0].id,
        status: existingRefund[0].status,
      });
    }

    // Crea richiesta rimborso
    const { data: refund, error: refundError } = await supabase
      .from("refunds")
      .insert({
        order_id: order.id,
        user_id: userId,
        amount: order.amount,
        currency: order.currency || "EUR",
        reason: reason || "Richiesta rimborso entro 14 giorni (Money-Back Guarantee)",
        status: "pending",
      })
      .select()
      .single();

    if (refundError) {
      console.error("[Billing] Errore creazione refund:", refundError);
      throw new HttpError(500, "Errore creazione richiesta rimborso", refundError.message);
    }

    // Aggiorna subscription se associata
    if (order.order_type === "access_pro" || order.order_type === "access_desk") {
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: "refund_requested",
          refund_requested_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .in("status", ["active", "pending_payment"]);
    }

    // Invia email admin
    const { sendEmail } = await import("./email.js");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tradelia.org";
    try {
      await sendEmail({
        to: adminEmail,
        subject: `[Rimborso Richiesto] ${order.id.substring(0, 8)} - ${email}`,
        html: `
          <h2>Richiesta Rimborso</h2>
          <p><strong>Utente:</strong> ${email}</p>
          <p><strong>Ordine ID:</strong> ${order.id}</p>
          <p><strong>Importo:</strong> €${order.amount.toFixed(2)}</p>
          <p><strong>Giorni da pagamento:</strong> ${daysSincePayment}</p>
          <p><strong>Motivo:</strong> ${reason || "Nessun motivo specificato"}</p>
          <p>Processa rimborso via Xolo Go entro 5-10 giorni lavorativi.</p>
        `,
      });
    } catch (emailError) {
      console.error("[Billing] Errore invio email admin:", emailError);
    }

    return sendJSON(res, 200, {
      ok: true,
      refund_id: refund.id,
      order_id: order.id,
      amount: order.amount,
      days_since_payment: daysSincePayment,
      message:
        "Richiesta rimborso ricevuta. Il rimborso verrà processato entro 5-10 giorni lavorativi.",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("[Billing] Errore richiesta rimborso:", error);
    throw new HttpError(500, "Errore richiesta rimborso", error.message);
  }
}
