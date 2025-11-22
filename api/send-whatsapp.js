// /api/send-whatsapp.js
// API Vercel - Invio WhatsApp tramite Twilio WhatsApp API
// Solo per utenti Pro/Desk

import { runtimeFetch as fetch } from "./_lib/fetch.js";
import { HttpError, handleRouteError } from "./_lib/http.js";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// Numero WhatsApp: usa sandbox (whatsapp:+14155238886) o numero business verificato
// Per sandbox: TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
// Per produzione: TWILIO_WHATSAPP_NUMBER=whatsapp:+393491234567 (il tuo numero Twilio)
const TWILIO_WHATSAPP_NUMBER =
  process.env.TWILIO_WHATSAPP_NUMBER ||
  (process.env.TWILIO_PHONE_NUMBER ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}` : null);

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.warn("[Send WhatsApp] Twilio non configurato - invio WhatsApp disabilitato");
}

/**
 * Invia WhatsApp tramite Twilio
 */
async function sendWhatsAppViaTwilio({ to, message }) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new HttpError(
      500,
      "Servizio WhatsApp non configurato (TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN mancante)"
    );
  }

  if (!TWILIO_WHATSAPP_NUMBER) {
    throw new HttpError(
      500,
      "Numero WhatsApp Twilio non configurato (TWILIO_WHATSAPP_NUMBER mancante). " +
        "Per sandbox usa: whatsapp:+14155238886 (o il numero sandbox dalla console Twilio)"
    );
  }

  // Verifica formato numero WhatsApp
  if (!TWILIO_WHATSAPP_NUMBER.startsWith("whatsapp:")) {
    throw new HttpError(
      500,
      "TWILIO_WHATSAPP_NUMBER deve iniziare con 'whatsapp:' (es: whatsapp:+14155238886)"
    );
  }

  // Valida formato numero (deve iniziare con +)
  if (!to.startsWith("+")) {
    throw new HttpError(
      400,
      "Bad Request",
      "Numero telefono deve essere in formato internazionale (es: +393491234567)"
    );
  }

  // Formato WhatsApp: whatsapp:+393491234567
  const whatsappTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

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
    console.error("[Send WhatsApp] Errore Twilio:", errorText);
    throw new HttpError(502, "Errore invio WhatsApp");
  }

  return response.json();
}

export default async function handler(req, res) {
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
    return await handleRequest(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleRequest(req, res) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn("[Send WhatsApp] Twilio non configurato - richiesta ignorata");
    return res.status(200).json({
      ok: true,
      message: "Richiesta ricevuta (WhatsApp non configurato)",
    });
  }

  const body = req.body || {};

  if (!body.to || !body.message) {
    return res.status(400).json({ ok: false, error: "to e message sono obbligatori" });
  }

  try {
    await sendWhatsAppViaTwilio({
      to: body.to,
      message: body.message,
    });

    return res.status(200).json({
      ok: true,
      message: "WhatsApp inviato con successo",
    });
  } catch (error) {
    console.error("[Send WhatsApp] Errore:", error);

    if (error instanceof HttpError) {
      return res.status(error.status).json({
        ok: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      error: "Errore interno invio WhatsApp",
    });
  }
}
