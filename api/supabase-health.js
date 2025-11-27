/**
 * Supabase Health Check & Verification Server
 * Mini server per verificare connessione e stato Supabase
 * Best Practice: Centralizzato, riutilizzabile, con logging
 */

import { getServiceSupabase } from "./_lib/supabase.js";
import { safeLog } from "./_lib/error-logger.js";

const supabase = getServiceSupabase();

/**
 * Health check endpoint - verifica connessione base
 */
export async function healthCheck(req, res) {
  try {
    // Test connessione base
    const { data, error } = await supabase.from("education_modules").select("id").limit(1);

    if (error) {
      return res.status(503).json({
        success: false,
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    safeLog("error", "[Supabase Health] Errore health check:", error);
    res.status(503).json({
      success: false,
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Schema verification - verifica tabelle e colonne critiche
 */
export async function verifySchema(req, res) {
  try {
    const checks = {
      education_modules: false,
      education_lessons: false,
      education_user_stats: false,
      education_user_progress: false,
      education_badges: false,
      user_roles: false,
    };

    // Check education_modules
    try {
      const { error } = await supabase.from("education_modules").select("id").limit(1);
      checks.education_modules = !error;
    } catch (e) {
      safeLog("warn", "[Schema Verify] education_modules:", e.message);
    }

    // Check education_lessons
    try {
      const { error } = await supabase.from("education_lessons").select("id").limit(1);
      checks.education_lessons = !error;
    } catch (e) {
      safeLog("warn", "[Schema Verify] education_lessons:", e.message);
    }

    // Check education_user_stats
    try {
      const { error } = await supabase.from("education_user_stats").select("id").limit(1);
      checks.education_user_stats = !error;
    } catch (e) {
      safeLog("warn", "[Schema Verify] education_user_stats:", e.message);
    }

    // Check education_user_progress
    try {
      const { error } = await supabase.from("education_user_progress").select("id").limit(1);
      checks.education_user_progress = !error;
    } catch (e) {
      safeLog("warn", "[Schema Verify] education_user_progress:", e.message);
    }

    // Check education_badges
    try {
      const { error } = await supabase.from("education_badges").select("id").limit(1);
      checks.education_badges = !error;
    } catch (e) {
      safeLog("warn", "[Schema Verify] education_badges:", e.message);
    }

    // Check user_roles
    try {
      const { error } = await supabase.from("user_roles").select("id").limit(1);
      checks.user_roles = !error;
    } catch (e) {
      safeLog("warn", "[Schema Verify] user_roles:", e.message);
    }

    const allHealthy = Object.values(checks).every((v) => v === true);

    res.json({
      success: allHealthy,
      status: allHealthy ? "complete" : "partial",
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    safeLog("error", "[Schema Verify] Errore:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * RPC functions verification - verifica funzioni database critiche
 */
export async function verifyRPCFunctions(req, res) {
  try {
    const functions = {
      add_education_xp: false,
      check_and_unlock_badge: false,
      update_learning_streak: false,
    };

    // Test add_education_xp (non esegue, solo verifica esistenza)
    // Nota: non possiamo testare senza user_id valido, quindi verifichiamo solo che la chiamata non dia errore di "function not found"
    try {
      // Chiamata con parametri invalidi per testare solo esistenza funzione
      const { error } = await supabase.rpc("add_education_xp", {
        p_user_id: "00000000-0000-0000-0000-000000000000",
        p_xp_amount: 0,
        p_source_type: "test",
        p_source_id: null,
        p_description: "test",
      });
      // Se l'errore è "function not found" o simile, la funzione non esiste
      // Altrimenti è un errore di validazione (normale)
      functions.add_education_xp = !error || !error.message.includes("does not exist");
    } catch (e) {
      functions.add_education_xp = !e.message?.includes("does not exist");
    }

    // Test check_and_unlock_badge
    try {
      const { error } = await supabase.rpc("check_and_unlock_badge", {
        p_user_id: "00000000-0000-0000-0000-000000000000",
        p_badge_id: "00000000-0000-0000-0000-000000000000",
      });
      functions.check_and_unlock_badge = !error || !error.message.includes("does not exist");
    } catch (e) {
      functions.check_and_unlock_badge = !e.message?.includes("does not exist");
    }

    // Test update_learning_streak
    try {
      const { error } = await supabase.rpc("update_learning_streak", {
        p_user_id: "00000000-0000-0000-0000-000000000000",
        p_streak_type: "daily",
      });
      functions.update_learning_streak = !error || !error.message.includes("does not exist");
    } catch (e) {
      functions.update_learning_streak = !e.message?.includes("does not exist");
    }

    const allHealthy = Object.values(functions).every((v) => v === true);

    res.json({
      success: allHealthy,
      status: allHealthy ? "complete" : "partial",
      functions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    safeLog("error", "[RPC Verify] Errore:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Statistics endpoint - statistiche sistema educativo
 */
export async function getEducationStats(req, res) {
  try {
    const stats = {};

    // Count modules
    const { count: modulesCount } = await supabase
      .from("education_modules")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // Count lessons
    const { count: lessonsCount } = await supabase
      .from("education_lessons")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // Count tests
    const { count: testsCount } = await supabase
      .from("education_tests")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // Count badges
    const { count: badgesCount } = await supabase
      .from("education_badges")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // Count users with progress
    const { count: usersWithProgress } = await supabase
      .from("education_user_progress")
      .select("user_id", { count: "exact", head: true });

    // Count users with stats
    const { count: usersWithStats } = await supabase
      .from("education_user_stats")
      .select("user_id", { count: "exact", head: true });

    stats.modules = modulesCount || 0;
    stats.lessons = lessonsCount || 0;
    stats.tests = testsCount || 0;
    stats.badges = badgesCount || 0;
    stats.users_with_progress = usersWithProgress || 0;
    stats.users_with_stats = usersWithStats || 0;

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    safeLog("error", "[Education Stats] Errore:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case "health":
      return await healthCheck(req, res);
    case "verify-schema":
      return await verifySchema(req, res);
    case "verify-rpc":
      return await verifyRPCFunctions(req, res);
    case "stats":
      return await getEducationStats(req, res);
    default:
      return res.status(400).json({
        success: false,
        error: "Azione non valida. Usa: health, verify-schema, verify-rpc, stats",
      });
  }
}
