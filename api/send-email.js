// /api/send-email.js
// API Vercel - Invio email generico tramite Brevo
// Gestisce richieste da Exante.html, Skilling.html, app.js, trial-onboarding-modal.js

import fetch from "./_lib/fetch.js";
import { HttpError, handleRouteError } from "./_lib/http.js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_EMAIL = "amministrazione@tradelia.org";

if (!BREVO_API_KEY) {
  console.warn("[Send Email] BREVO_API_KEY non configurato - invio email disabilitato");
}

/**
 * Invia email tramite Brevo
 */
async function sendEmailViaBrevo({ to, subject, htmlContent, textContent, replyTo }) {
  if (!BREVO_API_KEY) {
    throw new HttpError(500, "Servizio email non configurato (BREVO_API_KEY mancante)");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: "noreply@tradelia.org", name: "Tradelia AI" },
      to: Array.isArray(to) ? to : [{ email: to }],
      subject,
      htmlContent,
      textContent,
      replyTo: replyTo ? { email: replyTo } : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Send Email] Errore Brevo:", errorText);
    throw new HttpError(502, "Errore invio email");
  }

  return response.json();
}

/**
 * Gestisce diversi tipi di email in base al campo 'type'
 */
function processEmailRequest(body) {
  const { type, ...data } = body;

  switch (type) {
    case "Richiesta Webinar Exante":
      return {
        to: [{ email: ADMIN_EMAIL }],
        subject: `Richiesta Webinar Exante - ${data.whatsapp || "N/A"}`,
        htmlContent: `
          <h2>Richiesta Webinar Exante</h2>
          <p><strong>WhatsApp:</strong> ${data.whatsapp || "N/A"}</p>
          <p><strong>Account Manager:</strong> ${data.accountManager || "Giuseppe Olivero"}</p>
          <p><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</p>
        `,
        textContent: `Richiesta Webinar Exante\n\nWhatsApp: ${data.whatsapp || "N/A"}\nAccount Manager: ${data.accountManager || "Giuseppe Olivero"}\nTimestamp: ${data.timestamp || new Date().toISOString()}`,
      };

    case "profile-update":
      return {
        to: [{ email: ADMIN_EMAIL }],
        subject: `Aggiornamento Profilo - ${data.email || "N/A"}`,
        htmlContent: `
          <h2>Aggiornamento Profilo Utente</h2>
          <p><strong>Email:</strong> ${data.email || "N/A"}</p>
          <p><strong>Modifiche:</strong></p>
          <pre>${JSON.stringify(data.changes || [], null, 2)}</pre>
        `,
        textContent: `Aggiornamento Profilo\n\nEmail: ${data.email || "N/A"}\nModifiche: ${JSON.stringify(data.changes || [])}`,
      };

    case "business-data":
      return {
        to: [{ email: ADMIN_EMAIL }],
        subject: `Dati Business Trial - ${data.email || "N/A"}`,
        htmlContent: `
          <h2>Dati Business da Trial Onboarding</h2>
          <p><strong>Email:</strong> ${data.email || "N/A"}</p>
          <p><strong>Dettagli:</strong></p>
          <pre>${JSON.stringify(data.details || {}, null, 2)}</pre>
        `,
        textContent: `Dati Business Trial\n\nEmail: ${data.email || "N/A"}\nDettagli: ${JSON.stringify(data.details || {})}`,
      };

    case "richiesta-servizio":
    default:
      // Form generico da Skilling.html o altri
      return {
        to: [{ email: ADMIN_EMAIL }],
        subject: data.subject || `Richiesta da ${data.nome || "Sito Web"}`,
        htmlContent: `
          <h2>${data.tipo || "Richiesta Generica"}</h2>
          ${data.nome ? `<p><strong>Nome:</strong> ${data.nome}</p>` : ""}
          ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ""}
          ${data.telefono ? `<p><strong>Telefono:</strong> ${data.telefono}</p>` : ""}
          ${data.messaggio ? `<p><strong>Messaggio:</strong><br/>${data.messaggio.replace(/\n/g, "<br/>")}</p>` : ""}
          ${data.whatsapp ? `<p><strong>WhatsApp:</strong> ${data.whatsapp}</p>` : ""}
          <p><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</p>
        `,
        textContent: `${data.tipo || "Richiesta Generica"}\n\n${data.nome ? `Nome: ${data.nome}\n` : ""}${data.email ? `Email: ${data.email}\n` : ""}${data.telefono ? `Telefono: ${data.telefono}\n` : ""}${data.messaggio ? `Messaggio: ${data.messaggio}\n` : ""}${data.whatsapp ? `WhatsApp: ${data.whatsapp}\n` : ""}Timestamp: ${data.timestamp || new Date().toISOString()}`,
      };
  }
}

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
    return await handleRequest(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleRequest(req, res) {
  if (!BREVO_API_KEY) {
    console.warn("[Send Email] BREVO_API_KEY non configurato - richiesta ignorata");
    // Ritorna successo per non rompere il frontend, ma logga l'errore
    return res.status(200).json({
      ok: true,
      message: "Richiesta ricevuta (email non configurata)",
    });
  }

  const body = req.body || {};

  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "Body richiesto" });
  }

  try {
    const emailConfig = processEmailRequest(body);
    await sendEmailViaBrevo(emailConfig);

    return res.status(200).json({
      ok: true,
      message: "Email inviata con successo",
    });
  } catch (error) {
    console.error("[Send Email] Errore:", error);

    if (error instanceof HttpError) {
      return res.status(error.status).json({
        ok: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      ok: false,
      error: "Errore interno invio email",
    });
  }
}
