// /api/cancel-subscription.js
// API Vercel - Cancella subscription (Xolo/manuale)

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { runtimeFetch as fetch } from "./_lib/fetch.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Calcola hash SHA-256 del token
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Invia email notifica cancellazione a support@tradelia.org
 */
async function notifySupportCancellation(email, planRole, gateway, subscriptionId) {
  if (!BREVO_API_KEY) {
    return false;
  }

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: "noreply@tradelia.org", name: "Tradelia AI - Sistema Abbonamenti" },
        to: [{ email: "support@tradelia.org" }],
        subject: `⚠️ Richiesta cancellazione abbonamento - ${email}`,
        textContent: `
Richiesta di cancellazione abbonamento

Email: ${email}
Piano: ${planRole}
Gateway: ${gateway || "N/A"}
Subscription ID: ${subscriptionId || "N/A"}
Data richiesta: ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}

La cancellazione è stata processata automaticamente.
        `,
      }),
    });
    return true;
  } catch (err) {
    console.warn("[Cancel] Errore notifica support (non bloccante):", err);
    return false;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Token mancante",
      });
    }

    // 1. Valida token e recupera dati utente
    const tokenHash = hashToken(token.trim());
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("dashboard_access_tokens")
      .select("user_id, email, plan_role")
      .eq("token_hash", tokenHash)
      .eq("revoked", false)
      .single();

    if (tokenError || !tokenRecord) {
      return res.status(200).json({
        ok: false,
        error: "Token non valido",
      });
    }

    const userId = tokenRecord.user_id;
    const email = tokenRecord.email;
    const planRole = tokenRecord.plan_role;

    // 2. Cerca subscriber per gateway e subscription_id
    let subscriber = null;
    if (userId) {
      const { data: subData } = await supabase
        .from("subscribers")
        .select("id, subscription_id, gateway, status, current_period_end")
        .eq("auth_user_id", userId)
        .single();
      subscriber = subData;
    }

    const gateway = subscriber?.gateway || null;
    const subscriptionId = subscriber?.subscription_id || null;
    const currentPeriodEnd = subscriber?.current_period_end || null;

    // 3. Xolo/manuale: solo aggiornamento Supabase (nessuna integrazione gateway esterna)
    const finalPeriodEnd = currentPeriodEnd;

    // Xolo o manuale: solo aggiornamento Supabase
    console.log("[Cancel] Xolo/manuale: aggiornamento Supabase");

    // 4. Aggiorna subscribers status
    if (subscriber) {
      await supabase
        .from("subscribers")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriber.id);
    }

    // 5. Aggiorna user_roles (imposta valid_until a current_period_end se disponibile)
    if (userId) {
      const newValidUntil = finalPeriodEnd || new Date().toISOString();
      await supabase
        .from("user_roles")
        .update({ valid_until: newValidUntil })
        .eq("user_id", userId);
    }

    // 6. Notifica support@tradelia.org
    await notifySupportCancellation(email || "N/A", planRole, gateway, subscriptionId);

    // 7. Calcola giorni rimanenti per messaggio
    let daysLeft = 0;
    if (finalPeriodEnd) {
      const expiryDate = new Date(finalPeriodEnd);
      const now = new Date();
      const msDiff = expiryDate - now;
      daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
    }

    return res.status(200).json({
      ok: true,
      message: `La tua richiesta di cancellazione è stata registrata. L'accesso resta attivo fino al ${finalPeriodEnd ? new Date(finalPeriodEnd).toLocaleDateString("it-IT") : "termine del periodo corrente"}.`,
      daysLeft: daysLeft,
      validUntil: finalPeriodEnd,
    });
  } catch (err) {
    console.error("[Cancel] Errore:", err);
    return res.status(500).json({
      ok: false,
      error: "Errore server",
      details: err.message,
    });
  }
}
