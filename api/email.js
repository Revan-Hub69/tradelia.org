// /api/email.js
// API Vercel - Invio Email (RINOMINATO)
// Ex: send-email.js → email.js

import { runtimeFetch as fetch } from "./_lib/fetch.js";
import { HttpError, handleRouteError } from "./_lib/http.js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_EMAIL = "amministrazione@tradelia.org";

if (!BREVO_API_KEY) {
  console.warn("[Email] BREVO_API_KEY non configurato - invio email disabilitato");
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
    const { action = "send", ...data } = req.body;

    if (action === "send") {
      return await handleSendEmail(req, res);
    }

    return res.status(400).json({ ok: false, error: "Azione non valida. Usa: send" });
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

