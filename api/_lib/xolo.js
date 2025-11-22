/* eslint-env node */
/**
 * Xolo Go Integration
 * Gestione fatturazione manuale via Xolo Go API
 */

import { HttpError } from "./http.js";

const XOLO_API_BASE = process.env.XOLO_API_BASE || "https://api.xolo.io";
const XOLO_API_KEY = process.env.XOLO_API_KEY;

if (!XOLO_API_KEY) {
  console.warn("[Xolo] XOLO_API_KEY non configurato - funzionalità limitata");
}

/**
 * Crea fattura in Xolo Go
 * @param {object} invoiceData - Dati fattura
 * @param {object} billingData - Dati fatturazione utente (opzionale)
 * @returns {Promise<{invoice_id: string, invoice_url: string}>}
 */
export async function createXoloInvoice(invoiceData, billingData = null) {
  if (!XOLO_API_KEY) {
    throw new HttpError(500, "Xolo API key non configurato");
  }

  const {
    customer_email,
    amount,
    currency = "EUR",
    description,
    due_days = 14,
    metadata = {},
  } = invoiceData;

  if (!customer_email || !amount || !description) {
    throw new HttpError(400, "Dati fattura incompleti");
  }

  try {
    // Calcola data scadenza
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + due_days);

    // Prepara dati cliente per Xolo
    const customerData = {
      email: customer_email,
    };

    // Se ci sono dati business, aggiungili
    if (billingData && billingData.user_type === "business") {
      customerData.name = billingData.business_name;
      customerData.country = billingData.business_country || "IT";
      customerData.address = billingData.business_address;
      customerData.city = billingData.business_city;
      customerData.zip = billingData.business_zip;
      customerData.vat_number = billingData.business_vat; // P.IVA con prefisso paese (es. IT12345678901)
      customerData.tax_id = billingData.business_tax_id;
      customerData.contact_email = billingData.business_contact_email || customer_email;
      customerData.contact_name =
        `${billingData.business_contact_firstname || ""} ${billingData.business_contact_lastname || ""}`.trim();
    } else {
      // Individual: solo email e nome se disponibile
      customerData.name =
        billingData?.business_contact_firstname && billingData?.business_contact_lastname
          ? `${billingData.business_contact_firstname} ${billingData.business_contact_lastname}`
          : customer_email.split("@")[0];
    }

    const payload = {
      customer: customerData,
      amount: parseFloat(amount),
      currency,
      description,
      due_date: dueDate.toISOString().split("T")[0],
      metadata: {
        ...metadata,
        source: "tradelia-ai",
        user_type: billingData?.user_type || "individual",
        created_at: new Date().toISOString(),
      },
    };

    const response = await fetch(`${XOLO_API_BASE}/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XOLO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Xolo] Errore creazione fattura:", errorText);
      throw new HttpError(response.status, `Errore creazione fattura Xolo: ${errorText}`);
    }

    const data = await response.json();

    return {
      invoice_id: data.id || data.invoice_id,
      invoice_url: data.url || data.invoice_url || data.payment_link,
      invoice_number: data.number || data.invoice_number,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("[Xolo] Errore generico:", error);
    throw new HttpError(500, "Errore comunicazione con Xolo", error.message);
  }
}

/**
 * Verifica stato pagamento fattura
 * @param {string} invoiceId - ID fattura Xolo
 * @returns {Promise<{status: string, paid_at: string|null}>}
 */
export async function checkXoloPayment(invoiceId) {
  if (!XOLO_API_KEY) {
    throw new HttpError(500, "Xolo API key non configurato");
  }

  if (!invoiceId) {
    throw new HttpError(400, "Invoice ID mancante");
  }

  try {
    const response = await fetch(`${XOLO_API_BASE}/invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${XOLO_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Xolo] Errore verifica fattura:", errorText);
      throw new HttpError(response.status, `Errore verifica fattura Xolo: ${errorText}`);
    }

    const data = await response.json();

    return {
      status: data.status || "pending", // pending, paid, overdue, cancelled
      paid_at: data.paid_at || null,
      amount: data.amount || null,
      currency: data.currency || "EUR",
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("[Xolo] Errore verifica pagamento:", error);
    throw new HttpError(500, "Errore verifica pagamento Xolo", error.message);
  }
}

/**
 * Ottiene descrizione servizio per fattura
 * @param {string} orderType - Tipo ordine
 * @returns {string} Descrizione servizio
 */
export function getServiceDescription(orderType) {
  const descriptions = {
    access_pro:
      "Accesso Pro 30 giorni - Tradelia AI. Accesso completo alla dashboard con tutti i framework sbloccati, 1 analisi inclusa, PDF a €9. Materiale educativo, non consulenza finanziaria.",
    access_desk:
      "Accesso Desk 30 giorni - Tradelia AI. Accesso completo con white-label, 5 analisi incluse, PDF incluso, supporto prioritario. Materiale educativo, non consulenza finanziaria.",
    analysis_standalone:
      "Analisi personalizzata su richiesta - Tradelia AI. Analisi completa basata su framework AI proprietari (FDM, MLT, PAC). Tempo di lavoro: ~1 ora. Materiale educativo, non consulenza finanziaria.",
    analysis_extra_pro:
      "Analisi extra - Piano Pro - Tradelia AI. Analisi aggiuntiva per utenti con Accesso Pro attivo. Materiale educativo, non consulenza finanziaria.",
    analysis_extra_desk:
      "Analisi extra - Piano Desk - Tradelia AI. Analisi aggiuntiva per utenti con Accesso Desk attivo. Materiale educativo, non consulenza finanziaria.",
    pdf_download:
      "Download PDF report - Piano Pro - Tradelia AI. Download PDF di report completo. Materiale educativo, non consulenza finanziaria.",
  };

  return descriptions[orderType] || `Servizio Tradelia AI - ${orderType}`;
}

/**
 * Ottiene prezzo servizio
 * @param {string} orderType - Tipo ordine
 * @returns {number} Prezzo in euro
 */
export function getServicePrice(orderType) {
  const prices = {
    access_pro: 19,
    access_desk: 149,
    analysis_standalone: 49,
    analysis_extra_pro: 29,
    analysis_extra_desk: 39,
    pdf_download: 9,
  };

  return prices[orderType] || 0;
}
