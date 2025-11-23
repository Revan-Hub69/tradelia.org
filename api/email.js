// /api/email.js
// API Vercel - Invio Email (RINOMINATO)
// Ex: send-email.js → email.js

import { runtimeFetch as fetch } from "./_lib/fetch.js";
import { handleRouteError } from "./_lib/http.js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.warn("[Email] BREVO_API_KEY non configurato - invio email disabilitato");
}

// NOTA: Funzione disabilitata per rispettare limite Vercel Hobby (12 funzioni)
// Consolidata in api/auth.js?action=email-*
// export default async function handler(req, res) {
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { action = "send" } = req.body;

    if (action === "send") {
      return await handleSendEmail(req, res);
    }
    if (action === "sms") {
      return await handleSendSMS(req, res);
    }
    if (action === "whatsapp") {
      return await handleSendWhatsApp(req, res);
    }

    return res.status(400).json({ ok: false, error: "Azione non valida. Usa: send, sms, whatsapp" });
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleSendEmail(req, res) {
  const { to, subject, htmlContent, textContent, replyTo, type, ...emailData } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ ok: false, error: "Destinatario e oggetto richiesti" });
  }

  if (!BREVO_API_KEY) {
    return res.status(500).json({ ok: false, error: "Servizio email non configurato" });
  }

  // Processa email in base al tipo se necessario
  const processedContent = processEmailContent(type, emailData, htmlContent, textContent);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: "noreply@tradelia.org", name: "Tradelia AI" },
      to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
      subject,
      htmlContent: processedContent.html,
      textContent: processedContent.text,
      replyTo: replyTo ? { email: replyTo } : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Email] Errore Brevo:", errorText);
    return res.status(502).json({ ok: false, error: "Errore invio email" });
  }

  return res.status(200).json({ ok: true, message: "Email inviata con successo" });
}

function processEmailContent(type, data, htmlContent, textContent) {
  // TODO: Processare contenuto email in base al tipo se necessario
  return {
    html: htmlContent || "",
    text: textContent || "",
  };
}

// ===== SEND SMS =====
async function handleSendSMS(req, res) {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return res.status(500).json({ ok: false, error: "Servizio SMS non configurato" });
  }

  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ ok: false, error: "to e message sono obbligatori" });
  }

  if (!to.startsWith("+")) {
    return res.status(400).json({ ok: false, error: "Numero telefono deve essere in formato internazionale" });
  }

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Email] Errore Twilio SMS:", errorText);
      return res.status(502).json({ ok: false, error: "Errore invio SMS" });
    }

    return res.status(200).json({ ok: true, message: "SMS inviato con successo" });
  } catch (error) {
    console.error("[Email] Errore SMS:", error);
    return res.status(500).json({ ok: false, error: "Errore interno invio SMS" });
  }
}

// ===== SEND WHATSAPP =====
async function handleSendWhatsApp(req, res) {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_WHATSAPP_NUMBER =
    process.env.TWILIO_WHATSAPP_NUMBER ||
    (process.env.TWILIO_PHONE_NUMBER ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}` : null);

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    return res.status(500).json({ ok: false, error: "Servizio WhatsApp non configurato" });
  }

  if (!TWILIO_WHATSAPP_NUMBER.startsWith("whatsapp:")) {
    return res.status(500).json({ ok: false, error: "TWILIO_WHATSAPP_NUMBER deve iniziare con 'whatsapp:'" });
  }

  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ ok: false, error: "to e message sono obbligatori" });
  }

  if (!to.startsWith("+")) {
    return res.status(400).json({ ok: false, error: "Numero telefono deve essere in formato internazionale" });
  }

  const whatsappTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_NUMBER,
          To: whatsappTo,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Email] Errore Twilio WhatsApp:", errorText);
      return res.status(502).json({ ok: false, error: "Errore invio WhatsApp" });
    }

    return res.status(200).json({ ok: true, message: "WhatsApp inviato con successo" });
  } catch (error) {
    console.error("[Email] Errore WhatsApp:", error);
    return res.status(500).json({ ok: false, error: "Errore interno invio WhatsApp" });
  }
}

