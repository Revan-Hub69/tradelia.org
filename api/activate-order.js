/* eslint-env node */
/**
 * API: Attiva Ordine Dopo Pagamento
 * POST /api/activate-order
 *
 * Attiva servizio dopo verifica pagamento Xolo
 * Solo admin o service role può chiamare questa API
 */

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";
import { checkXoloPayment } from "./_lib/xolo.js";
import { sendEmail } from "./send-email.js";

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
    return await handleActivateOrder(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleActivateOrder(req, res) {
  const body = req.body || {};
  const { order_id, token, invoice_id, verify_payment = false } = body;

  if (!order_id) {
    throw new HttpError(400, "order_id richiesto");
  }

  // Verifica admin token
  if (!token) {
    throw new HttpError(401, "Token admin richiesto");
  }

  let context;
  try {
    context = await getAdminContextFromToken(token, { enforceAdmin: true });
  } catch {
    throw new HttpError(403, "Permessi amministratore richiesti");
  }

  // Ottiene ordine
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (orderError || !order) {
    throw new HttpError(404, "Ordine non trovato");
  }

  // Verifica stato ordine
  if (order.status === "completed") {
    return sendJSON(res, 200, {
      ok: true,
      message: "Ordine già completato",
      order_id: order.id,
    });
  }

  if (order.status === "cancelled" || order.status === "refunded") {
    throw new HttpError(400, "Ordine cancellato o rimborsato, non può essere attivato");
  }

  // Se invoice_id fornito manualmente, aggiorna ordine
  if (invoice_id && invoice_id !== order.payment_id) {
    const { error: updatePaymentError } = await supabase
      .from("orders")
      .update({
        payment_id: invoice_id,
        metadata: {
          ...order.metadata,
          xolo_invoice_id: invoice_id,
          activated_manually: true,
          activated_by: context.email,
          activated_at: new Date().toISOString(),
        },
      })
      .eq("id", order.id);

    if (updatePaymentError) {
      console.error("[Activate Order] Errore aggiornamento payment_id:", updatePaymentError);
      // Non blocchiamo, continuiamo
    }

    // Aggiorna order object
    order.payment_id = invoice_id;
  }

  // Verifica pagamento Xolo solo se richiesto (default: false per workflow manuale)
  if (verify_payment && order.payment_id) {
    try {
      const paymentStatus = await checkXoloPayment(order.payment_id);

      if (paymentStatus.status !== "paid") {
        throw new HttpError(400, `Pagamento non completato. Status: ${paymentStatus.status}`);
      }
    } catch (xoloError) {
      console.error("[Activate Order] Errore verifica pagamento Xolo:", xoloError);
      // Se verifica fallisce, permettere attivazione manuale (admin può forzare)
      if (verify_payment) {
        throw new HttpError(
          400,
          "Impossibile verificare pagamento. Attiva manualmente se pagamento confermato."
        );
      }
    }
  }

  // Attiva servizio in base al tipo ordine
  let activationResult = null;

  if (order.order_type === "access_pro" || order.order_type === "access_desk") {
    // Crea access grant
    const grantType = order.order_type === "access_pro" ? "pro" : "desk";
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 giorni

    const { data: grant, error: grantError } = await supabase
      .from("access_grants")
      .insert({
        user_id: order.user_id,
        access_token: order.access_token,
        order_id: order.id,
        grant_type: grantType,
        status: "active",
        started_at: new Date(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (grantError) {
      console.error("[Activate Order] Errore creazione access grant:", grantError);
      throw new HttpError(500, "Errore attivazione accesso", grantError.message);
    }

    activationResult = { grant_id: grant.id, grant_type: grantType, expires_at: expiresAt };
  } else if (
    order.order_type === "analysis_standalone" ||
    order.order_type === "analysis_extra_pro" ||
    order.order_type === "analysis_extra_desk"
  ) {
    // Crea service delivery per analisi
    const { data: delivery, error: deliveryError } = await supabase
      .from("service_deliveries")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        access_token: order.access_token,
        service_type: "analysis",
        service_data: order.metadata || {},
        status: "pending", // Sarà aggiornato quando analisi completata
      })
      .select()
      .single();

    if (deliveryError) {
      console.error("[Activate Order] Errore creazione service delivery:", deliveryError);
      throw new HttpError(500, "Errore creazione servizio", deliveryError.message);
    }

    activationResult = { delivery_id: delivery.id, service_type: "analysis" };
  } else if (order.order_type === "pdf_download") {
    // Crea service delivery per PDF
    const { data: delivery, error: deliveryError } = await supabase
      .from("service_deliveries")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        access_token: order.access_token,
        service_type: "pdf_download",
        service_data: order.metadata || {},
        status: "completed", // PDF è immediato
        delivered_at: new Date(),
      })
      .select()
      .single();

    if (deliveryError) {
      console.error("[Activate Order] Errore creazione service delivery:", deliveryError);
      throw new HttpError(500, "Errore creazione servizio", deliveryError.message);
    }

    activationResult = { delivery_id: delivery.id, service_type: "pdf_download" };
  }

  // Aggiorna ordine a completed
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) {
    console.error("[Activate Order] Errore aggiornamento ordine:", updateError);
    // Non blocchiamo, il servizio è stato attivato
  }

  // Invia email conferma
  const email = order.metadata?.email || context.email;
  if (email) {
    try {
      const serviceName = getServiceName(order.order_type);
      await sendEmail({
        to: email,
        subject: `Servizio Attivato - Tradelia AI`,
        html: `
          <h2>Servizio Attivato</h2>
          <p>Ciao,</p>
          <p>Il tuo servizio è stato attivato!</p>
          <p><strong>${serviceName}</strong></p>
          ${
            order.order_type.startsWith("access_")
              ? `<p>Accesso attivo fino a: ${activationResult?.expires_at ? new Date(activationResult.expires_at).toLocaleDateString("it-IT") : "30 giorni"}</p>`
              : order.order_type.startsWith("analysis_")
                ? `<p>La tua analisi sarà pronta entro 24-48 ore.</p>`
                : `<p>Puoi scaricare il PDF dalla dashboard.</p>`
          }
          <p><a href="https://tradelia.org/dashboard.html">Vai alla Dashboard</a></p>
          <p>Grazie,<br>Tradelia AI</p>
        `,
      });
    } catch (emailError) {
      console.error("[Activate Order] Errore invio email:", emailError);
      // Non blocchiamo
    }
  }

  return sendJSON(res, 200, {
    ok: true,
    order_id: order.id,
    status: "completed",
    activation: activationResult,
    message: "Servizio attivato con successo",
  });
}

function getServiceName(orderType) {
  const names = {
    access_pro: "Accesso Pro 30 giorni",
    access_desk: "Accesso Desk 30 giorni",
    analysis_standalone: "Analisi Standalone",
    analysis_extra_pro: "Analisi Extra Pro",
    analysis_extra_desk: "Analisi Extra Desk",
    pdf_download: "Download PDF",
  };
  return names[orderType] || orderType;
}
