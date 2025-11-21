// /api/send-sms.js
// API Vercel - Invio SMS tramite Twilio
// Solo per utenti Pro/Desk

import { runtimeFetch as fetch } from "./_lib/fetch.js";
import { HttpError, handleRouteError } from "./_lib/http.js";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.warn("[Send SMS] Twilio non configurato - invio SMS disabilitato");
}

/**
 * Invia SMS tramite Twilio
 */
async function sendSMSViaTwilio({ to, message }) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new HttpError(
      500,
      "Servizio SMS non configurato (TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN mancante)"
    );
  }

  if (!TWILIO_PHONE_NUMBER) {
    throw new HttpError(500, "Numero Twilio non configurato (TWILIO_PHONE_NUMBER mancante)");
  }

  // Valida formato numero (deve iniziare con +)
  if (!to.startsWith("+")) {
    throw new HttpError(
      400,
      "Bad Request",
      "Numero telefono deve essere in formato internazionale (es: +393491234567)"
    );
  }

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
        From: TWILIO_PHONE_NUMBER,
        To: to,
        Body: message,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Send SMS] Errore Twilio:", errorText);
    throw new HttpError(502, "Errore invio SMS");
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
    console.warn("[Send SMS] Twilio non configurato - richiesta ignorata");
    return res.status(200).json({
      ok: true,
      message: "Richiesta ricevuta (SMS non configurato)",
    });
  }

  const body = req.body || {};

  if (!body.to || !body.message) {
    return res.status(400).json({ ok: false, error: "to e message sono obbligatori" });
  }

  try {
    await sendSMSViaTwilio({
      to: body.to,
      message: body.message,
    });

    return res.status(200).json({
      ok: true,
      message: "SMS inviato con successo",
    });
  } catch (error) {
    console.error("[Send SMS] Errore:", error);

    if (error instanceof HttpError) {
      return res.status(error.status).json({
        ok: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      error: "Errore interno invio SMS",
    });
  }
}
