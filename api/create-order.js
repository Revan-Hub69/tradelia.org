/* eslint-env node */
/**
 * API: Crea Ordine e Fattura Xolo
 * POST /api/create-order
 *
 * Crea ordine in database e fattura Xolo per servizi una tantum
 */

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";
import { getServiceDescription, getServicePrice } from "./_lib/xolo.js";
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
    return await handleCreateOrder(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleCreateOrder(req, res) {
  const body = req.body || {};
  const { order_type, token, metadata = {} } = body;

  // Validazione input
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

  // Valida token e ottiene utente
  let context = null;
  let userId = null;
  let email = null;

  if (token) {
    try {
      context = await getAdminContextFromToken(token, { enforceAdmin: false });
      userId = context.userId;
      email = context.email || context.tokenRecord?.email;
    } catch {
      // Token non valido, ma alcuni servizi sono disponibili anche senza token
      if (order_type !== "analysis_standalone") {
        throw new HttpError(401, "Token richiesto per questo servizio");
      }
    }
  } else if (order_type !== "analysis_standalone") {
    throw new HttpError(401, "Token richiesto per questo servizio");
  }

  // Se email non disponibile da token, richiedila
  if (!email && order_type === "analysis_standalone") {
    if (!metadata.email) {
      throw new HttpError(400, "Email richiesta per analisi standalone");
    }
    email = metadata.email;
  }

  if (!email) {
    throw new HttpError(400, "Email non disponibile");
  }

  // Ottiene dati fatturazione da user_profiles (se disponibili)
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

  // Se non ci sono dati business, usa dati individual
  if (!billingData) {
    billingData = {
      user_type: "individual",
      email: email,
    };
  }

  // Ottiene prezzo servizio
  const amount = getServicePrice(order_type);
  if (!amount || amount <= 0) {
    throw new HttpError(400, `Prezzo non disponibile per ${order_type}`);
  }

  // Validazioni specifiche per tipo ordine
  if (order_type === "analysis_extra_pro" || order_type === "analysis_extra_desk") {
    // Verifica che utente abbia accesso attivo
    if (!userId) {
      throw new HttpError(401, "Accesso attivo richiesto per analisi extra");
    }

    // TODO: Verifica access grant attivo e limiti usage
    // Per ora saltiamo, implementeremo dopo
  }

  // Crea ordine in database (status: pending_manual - in attesa fatturazione manuale)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      access_token: token || null,
      order_type,
      amount,
      currency: "EUR",
      status: "pending_manual", // In attesa fatturazione manuale su Xolo
      payment_method: "xolo_manual",
      metadata: {
        ...metadata,
        email,
        billing_data: billingData, // Salva dati fatturazione per admin
      },
    })
    .select()
    .single();

  if (orderError) {
    console.error("[Create Order] Errore creazione ordine:", orderError);
    throw new HttpError(500, "Errore creazione ordine", orderError.message);
  }

  // Invia email all'admin con dati fatturazione (per creare fattura manualmente)
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
    // Non blocchiamo, l'ordine è stato creato
  }

  // Invia email all'utente (ordine in attesa)
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
    // Non blocchiamo, l'ordine è stato creato
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
