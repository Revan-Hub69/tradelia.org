/**
 * Health Check Endpoint
 *
 * Conforme a 12-Factor App e AWS Well-Architected Framework
 *
 * Riferimenti:
 * - 12-Factor App: Health checks
 * - AWS Well-Architected: Reliability pillar
 * - Google SRE: SLI/SLO monitoring
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: "ok" | "error";
      responseTime?: number;
      error?: string;
    };
    externalApis: {
      status: "ok" | "error";
      binance?: "ok" | "error";
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck["checks"] = {
    database: { status: "ok" },
    externalApis: { status: "ok" },
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
  };

  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  // Check database
  try {
    const dbStart = Date.now();
    const supabase = await createClient();
    const { error } = await supabase.from("users").select("id").limit(1);
    const dbTime = Date.now() - dbStart;

    if (error) {
      checks.database = {
        status: "error",
        error: error.message,
      };
      overallStatus = "degraded";
    } else {
      checks.database = {
        status: "ok",
        responseTime: dbTime,
      };
    }
  } catch (error) {
    checks.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    overallStatus = "unhealthy";
  }

  // Check external APIs (Binance)
  try {
    const response = await fetch("https://api.binance.com/api/v3/ping", {
      signal: AbortSignal.timeout(3000), // 3s timeout
    });

    if (!response.ok) {
      checks.externalApis = {
        status: "error",
        binance: "error",
        error: `HTTP ${response.status}`,
      };
      overallStatus = overallStatus === "healthy" ? "degraded" : overallStatus;
    } else {
      checks.externalApis = {
        status: "ok",
        binance: "ok",
      };
    }
  } catch (error) {
    checks.externalApis = {
      status: "error",
      binance: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    overallStatus = overallStatus === "healthy" ? "degraded" : overallStatus;
  }

  // Check memory
  if (typeof process !== "undefined" && process.memoryUsage) {
    const memoryUsage = process.memoryUsage();
    checks.memory = {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
    };

    // Memory > 90% = unhealthy
    if (checks.memory.percentage > 90) {
      overallStatus = "unhealthy";
    } else if (checks.memory.percentage > 80) {
      overallStatus = overallStatus === "healthy" ? "degraded" : overallStatus;
    }
  }

  const healthCheck: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    checks,
  };

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return NextResponse.json(healthCheck, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  });
}
