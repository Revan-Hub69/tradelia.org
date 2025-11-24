// /api/analysis.js
// API Vercel - Analisi On-Demand (RINOMINATO)
// Ex: request-analysis.js → analysis.js

import { runtimeFetch as fetch } from "./_lib/fetch.js";
import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError } from "./_lib/http.js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_EMAIL = "amministrazione@tradelia.org";
const SUPPORT_EMAIL = "support@tradelia.org";

const supabase = getServiceSupabase();

// NOTA: Funzione disabilitata per rispettare limite Vercel Hobby (12 funzioni)
// Consolidata in api/admin.js?action=analysis-*
// export default async function handler(req, res) {
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { action = "request" } = req.query;

    switch (action) {
      case "request":
        return await handleRequestAnalysis(req, res);
      case "status":
        return await handleGetStatus(req, res);
      default:
        return res
          .status(400)
          .json({ ok: false, error: "Azione non valida. Usa: request, status" });
    }
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleRequestAnalysis(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { token, ticker, timeframe, notes } = req.body;

  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token mancante");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!ticker || typeof ticker !== "string" || ticker.trim().length === 0) {
    return res.status(400).json({ ok: false, error: "Ticker richiesto" });
  }

  // Salva richiesta in Supabase
  const { data, error: insertError } = await supabase
    .from("analysis_requests")
    .insert({
      user_id: userId,
      email: context.email || null,
      ticker: ticker.trim().toUpperCase(),
      timeframe: timeframe || null,
      notes: notes || null,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("[Analysis] Errore salvataggio richiesta:", insertError);
    return res.status(500).json({ ok: false, error: "Errore salvataggio richiesta" });
  }

  // Invia email notifica admin
  if (BREVO_API_KEY) {
    try {
      await sendAdminNotificationEmail(data);
    } catch (emailError) {
      console.error("[Analysis] Errore invio email admin:", emailError);
      // Non bloccare se l'email fallisce
    }
  }

  return res.status(200).json({
    ok: true,
    requestId: data.id,
    message: "Richiesta analisi salvata con successo",
  });
}

async function handleGetStatus(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { requestId } = req.query;

  if (!requestId) {
    return res.status(400).json({ ok: false, error: "requestId richiesto" });
  }

  const { data, error } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (error || !data) {
    return res.status(404).json({ ok: false, error: "Richiesta non trovata" });
  }

  return res.status(200).json({ ok: true, request: data });
}

async function sendAdminNotificationEmail(requestData) {
  if (!BREVO_API_KEY) {
    return;
  }

  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
    .content { padding: 20px; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Nuova richiesta analisi</h2>
    </div>
    <div class="content">
      <p><strong>Ticker:</strong> ${requestData.ticker}</p>
      <p><strong>Email:</strong> ${requestData.email || "N/A"}</p>
      <p><strong>Timeframe:</strong> ${requestData.timeframe || "N/A"}</p>
      ${requestData.notes ? `<p><strong>Note:</strong> ${requestData.notes}</p>` : ""}
      <p><strong>ID Richiesta:</strong> ${requestData.id}</p>
    </div>
  </div>
</body>
</html>
  `;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: "noreply@tradelia.org", name: "Tradelia AI" },
      to: [{ email: ADMIN_EMAIL }],
      subject: `Nuova richiesta analisi - ${requestData.ticker}`,
      htmlContent: emailHTML,
    }),
  });
}
