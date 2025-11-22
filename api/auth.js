// /api/auth.js
// API Vercel - Autenticazione e Token (CONSOLIDATO)
// Consolida: validate-dashboard-token, request-dashboard-token, create-user-and-token, request-free-token

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";
import { runtimeFetch as fetch } from "./_lib/fetch.js";
import crypto from "crypto";

const supabase = getServiceSupabase();
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// ===== UTILITY FUNCTIONS =====
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ===== HANDLER PRINCIPALE =====
export default async function handler(req, res) {
  // CORS headers
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  } catch (headerError) {
    console.error("[Auth] Errore header CORS:", headerError);
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case "validate":
        return await handleValidate(req, res);
      case "token":
        return await handleRequestToken(req, res);
      case "create-user":
        return await handleCreateUser(req, res);
      case "free-token":
        return await handleFreeToken(req, res);
      default:
        return res.status(400).json({ ok: false, error: "Azione non valida. Usa: validate, token, create-user, free-token" });
    }
  } catch (error) {
    return handleRouteError(res, error);
  }
}

// ===== VALIDATE TOKEN =====
async function handleValidate(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token } = req.body;
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new HttpError(400, "Token mancante o non valido");
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const validUntil = context.tokenRecord.valid_until;

  const now = new Date();
  const expiryDate = new Date(validUntil);
  const msDiff = expiryDate - now;
  const daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));

  let canCancel = false;
  let subscriptionStatus = "inactive";

  if (context.userId) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, gateway, plan, renew_at, cancelled_at")
      .eq("user_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription) {
      subscriptionStatus = subscription.status || "active";
      canCancel = subscriptionStatus === "active";
    }
  }

  let reason = null;
  let isValid = true;
  
  if (daysLeft === 0 && expiryDate < now) {
    reason = "expired_token";
    isValid = false;
  } else if (context.tokenRecord.revoked) {
    reason = "revoked_token";
    isValid = false;
  }

  // Se il token non è valido, restituisci errore
  if (!isValid) {
    return sendJSON(res, 200, {
      ok: false,
      reason,
      error: reason === "expired_token" ? "Token scaduto" : "Token revocato",
    });
  }

  return sendJSON(res, 200, {
    ok: true,
    userId: context.userId,
    email: context.email || context.tokenRecord.email || null,
    planRole: context.planRole,
    status: subscriptionStatus,
    validUntil,
    daysLeft,
    canCancel,
    isAdmin: context.isAdmin,
    reason: null,
  });
}

// ===== REQUEST TOKEN (Dashboard) =====
async function handleRequestToken(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Email non valida" });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  // Verifica utente e piano attivo
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("auth_user_id, status, current_period_end")
    .eq("email", sanitizedEmail)
    .eq("status", "active")
    .single();

  let userId = subscriber?.auth_user_id || null;
  let validUntil = subscriber?.current_period_end || null;

  if (!userId) {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const user = authUsers?.users?.find((u) => u.email?.toLowerCase() === sanitizedEmail);
    userId = user?.id || null;

    if (userId) {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role, valid_until")
        .eq("user_id", userId)
        .single();

      if (userRole && userRole.valid_until) {
        const expiryDate = new Date(userRole.valid_until);
        if (expiryDate > new Date()) {
          validUntil = userRole.valid_until;
        } else {
          return res.status(200).json({
            ok: false,
            error: "Non risulta un piano attivo per questa email.",
          });
        }
      } else {
        return res.status(200).json({
          ok: false,
          error: "Non risulta un piano attivo per questa email.",
        });
      }
    } else {
      return res.status(200).json({
        ok: false,
        error: "Non risulta un piano attivo per questa email.",
      });
    }
  }

  // Determina plan_role
  let planRole = "trial";
  if (userId) {
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (userRole) {
      planRole = userRole.role;
    }
  }

  // Genera nuovo token
  const newToken = generateToken();
  const tokenHash = hashToken(newToken);

  // Revoca token vecchi
  if (userId) {
    await supabase
      .from("dashboard_access_tokens")
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("revoked", false);
  } else {
    await supabase
      .from("dashboard_access_tokens")
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq("email", sanitizedEmail)
      .eq("revoked", false);
  }

  // Crea nuovo token
  const tokenData = {
    user_id: userId,
    email: userId ? null : sanitizedEmail,
    token_hash: tokenHash,
    plan_role: planRole,
    valid_until: validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    source: "manual",
    metadata: { requested_at: new Date().toISOString() },
  };

  const { error: insertError } = await supabase.from("dashboard_access_tokens").insert(tokenData);

  if (insertError) {
    console.error("[Auth] Errore inserimento token:", insertError);
    return res.status(500).json({ ok: false, error: "Errore generazione token" });
  }

  // Invia email (se BREVO_API_KEY disponibile)
  if (BREVO_API_KEY) {
    await sendTokenEmail(sanitizedEmail, newToken, planRole);
  }

  return res.status(200).json({
    ok: true,
    message: "Se esiste un piano attivo su questa email, ti abbiamo inviato un nuovo codice.",
  });
}

