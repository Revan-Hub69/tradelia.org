/* eslint-env node */
/**
 * API Router Unificato: Ordini e Fatturazione
 * Gestisce: crea ordine, attiva ordine, salva billing data
 * POST /api/orders?action=create|activate|save-billing
 */

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";
import { getServiceDescription, getServicePrice, checkXoloPayment } from "./_lib/xolo.js";
import { sendEmail } from "./send-email.js";
import { sendUserNotification } from "./_lib/notifications.js";

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

  let billingData = null;
  if (userId) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      billingData = {
        user_type: profile.user_type || "individual",
        email: email,
        business_name: profile.business_name,
        business_country: profile.business_country,
        business_address: profile.business_address,
        business_city: profile.business_city,
        business_zip: profile.business_zip,
        business_vat: profile.business_vat,
        business_tax_id: profile.business_tax_id,
        business_contact_email: profile.business_contact_email || email,
        business_contact_firstname: profile.business_contact_firstname,
        business_contact_lastname: profile.business_contact_lastname,
      };
    }
  }

  if (!billingData) {
    billingData = {
      user_type: "individual",
      email: email,
    };
  }

  const amount = getServicePrice(order_type);
  if (!amount || amount <= 0) {
    throw new HttpError(400, `Prezzo non disponibile per ${order_type}`);
  }

  if (order_type === "analysis_extra_pro" || order_type === "analysis_extra_desk") {
    if (!userId) {
      throw new HttpError(401, "Accesso attivo richiesto per analisi extra");
    }
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
        billing_data: billingData,
      },
    })
    .select()
    .single();

  if (orderError) {
    console.error("[Create Order] Errore creazione ordine:", orderError);
    throw new HttpError(500, "Errore creazione ordine", orderError.message);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@tradelia.org";
  try {
    const billingInfo =
      billingData.user_type === "business"
        ? `
        <h3>Dati Business:</h3>
        <ul>
          <li><strong>Ragione Sociale:</strong> ${billingData.business_name || "N/A"}</li>
          <li><strong>Paese:</strong> ${billingData.business_country || "N/A"}</li>
          <li><strong>P.IVA:</strong> ${billingData.business_vat || "N/A"}</li>
          <li><strong>Indirizzo:</strong> ${billingData.business_address || "N/A"}</li>
          <li><strong>Città:</strong> ${billingData.business_city || "N/A"}</li>
          <li><strong>CAP:</strong> ${billingData.business_zip || "N/A"}</li>
          <li><strong>Referente:</strong> ${billingData.business_contact_firstname || ""} ${billingData.business_contact_lastname || ""}</li>
          <li><strong>Email Referente:</strong> ${billingData.business_contact_email || email}</li>
        </ul>
      `
        : `
        <h3>Dati Individual:</h3>
        <ul>
          <li><strong>Nome:</strong> ${billingData.business_contact_firstname || ""} ${billingData.business_contact_lastname || ""}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
      `;

    await sendEmail({
      to: adminEmail,
      subject: `[Xolo Manuale] Nuovo Ordine - Fatturazione Richiesta - ${order.id.substring(0, 8)}`,
      html: `
        <h2>Nuovo Ordine - Fatturazione Manuale Xolo</h2>
        <p>Un nuovo ordine richiede la creazione manuale di una fattura su Xolo.</p>
        
        <h3>Dettagli Ordine:</h3>
        <ul>
          <li><strong>Ordine ID:</strong> ${order.id}</li>
          <li><strong>Tipo:</strong> ${order_type}</li>
          <li><strong>Importo:</strong> €${amount.toFixed(2)}</li>
          <li><strong>Utente:</strong> ${email}</li>
          <li><strong>User ID:</strong> ${userId || "Guest"}</li>
        </ul>

        <h3>Descrizione Servizio:</h3>
        <p>${getServiceDescription(order_type)}</p>

        ${billingInfo}

        <h3>Azioni Richieste:</h3>
        <ol>
          <li>Crea fattura su Xolo Dashboard con i dati sopra</li>
          <li>Salva l'invoice_id Xolo</li>
          <li>Vai su Admin Dashboard → Ordini</li>
          <li>Trova ordine ${order.id.substring(0, 8)}...</li>
          <li>Inserisci invoice_id e clicca "Segna come Pagato"</li>
        </ol>

        <p><a href="${process.env.ADMIN_DASHBOARD_URL || "https://tradelia.org/admin/orders.html"}">Vai a Admin Dashboard</a></p>
      `,
    });
  } catch (emailError) {
    console.error("[Create Order] Errore invio email admin:", emailError);
  }

  try {
    await sendEmail({
      to: email,
      subject: `Ordine Ricevuto - Tradelia AI`,
      html: `
        <h2>Ordine Ricevuto</h2>
        <p>Ciao,</p>
        <p>Abbiamo ricevuto la tua richiesta per: <strong>${getServiceDescription(order_type).split(".")[0]}</strong></p>
        <p>Importo: <strong>€${amount.toFixed(2)}</strong></p>
        <p><strong>Ordine ID:</strong> ${order.id.substring(0, 8)}...</p>
        
        <h3>Prossimi Passi:</h3>
        <p>Stiamo preparando la fattura. Riceverai un'email con il link per il pagamento entro 24-48 ore.</p>
        <p>Dopo il pagamento, il servizio sarà attivato automaticamente.</p>
        
        <p>Grazie per la tua fiducia,<br>Tradelia AI</p>
      `,
    });
  } catch (emailError) {
    console.error("[Create Order] Errore invio email utente:", emailError);
  }

  return sendJSON(res, 200, {
    ok: true,
    order_id: order.id,
    order_type,
    amount,
    status: "pending_manual",
    message:
      "Ordine creato. Fatturazione manuale in corso. Riceverai email con fattura entro 24-48 ore.",
  });
}

