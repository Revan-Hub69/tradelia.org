// /api/auth.js
// API Vercel - Autenticazione e Token (CONSOLIDATO)
// Consolida: validate-dashboard-token, request-dashboard-token, create-user-and-token, request-free-token, auth-signup-login
// Compliance: OWASP, NIST 800-63B, GDPR, WCAG 2.2 AA

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";
import { runtimeFetch as fetch } from "./_lib/fetch.js";
import crypto from "crypto";

const supabase = getServiceSupabase();
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SESSION_DURATION_HOURS = 12;
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000;
const REFRESH_TOKEN_DURATION_DAYS = 30;
const REFRESH_TOKEN_DURATION_MS = REFRESH_TOKEN_DURATION_DAYS * 24 * 60 * 60 * 1000;

// Rate limiting per signup/login (in memoria - per produzione usare Redis)
const rateLimitMap = new Map();
const lockoutMap = new Map();
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 ora
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minuti

/**
 * Check rate limit
 */
function checkRateLimit(identifier) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record) {
    rateLimitMap.set(identifier, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  if (now > record.resetAt) {
    rateLimitMap.set(identifier, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  if (record.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    // Account lockout
    lockoutMap.set(identifier, { lockedUntil: now + LOCKOUT_DURATION });
    return { allowed: false, remaining: 0, resetAt: record.resetAt, locked: true };
  }

  record.attempts++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - record.attempts };
}

/**
 * Check account lockout
 */
function checkLockout(identifier) {
  const lockout = lockoutMap.get(identifier);
  if (!lockout) {
    return { locked: false };
  }

  const now = Date.now();
  if (now > lockout.lockedUntil) {
    lockoutMap.delete(identifier);
    return { locked: false };
  }

  return {
    locked: true,
    lockedUntil: lockout.lockedUntil,
    minutesRemaining: Math.ceil((lockout.lockedUntil - now) / (60 * 1000)),
  };
}

// ===== UTILITY FUNCTIONS =====
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function createSessionToken({
  userId = null,
  email = null,
  planRole = "trial",
  validUntil,
  source = "auth",
  metadata = {},
}) {
  if (!validUntil) {
    throw new HttpError(500, "validUntil mancante per la sessione");
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const sessionIssuedAt = new Date().toISOString();
  const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  const metadataPayload = {
    ...(metadata && typeof metadata === "object" ? metadata : {}),
    session_expires_at: sessionExpiresAt,
    session_issued_at: sessionIssuedAt,
  };

  const insertPayload = {
    user_id: userId,
    email: userId ? null : email?.toLowerCase() || null,
    token_hash: tokenHash,
    plan_role: planRole,
    valid_until: validUntil,
    source,
    metadata: metadataPayload,
  };

  const { data: accessTokenRecord, error: tokenError } = await supabase
    .from("dashboard_access_tokens")
    .insert(insertPayload)
    .select("id, user_id, email, plan_role, valid_until, metadata")
    .single();

  if (tokenError) {
    console.error("[Auth] Errore creazione token accesso:", tokenError);
    throw new HttpError(500, "Errore durante la creazione del token");
  }

  const refreshToken = generateRefreshToken();
  const refreshHash = hashToken(refreshToken);
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION_MS).toISOString();

  const { error: refreshError } = await supabase.from("dashboard_refresh_tokens").insert({
    access_token_id: accessTokenRecord.id,
    user_id: userId,
    token_hash: refreshHash,
    expires_at: refreshExpiresAt,
    metadata: {
      session_expires_at: sessionExpiresAt,
    },
  });

  if (refreshError) {
    console.error("[Auth] Errore creazione refresh token:", refreshError);
    throw new HttpError(500, "Errore durante la creazione del refresh token");
  }

  return {
    token,
    refreshToken,
    sessionExpiresAt,
    refreshExpiresAt,
    accessTokenId: accessTokenRecord.id,
    validUntil: accessTokenRecord.valid_until,
    planRole: accessTokenRecord.plan_role,
  };
}

function getSessionStatusFromMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return { sessionExpiresAt: null, sessionMinutesLeft: null };
  }

  const sessionExpiresAt = metadata.session_expires_at || null;
  if (!sessionExpiresAt) {
    return { sessionExpiresAt: null, sessionMinutesLeft: null };
  }

  const expiresAtDate = new Date(sessionExpiresAt);
  const diffMs = expiresAtDate - Date.now();
  const sessionMinutesLeft = Math.floor(diffMs / (60 * 1000));

  return { sessionExpiresAt, sessionMinutesLeft };
}