// ===== CREATE USER =====
async function handleCreateUser(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, displayName, role, validUntil, credits = 0, sendEmail = true, isAdmin = false } = req.body;

  if (!email || !role || !validUntil) {
    return res.status(400).json({ ok: false, error: "Missing required fields: email, role, validUntil" });
  }

  if (!["trial", "pro", "institutional"].includes(role)) {
    return res.status(400).json({ ok: false, error: "Invalid role" });
  }

  const validUntilDate = new Date(validUntil);
  if (validUntilDate <= new Date()) {
    return res.status(400).json({ ok: false, error: "validUntil must be in the future" });
  }

  if (isAdmin) {
    const { data: adminCheck } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (!adminCheck) {
      return res.status(403).json({ ok: false, error: "Email non autorizzata per token admin" });
    }
    role = "institutional";
  }

  // Crea/aggiorna user_role
  const { error: roleError } = await supabase.from("user_roles").upsert(
    {
      email: email.toLowerCase(),
      role,
      valid_until: validUntilDate.toISOString(),
    },
    { onConflict: "email" }
  );

  if (roleError) {
    return res.status(500).json({ ok: false, error: "Error creating user role: " + roleError.message });
  }

  // Genera token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  // Revoca token vecchi
  await supabase
    .from("dashboard_access_tokens")
    .update({ revoked: true, revoked_at: new Date().toISOString() })
    .eq("email", email.toLowerCase())
    .eq("revoked", false);

  // Crea nuovo token
  const { error: tokenError } = await supabase.from("dashboard_access_tokens").insert({
    email: email.toLowerCase(),
    token_hash: tokenHash,
    plan_role: role,
    valid_from: new Date().toISOString(),
    valid_until: validUntilDate.toISOString(),
    source: "manual",
    metadata: {
      created_by: "admin_dashboard",
      display_name: displayName || null,
    },
  });

  if (tokenError) {
    return res.status(500).json({ ok: false, error: "Error creating access token: " + tokenError.message });
  }

  // Gestione crediti per institutional
  if (role === "institutional" && credits > 0) {
    // Implementazione crediti (simile a create-user-and-token.js)
  }

  // Invia email se richiesto
  if (sendEmail && BREVO_API_KEY) {
    // Implementazione invio email
  }

  return res.status(200).json({
    ok: true,
    token: sendEmail ? undefined : token,
    email,
    role,
    validUntil: validUntilDate.toISOString(),
  });
}