// ===== ACTIVATE ORDER =====
async function handleActivateOrder(req, res) {
  const body = req.body || {};
  const { order_id, token, invoice_id, verify_payment = false } = body;

  if (!order_id) {
    throw new HttpError(400, "order_id richiesto");
  }

  if (!token) {
    throw new HttpError(401, "Token admin richiesto");
  }

  let context;
  try {
    context = await getAdminContextFromToken(token, { enforceAdmin: true });
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

  if (order.status === "cancelled" || order.status === "refunded") {
    throw new HttpError(400, "Ordine cancellato o rimborsato, non può essere attivato");
  }

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
    }

    order.payment_id = invoice_id;
  }

  if (verify_payment && order.payment_id) {
    try {
      const paymentStatus = await checkXoloPayment(order.payment_id);

      if (paymentStatus.status !== "paid") {
        throw new HttpError(400, `Pagamento non completato. Status: ${paymentStatus.status}`);
      }
    } catch (xoloError) {
      console.error("[Activate Order] Errore verifica pagamento Xolo:", xoloError);
      if (verify_payment) {
        throw new HttpError(
          400,
          "Impossibile verificare pagamento. Attiva manualmente se pagamento confermato."
        );
      }
    }
  }

  let activationResult = null;

  if (order.order_type === "access_pro" || order.order_type === "access_desk") {
    const grantType = order.order_type === "access_pro" ? "pro" : "desk";
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

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
    const { data: delivery, error: deliveryError } = await supabase
      .from("service_deliveries")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        access_token: order.access_token,
        service_type: "analysis",
        service_data: order.metadata || {},
        status: "pending",
      })
      .select()
      .single();

    if (deliveryError) {
      console.error("[Activate Order] Errore creazione service delivery:", deliveryError);
      throw new HttpError(500, "Errore creazione servizio", deliveryError.message);
    }

    activationResult = { delivery_id: delivery.id, service_type: "analysis" };
  } else if (order.order_type === "pdf_download") {
    const { data: delivery, error: deliveryError } = await supabase
      .from("service_deliveries")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        access_token: order.access_token,
        service_type: "pdf_download",
        service_data: order.metadata || {},
        status: "completed",
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

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) {
    console.error("[Activate Order] Errore aggiornamento ordine:", updateError);
  }

  const email = order.metadata?.email || context.email;
  if (email) {
    try {
      const serviceName = getServiceName(order.order_type);
      let message = `Il tuo servizio è stato attivato!\n\n${serviceName}\n\n`;

      if (order.order_type.startsWith("access_")) {
        message += `Accesso attivo fino a: ${activationResult?.expires_at ? new Date(activationResult.expires_at).toLocaleDateString("it-IT") : "30 giorni"}`;
      } else if (order.order_type.startsWith("analysis_")) {
        message += "La tua analisi sarà pronta entro 24-48 ore.";
      } else {
        message += "Puoi scaricare il PDF dalla dashboard.";
      }

      // Usa metodo preferito utente (SMS/WhatsApp/Email)
      await sendUserNotification(
        order.user_id,
        email,
        "Servizio Attivato - Tradelia AI",
        message,
        "https://tradelia.org/dashboard.html"
      );
    } catch (notificationError) {
      console.error("[Activate Order] Errore invio notifica:", notificationError);
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