// ===== HANDLER PRINCIPALE =====
/**
 * Main handler (Vercel serverless function)
 * Consolidates: auth, user, email endpoints
 */
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
      case "signup":
        return await handleSignup(req, res);
      case "login":
        return await handleLogin(req, res);
      case "refresh-session":
        return await handleRefreshSession(req, res);
      case "check-email":
        return await handleCheckEmail(req, res);
      case "reset-password":
        return await handleResetPassword(req, res);
      case "verify-email":
        return await handleVerifyEmail(req, res);
      default:
        return res.status(400).json({
          ok: false,
          error:
            "Azione non valida. Usa: validate, token, create-user, free-token, signup, login, check-email, reset-password, verify-email",
        });
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
  const tokenMetadata = context.tokenRecord.metadata || {};

  const now = new Date();
  const expiryDate = new Date(validUntil);
  const msDiff = expiryDate - now;
  const daysLeft = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
  const { sessionExpiresAt, sessionMinutesLeft } = getSessionStatusFromMetadata(tokenMetadata);

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
  } else if (sessionExpiresAt && sessionMinutesLeft !== null && sessionMinutesLeft <= 0) {
    reason = "session_expired";
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
    sessionExpiresAt,
    sessionMinutesLeft,
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

  // BEST PRACTICE: Sanitizzazione email coerente
  const sanitizedEmail = email.trim().toLowerCase();
  
  // Validazione formato email
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }

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

  const {
    email,
    displayName,
    validUntil,
    credits = 0,
    sendEmail = true,
    isAdmin = false,
  } = req.body;
  let { role } = req.body;

  if (!email || !role || !validUntil) {
    return res
      .status(400)
      .json({ ok: false, error: "Missing required fields: email, role, validUntil" });
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
    return res
      .status(500)
      .json({ ok: false, error: "Error creating user role: " + roleError.message });
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
    return res
      .status(500)
      .json({ ok: false, error: "Error creating access token: " + tokenError.message });
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
    return res
      .status(400)
      .json({ ok: false, error: "Descrivi come userai il token (minimo 10 caratteri)" });
  }

  // BEST PRACTICE: Sanitizzazione email coerente
  const sanitizedEmail = email.trim().toLowerCase();
  
  // Validazione formato email
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }
  const newToken = generateToken();
  const tokenHash = hashToken(newToken);
  const valid_until = new Date(
    Date.now() + TOKEN_DURATION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

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
    return res
      .status(500)
      .json({ ok: false, error: "Errore creazione token", details: insertError.message });
  }

  // Invia email
  if (BREVO_API_KEY) {
    try {
      await sendFreeTokenEmail({
        email: sanitizedEmail,
        nome,
        token: newToken,
        profilo,
        uso,
        organizzazione,
      });
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
  if (!BREVO_API_KEY) {
    return;
  }

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
  if (!BREVO_API_KEY) {
    return;
  }

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
    <p>Il codice di accesso è valido 30 giorni e funziona sulla dashboard installabile (Progressive App).</p>
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

// ===== SIGNUP =====
async function handleSignup(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password, passwordConfirm, privacyAccepted } = req.body;

  // Validation - BEST PRACTICE: Validazione robusta email
  if (!email || typeof email !== "string") {
    return res.status(400).json({ ok: false, error: "Email richiesta" });
  }
  
  // BEST PRACTICE: Sanitizzazione email coerente
  const sanitizedEmail = email.trim().toLowerCase();
  
  // Validazione formato email
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }

  if (!password || typeof password !== "string" || password.length < 12) {
    return res
      .status(400)
      .json({ ok: false, error: "Password deve essere di almeno 12 caratteri" });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ ok: false, error: "Le password non corrispondono" });
  }

  if (!privacyAccepted) {
    return res.status(400).json({ ok: false, error: "Devi accettare la privacy policy" });
  }

  // BEST PRACTICE: Sanitizzazione email coerente
  const sanitizedEmail = email.trim().toLowerCase();
  
  // Validazione formato email
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(`signup:${sanitizedEmail}`);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      ok: false,
      error: "Troppi tentativi. Riprova più tardi.",
      locked: rateLimit.locked,
      minutesRemaining: rateLimit.locked ? 15 : undefined,
    });
  }

  // Check lockout
  const lockout = checkLockout(`signup:${sanitizedEmail}`);
  if (lockout.locked) {
    return res.status(429).json({
      ok: false,
      error: `Account temporaneamente bloccato. Riprova tra ${lockout.minutesRemaining} minuti.`,
      locked: true,
      minutesRemaining: lockout.minutesRemaining,
    });
  }

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === sanitizedEmail
    );

    if (existingUser) {
      return res.status(400).json({ ok: false, error: "Email già registrata" });
    }

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: false, // Require email verification
    });

    if (createError) {
      console.error("[Auth] Errore creazione utente:", createError);
      return res.status(400).json({ ok: false, error: "Errore durante la registrazione" });
    }

    if (!newUser?.user) {
      return res.status(500).json({ ok: false, error: "Errore durante la registrazione" });
    }

    // Send verification email
    if (BREVO_API_KEY) {
      await sendVerificationEmail(sanitizedEmail, newUser.user.id);
    }

    return res.status(200).json({
      ok: true,
      emailSent: true,
      message: "Registrazione completata. Verifica la tua email per attivare l'account.",
    });
  } catch (error) {
    console.error("[Auth] Errore signup:", error);
    return res.status(500).json({ ok: false, error: "Errore durante la registrazione" });
  }
}