// ===== FREE TOKEN =====
async function handleFreeToken(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { nome, email, profilo, organizzazione, uso } = req.body || {};
  const ALLOWED_PROFILES = ["privato", "desk", "media"];
  const TOKEN_DURATION_DAYS = 30;

  if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
    return res.status(400).json({ ok: false, error: "Nome non valido" });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Email non valida" });
  }

  if (!profilo || !ALLOWED_PROFILES.includes(profilo)) {
    return res.status(400).json({ ok: false, error: "Profilo non valido" });
  }

  if (!uso || typeof uso !== "string" || uso.trim().length < 10) {
    return res.status(400).json({ ok: false, error: "Descrivi come userai il token (minimo 10 caratteri)" });
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const newToken = generateToken();
  const tokenHash = hashToken(newToken);
  const valid_until = new Date(Date.now() + TOKEN_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Revoca token trial precedenti
  await supabase
    .from("dashboard_access_tokens")
    .update({ revoked: true, revoked_at: new Date().toISOString() })
    .eq("email", sanitizedEmail)
    .eq("source", "trial")
    .eq("revoked", false);

  // Inserisci nuovo token
  const { error: insertError } = await supabase.from("dashboard_access_tokens").insert({
    email: sanitizedEmail,
    token_hash: tokenHash,
    plan_role: "trial",
    valid_until,
    source: "trial",
    metadata: {
      requester_name: nome.trim(),
      profile: profilo,
      organization: (organizzazione || "").trim() || null,
      usage: uso.trim().slice(0, 500),
    },
  });

  if (insertError) {
    return res.status(500).json({ ok: false, error: "Errore creazione token", details: insertError.message });
  }

  // Invia email
  if (BREVO_API_KEY) {
    try {
      await sendFreeTokenEmail({ email: sanitizedEmail, nome, token: newToken, profilo, uso, organizzazione });
    } catch {
      return res.status(500).json({
        ok: false,
        error: "Token creato ma errore invio email. Contatta support@tradelia.org",
      });
    }
  }

  return res.status(200).json({
    ok: true,
    message: "Token generato. Controlla la tua email.",
  });
}

// ===== EMAIL HELPERS =====
async function sendTokenEmail(email, token, _planRole) {
  if (!BREVO_API_KEY) return;

  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9fafb; }
    .token-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #2563eb; text-align: center; }
    .token { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔑 Il tuo codice di accesso Tradelia</h2>
    </div>
    <div class="content">
      <p>Ciao,</p>
      <p>Hai richiesto un nuovo codice di accesso per la dashboard Tradelia.</p>
      <div class="token-box">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Il tuo codice:</p>
        <div class="token">${token}</div>
      </div>
      <p>Usa questo codice nella pagina di accesso per entrare nella dashboard.</p>
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
      to: [{ email }],
      subject: "🔑 Il tuo codice di accesso Tradelia",
      htmlContent: emailHTML,
    }),
  });
}

async function sendFreeTokenEmail({ email, nome, token, profilo, uso, organizzazione }) {
  if (!BREVO_API_KEY) return;

  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0f172a; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 18px; border: 1px solid #e2e8f0; }
    .header { background: #2563eb; color: #fff; padding: 20px; border-radius: 14px; }
    .token-box { background: #fff; border-radius: 14px; border: 1px solid #bfdbfe; padding: 20px; text-align: center; margin: 24px 0; }
    .token { font-family: 'SF Mono', 'Courier New', monospace; font-size: 20px; letter-spacing: 2px; color: #1d4ed8; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Codice di accesso gratuito Tradelia</h2>
      <p style="margin: 8px 0 0 0;">Ciao ${nome || "utente"}, ecco il codice di accesso personale richiesto.</p>
    </div>
    <p>Il codice di accesso è valido 30 giorni e funziona sulla dashboard PWA installata.</p>
    <div class="token-box">
      <div style="margin-bottom: 10px; color: #94a3b8;">Codice di accesso personale</div>
      <div class="token">${token}</div>
    </div>
    <p><strong>Profilo dichiarato:</strong> ${profilo === "desk" ? "Desk / uffici studi" : profilo === "media" ? "Media / formazione / ricerca" : "Privato / persona fisica"}</p>
    ${organizzazione ? `<p><strong>Organizzazione:</strong> ${organizzazione}</p>` : ""}
    <p><strong>Uso previsto:</strong></p>
    <p style="background: #e2e8f0; padding: 12px 16px; border-radius: 12px; font-size: 14px;">${uso.replace(/\n/g, "<br/>")}</p>
    <p>Per motivi di sicurezza non condividere il codice di accesso e conserva questa email come riferimento.</p>
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
      to: [{ email }],
      subject: "Il tuo codice di accesso gratuito per la dashboard Tradelia",
      htmlContent: emailHTML,
    }),
  });
}

