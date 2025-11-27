// /api/health.js
// API Vercel - Health Check
// Consolidata con Supabase health check

import { healthCheck, verifySchema, verifyRPCFunctions, getEducationStats } from "./supabase-health.js";

async function handler(req, res) {
  const { action } = req.query;

  // Route to specific health check
  if (action === "supabase-health") {
    return await healthCheck(req, res);
  }
  if (action === "verify-schema") {
    return await verifySchema(req, res);
  }
  if (action === "verify-rpc") {
    return await verifyRPCFunctions(req, res);
  }
  if (action === "education-stats") {
    return await getEducationStats(req, res);
  }

  // Default health check
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const health = {
      ok: true,
      timestamp: new Date().toISOString(),
      service: "tradelia-api",
      version: "1.0.0",
      status: "healthy",
      checks: {
        supabase: checkSupabase(),
        environment: checkEnvironment(),
      },
    };

    const allHealthy = Object.values(health.checks).every((check) => check.status === "healthy");

    return res.status(allHealthy ? 200 : 503).json(health);
  } catch (error) {
    return res.status(503).json({
      ok: false,
      timestamp: new Date().toISOString(),
      status: "unhealthy",
      error: error.message,
    });
  }
}

function checkSupabase() {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    status: hasUrl && hasKey ? "healthy" : "unhealthy",
    message: hasUrl && hasKey ? "Supabase configured" : "Supabase not configured",
  };
}

function checkEnvironment() {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  return {
    status: missing.length === 0 ? "healthy" : "unhealthy",
    message:
      missing.length === 0 ? "All environment variables set" : `Missing: ${missing.join(", ")}`,
  };
}

export default handler;