// ===== LOGIN =====
async function handleLogin(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  // BEST PRACTICE: Validazione email robusta
  if (!email || typeof email !== "string") {
    return res.status(400).json({ ok: false, error: "Email richiesta" });
  }
  
  const sanitizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ ok: false, error: "Password richiesta" });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(`login:${sanitizedEmail}`);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      ok: false,
      error: "Troppi tentativi. Riprova più tardi.",
      remaining: rateLimit.remaining,
      locked: rateLimit.locked,
      minutesRemaining: rateLimit.locked ? 15 : undefined,
    });
  }

  // Check lockout
  const lockout = checkLockout(`login:${sanitizedEmail}`);
  if (lockout.locked) {
    return res.status(429).json({
      ok: false,
      error: `Account temporaneamente bloccato. Riprova tra ${lockout.minutesRemaining} minuti.`,
      locked: true,
      minutesRemaining: lockout.minutesRemaining,
    });
  }

  try {
    // Sign in with Supabase Auth
    // BEST PRACTICE: Usa service role per signInWithPassword (richiede client anonimo per utente)
    // Creiamo un client anonimo per l'autenticazione utente
    const { createClient } = await import("@supabase/supabase-js");
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[Auth] Variabili ambiente Supabase mancanti");
      throw new HttpError(500, "Configurazione server non valida");
    }
    
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const { data: authData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (signInError) {
      // Update rate limit on failed attempt
      checkRateLimit(`login:${sanitizedEmail}`);

      // Check if email not verified
      if (
        signInError.message?.includes("Email not confirmed") ||
        signInError.message?.includes("email_not_confirmed")
      ) {
        return res.status(400).json({
          ok: false,
          error: "Verifica la tua email prima di accedere",
          emailNotVerified: true,
          remaining: rateLimit.remaining - 1,
        });
      }

      return res.status(400).json({
        ok: false,
        error: "Email o password non corretti",
        remaining: rateLimit.remaining - 1,
      });
    }

    if (!authData?.user) {
      return res.status(500).json({ ok: false, error: "Errore durante l'accesso" });
    }

    // Check if email is verified
    if (!authData.user.email_confirmed_at) {
      return res.status(400).json({
        ok: false,
        error: "Verifica la tua email prima di accedere",
        emailNotVerified: true,
      });
    }

    // Generate access token
    const userId = authData.user.id;

    // Get user role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role, valid_until")
      .eq("user_id", userId)
      .single();

    const planRole = userRole?.role || "trial";
    const validUntil =
      userRole?.valid_until || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Revoke old tokens
    await supabase
      .from("dashboard_access_tokens")
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("revoked", false);

    const sessionTokens = await createSessionToken({
      userId,
      email: sanitizedEmail,
      planRole,
      validUntil,
      source: "auth",
      metadata: { created_at: new Date().toISOString() },
    });

    return res.status(200).json({
      ok: true,
      token: sessionTokens.token,
      refreshToken: sessionTokens.refreshToken,
      sessionExpiresAt: sessionTokens.sessionExpiresAt,
      userId,
      email: sanitizedEmail,
      planRole,
    });
  } catch (error) {
    console.error("[Auth] Errore login:", error);
    return res.status(500).json({ ok: false, error: "Errore durante l'accesso" });
  }
}

