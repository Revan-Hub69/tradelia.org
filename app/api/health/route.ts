import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/health
 * Health check endpoint per monitoring
 * 
 * Response:
 * {
 *   "status": "healthy" | "degraded" | "unhealthy",
 *   "timestamp": "2025-01-27T...",
 *   "checks": {
 *     "database": "healthy",
 *     "api": "healthy"
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Check database connection
  try {
    const dbStartTime = Date.now();
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const dbLatency = Date.now() - dbStartTime;

    if (error) {
      checks.database = { status: 'unhealthy', error: error.message };
    } else {
      checks.database = { status: 'healthy', latency: dbLatency };
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check API response time
  const apiLatency = Date.now() - startTime;
  checks.api = { status: 'healthy', latency: apiLatency };

  // Determine overall status
  const allHealthy = Object.values(checks).every((check) => check.status === 'healthy');
  const anyUnhealthy = Object.values(checks).some((check) => check.status === 'unhealthy');

  const status = allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded';

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
    },
    {
      status: status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503,
    }
  );
}

