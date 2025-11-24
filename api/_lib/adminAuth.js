import crypto from "crypto";
import { getServiceSupabase } from "./supabase.js";
import { HttpError } from "./http.js";

const ADMIN_PLAN_ROLES = new Set(["admin", "internal", "staff", "team", "founder"]);

export const extractAdminToken = (req) => {
  const headerToken = req.headers?.["x-admin-token"] || req.headers?.["X-Admin-Token"];
  if (headerToken?.trim()) {
    return headerToken.trim();
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  if (req.body?.token) {
    return req.body.token;
  }
  if (req.query?.token) {
    return req.query.token;
  }

  return null;
};

export const getAdminContextFromToken = async (token, { enforceAdmin = true } = {}) => {
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Token amministratore mancante");
  }

  const supabase = getServiceSupabase();
  const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

  const { data: tokenRecord, error } = await supabase
    .from("dashboard_access_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .eq("revoked", false)
    .gte("valid_until", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw new HttpError(500, "Errore durante la verifica del token", error.message);
  }

  if (!tokenRecord) {
    throw new HttpError(401, "Token non valido o scaduto");
  }

  const normalizedEmail = (tokenRecord.email || "").trim().toLowerCase();
  const normalizedRole = (tokenRecord.plan_role || "").trim().toLowerCase();
  let isAdmin = ADMIN_PLAN_ROLES.has(normalizedRole);

  if (!isAdmin && normalizedEmail) {
    const { data: adminEmail, error: adminEmailError } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (adminEmailError) {
      throw new HttpError(500, "Errore verifica admin_emails", adminEmailError.message);
    }

    if (adminEmail) {
      isAdmin = true;
    }
  }

  if (!isAdmin && tokenRecord.user_id) {
    const { data: adminUser, error: adminUserError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", tokenRecord.user_id)
      .maybeSingle();

    if (adminUserError) {
      throw new HttpError(500, "Errore verifica admin_users", adminUserError.message);
    }

    if (adminUser) {
      isAdmin = true;
    }
  }

  if (enforceAdmin && !isAdmin) {
    throw new HttpError(403, "Permessi amministratore mancanti");
  }

  supabase
    .from("dashboard_access_tokens")
    .update({
      last_used_at: new Date().toISOString(),
      usage_count: (tokenRecord.usage_count || 0) + 1,
    })
    .eq("id", tokenRecord.id)
    .then()
    .catch((err) => {
      console.warn("[AdminAuth] Unable to update token usage", err);
    });

  return {
    token,
    tokenHash,
    tokenRecord,
    email: normalizedEmail,
    userId: tokenRecord.user_id || null,
    planRole: tokenRecord.plan_role,
    isAdmin,
  };
};

export const requireAdmin = async (req, options = {}) => {
  const token = extractAdminToken(req);
  return getAdminContextFromToken(token, { enforceAdmin: true, ...options });
};