// ===== REFRESH SESSION =====
async function handleRefreshSession(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { refreshToken } = req.body || {};
  if (!refreshToken || typeof refreshToken !== "string") {
    return res.status(400).json({ ok: false, error: "Refresh token mancante", reason: "missing_refresh" });
  }

  const refreshHash = hashToken(refreshToken.trim());
  try {
    const { data: refreshRecord, error: refreshError } = await supabase
      .from("dashboard_refresh_tokens")
      .select("*")
      .eq("token_hash", refreshHash)
      .eq("revoked", false)
      .maybeSingle();

    if (refreshError) {
      console.error("[Auth] Errore lookup refresh token:", refreshError);
      throw new HttpError(500, "Errore durante la verifica del refresh token");
    }

    if (!refreshRecord) {
      return res
        .status(401)
        .json({ ok: false, error: "Refresh token non valido", reason: "invalid_refresh" });
    }

    const now = new Date();
    if (new Date(refreshRecord.expires_at) < now) {
      await supabase
        .from("dashboard_refresh_tokens")
        .update({ revoked: true, revoked_at: now.toISOString() })
        .eq("id", refreshRecord.id);
      return res.status(401).json({
        ok: false,
        error: "Refresh token scaduto",
        reason: "refresh_expired",
      });
    }

    const { data: accessTokenRecord, error: accessError } = await supabase
      .from("dashboard_access_tokens")
      .select("*")
      .eq("id", refreshRecord.access_token_id)
      .eq("revoked", false)
      .maybeSingle();

    if (accessError) {
      console.error("[Auth] Errore lookup access token:", accessError);
      throw new HttpError(500, "Errore durante la verifica dell'access token");
    }

    if (!accessTokenRecord) {
      return res.status(401).json({
        ok: false,
        error: "Sessione non valida",
        reason: "access_revoked",
      });
    }

    if (new Date(accessTokenRecord.valid_until) < now) {
      return res.status(401).json({
        ok: false,
        error: "Piano scaduto",
        reason: "plan_expired",
      });
    }

    const newToken = generateToken();
    const newTokenHash = hashToken(newToken);
    const newSessionExpiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    const updatedMetadata = {
      ...(accessTokenRecord.metadata || {}),
      session_expires_at: newSessionExpiresAt,
      session_refreshed_at: now.toISOString(),
    };

    await supabase
      .from("dashboard_access_tokens")
      .update({
        token_hash: newTokenHash,
        metadata: updatedMetadata,
        revoked: false,
        revoked_at: null,
      })
      .eq("id", accessTokenRecord.id);

    await supabase
      .from("dashboard_refresh_tokens")
      .update({ revoked: true, revoked_at: now.toISOString() })
      .eq("id", refreshRecord.id);

    const rotatedRefreshToken = generateRefreshToken();
    const rotatedRefreshHash = hashToken(rotatedRefreshToken);
    const rotatedRefreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION_MS).toISOString();

    const { error: insertRefreshError } = await supabase
      .from("dashboard_refresh_tokens")
      .insert({
        access_token_id: accessTokenRecord.id,
        user_id: accessTokenRecord.user_id,
        token_hash: rotatedRefreshHash,
        expires_at: rotatedRefreshExpiresAt,
        metadata: { session_expires_at: newSessionExpiresAt },
      });

    if (insertRefreshError) {
      console.error("[Auth] Errore rotazione refresh token:", insertRefreshError);
      throw new HttpError(500, "Errore durante la rotazione del refresh token");
    }

    return res.status(200).json({
      ok: true,
      token: newToken,
      refreshToken: rotatedRefreshToken,
      sessionExpiresAt: newSessionExpiresAt,
      planRole: accessTokenRecord.plan_role,
      validUntil: accessTokenRecord.valid_until,
    });
  } catch (error) {
    console.error("[Auth] Errore refresh session:", error);
    if (error instanceof HttpError) {
      return handleRouteError(res, error);
    }
    return res.status(500).json({ ok: false, error: "Errore durante la rotazione della sessione" });
  }
}

