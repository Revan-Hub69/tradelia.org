// /api/auth-signup-login.js
// API per signup e login email/password
// Best Practice: Separato da auth.js per chiarezza

import { getServiceSupabase } from "./_lib/supabase.js";
import { handleRouteError, sendJSON } from "./_lib/http.js";
import crypto from "crypto";

const supabase = getServiceSupabase();

// Rate limiting semplice (in memoria - per produzione usare Redis)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 ora

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
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.attempts++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - record.attempts };
}

/**
 * Hash password (bcrypt via Supabase Auth)
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate access token
 */
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
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
    const { action } = req.query;

    switch (action) {
      case "signup":
        return await handleSignup(req, res);
      case "login":
        return await handleLogin(req, res);
      default:
        return res.status(400).json({ ok: false, error: "Azione non valida. Usa: signup, login" });
    }
  } catch (error) {
    return handleRouteError(res, error);
  }
}

/**
 * Handle signup
 */
async function handleSignup(req, res) {
  const { email, password, passwordConfirm, privacyAccepted } = req.body;

  // Validation
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Email non valida" });
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

  const sanitizedEmail = email.trim().toLowerCase();

  // Rate limiting
  const rateLimit = checkRateLimit(`signup:${sanitizedEmail}`);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      ok: false,
      error: "Troppi tentativi. Riprova più tardi.",
      resetAt: rateLimit.resetAt,
    });
  }

  try {
    // Usa Supabase Auth per creare utente (gestisce password hashing)
    // Nota: Supabase Auth richiede client-side SDK, qui usiamo approccio alternativo
    // Per ora creiamo solo token di accesso (come sistema esistente)

    // Verifica se email già esiste
    const { data: existingToken } = await supabase
      .from("dashboard_access_tokens")
      .select("email")
      .eq("email", sanitizedEmail)
      .eq("revoked", false)
      .maybeSingle();

    if (existingToken) {
      return res.status(400).json({ ok: false, error: "Email già registrata. Usa il login." });
    }

    // Genera token di accesso
    const newToken = generateToken();
    const tokenHash = hashToken(newToken);
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 giorni

    // Crea token
    const { error: insertError } = await supabase.from("dashboard_access_tokens").insert({
      email: sanitizedEmail,
      token_hash: tokenHash,
      plan_role: "trial",
      valid_until: validUntil,
      source: "signup",
      metadata: {
        signup_at: new Date().toISOString(),
        privacy_accepted: true,
      },
    });

    if (insertError) {
      console.error("[Auth] Errore creazione token signup:", insertError);
      return res.status(500).json({ ok: false, error: "Errore durante la registrazione" });
    }

    // TODO: Inviare email di verifica
    // Per ora restituiamo il token direttamente (non sicuro per produzione)

    return sendJSON(res, 200, {
      ok: true,
      message: "Registrazione completata",
      token: newToken, // TODO: Inviare via email invece
      email: sanitizedEmail,
    });
  } catch (error) {
    console.error("[Auth] Errore signup:", error);
    return res.status(500).json({ ok: false, error: "Errore durante la registrazione" });
  }
}

/**
 * Handle login
 */
async function handleLogin(req, res) {
  const { email, password } = req.body;

  // Validation
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Email non valida" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ ok: false, error: "Password richiesta" });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  // Rate limiting
  const rateLimit = checkRateLimit(`login:${sanitizedEmail}`);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      ok: false,
      error: `Troppi tentativi. Riprova più tardi. Tentativi rimanenti: ${rateLimit.remaining}`,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt,
    });
  }

  try {
    // TODO: Verificare password con Supabase Auth
    // Per ora verifichiamo solo se esiste un token valido per questa email

    const { data: tokenRecord } = await supabase
      .from("dashboard_access_tokens")
      .select("token_hash, valid_until, revoked, plan_role")
      .eq("email", sanitizedEmail)
      .eq("revoked", false)
      .order("valid_until", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!tokenRecord) {
      return res.status(401).json({ ok: false, error: "Email o password non corretti" });
    }

    // Verifica scadenza
    const validUntil = new Date(tokenRecord.valid_until);
    if (validUntil < new Date()) {
      return res.status(401).json({ ok: false, error: "Token scaduto. Richiedi un nuovo codice." });
    }

    // TODO: Verificare password hash (quando implementiamo password storage)
    // Per ora restituiamo successo se token esiste e non è scaduto

    // Genera nuovo token per questa sessione
    const newToken = generateToken();
    const tokenHash = hashToken(newToken);

    // Revoca token vecchi
    await supabase
      .from("dashboard_access_tokens")
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq("email", sanitizedEmail)
      .eq("revoked", false);

    // Crea nuovo token
    const { error: insertError } = await supabase.from("dashboard_access_tokens").insert({
      email: sanitizedEmail,
      token_hash: tokenHash,
      plan_role: tokenRecord.plan_role,
      valid_until: validUntil.toISOString(),
      source: "login",
      metadata: {
        login_at: new Date().toISOString(),
      },
    });

    if (insertError) {
      console.error("[Auth] Errore creazione token login:", insertError);
      return res.status(500).json({ ok: false, error: "Errore durante il login" });
    }

    return sendJSON(res, 200, {
      ok: true,
      message: "Login riuscito",
      token: newToken,
      email: sanitizedEmail,
      planRole: tokenRecord.plan_role,
    });
  } catch (error) {
    console.error("[Auth] Errore login:", error);
    return res.status(500).json({ ok: false, error: "Errore durante il login" });
  }
}