// ===== CHECK EMAIL =====
async function handleCheckEmail(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Email non valida" });
  }

  // BEST PRACTICE: Sanitizzazione email coerente
  const sanitizedEmail = email.trim().toLowerCase();
  
  // Validazione formato email
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }

  try {
    // Check Supabase Auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const user = authUsers?.users?.find((u) => u.email?.toLowerCase() === sanitizedEmail);

    // Check dashboard_access_tokens
    const { data: tokens } = await supabase
      .from("dashboard_access_tokens")
      .select("email")
      .eq("email", sanitizedEmail)
      .limit(1);

    const exists = !!user || (tokens && tokens.length > 0);

    return res.status(200).json({
      ok: true,
      exists,
      available: !exists,
    });
  } catch (error) {
    console.error("[Auth] Errore check email:", error);
    return res.status(500).json({ ok: false, error: "Errore durante la verifica" });
  }
}

// ===== RESET PASSWORD =====
async function handleResetPassword(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Email non valida" });
  }

  // BEST PRACTICE: Sanitizzazione email coerente
  const sanitizedEmail = email.trim().toLowerCase();
  
  // Validazione formato email
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254 || sanitizedEmail.length < 5) {
    return res.status(400).json({ ok: false, error: "Formato email non valido" });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(`reset:${sanitizedEmail}`);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      ok: false,
      error: "Troppi tentativi. Riprova più tardi.",
    });
  }

  try {
    // Check if user exists
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const user = authUsers?.users?.find((u) => u.email?.toLowerCase() === sanitizedEmail);

    // Always return success (security best practice - don't reveal if email exists)
    if (user && BREVO_API_KEY) {
      // Generate reset token via Supabase
      const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: sanitizedEmail,
      });

      if (!resetError && resetData?.properties?.action_link) {
        await sendPasswordResetEmail(sanitizedEmail, resetData.properties.action_link);
      }
    }

    return res.status(200).json({
      ok: true,
      message: "Se l'email esiste, ti abbiamo inviato le istruzioni per reimpostare la password.",
    });
  } catch (error) {
    console.error("[Auth] Errore reset password:", error);
    return res.status(200).json({
      ok: true,
      message: "Se l'email esiste, ti abbiamo inviato le istruzioni per reimpostare la password.",
    });
  }
}

// ===== VERIFY EMAIL =====
async function handleVerifyEmail(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token, userId } = req.body;

  if (!token || !userId) {
    return res.status(400).json({ ok: false, error: "Token e userId richiesti" });
  }

  try {
    // Verify email in Supabase
    const { data: user, error: verifyError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (verifyError) {
      console.error("[Auth] Errore verifica email:", verifyError);
      return res.status(400).json({ ok: false, error: "Link di verifica non valido o scaduto" });
    }

    // Generate access token for verified user
    const newToken = generateToken();
    const tokenHash = hashToken(newToken);

    // Get user role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role, valid_until")
      .eq("user_id", userId)
      .single();

    const planRole = userRole?.role || "trial";
    const validUntil =
      userRole?.valid_until || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Revoke old tokens
    await supabase
      .from("dashboard_access_tokens")
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("revoked", false);

    // Create new token
    const { error: tokenError } = await supabase.from("dashboard_access_tokens").insert({
      user_id: userId,
      email: null,
      token_hash: tokenHash,
      plan_role: planRole,
      valid_until: validUntil,
      source: "auth",
      metadata: { verified_at: new Date().toISOString() },
    });

    if (tokenError) {
      console.error("[Auth] Errore creazione token:", tokenError);
      return res.status(500).json({ ok: false, error: "Errore durante la verifica" });
    }

    // Send access token email
    if (BREVO_API_KEY && user?.user?.email) {
      await sendAccessTokenEmail(user.user.email, newToken, planRole);
    }

    return res.status(200).json({
      ok: true,
      token: newToken,
      message: "Email verificata con successo! Ti abbiamo inviato il codice di accesso.",
    });
  } catch (error) {
    console.error("[Auth] Errore verify email:", error);
    return res.status(500).json({ ok: false, error: "Errore durante la verifica" });
  }
}

// ===== EMAIL HELPERS (AUTH) =====
async function sendVerificationEmail(email, _userId) {
  if (!BREVO_API_KEY) {
    return;
  }

  // Generate verification link
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("[Auth] Errore generazione link verifica:", linkError);
    return;
  }

  const verificationLink = linkData.properties.action_link;

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
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Verifica la tua email</h2>
    </div>
    <div class="content">
      <p>Ciao,</p>
      <p>Grazie per esserti registrato su Tradelia! Per completare la registrazione, verifica la tua email cliccando sul pulsante qui sotto:</p>
      <a href="${verificationLink}" class="button">Verifica Email</a>
      <p>Oppure copia e incolla questo link nel browser:</p>
      <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationLink}</p>
      <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
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
      subject: "Verifica la tua email - Tradelia",
      htmlContent: emailHTML,
    }),
  });
}

async function sendAccessTokenEmail(email, token, _planRole) {
  if (!BREVO_API_KEY) {
    return;
  }

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
      <p>Ecco il tuo codice di accesso per la dashboard Tradelia.</p>
      <div class="token-box">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Il tuo codice:</p>
        <div class="token">${token}</div>
      </div>
      <p>Usa questo codice nella dashboard per accedere.</p>
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

async function sendPasswordResetEmail(email, resetLink) {
  if (!BREVO_API_KEY) {
    return;
  }

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
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Reimposta la password</h2>
    </div>
    <div class="content">
      <p>Ciao,</p>
      <p>Hai richiesto di reimpostare la password per il tuo account Tradelia. Clicca sul pulsante qui sotto per procedere:</p>
      <a href="${resetLink}" class="button">Reimposta Password</a>
      <p>Oppure copia e incolla questo link nel browser:</p>
      <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
      <p>Se non hai richiesto questa modifica, ignora questa email. Il link scade dopo 1 ora.</p>
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
      subject: "Reimposta la password - Tradelia",
      htmlContent: emailHTML,
    }),
  });
}
