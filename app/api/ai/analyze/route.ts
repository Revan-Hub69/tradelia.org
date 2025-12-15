/**
 * API Route: Groq AI Analysis
 * 
 * POST /api/ai/analyze
 * 
 * Analizza i dati del dashboard con Groq AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeDashboardWithAI, type DashboardData } from '@/lib/ai/groq-assistant';
import { rateLimit } from '@/lib/security/rate-limiting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limiting
  const identifier = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
  const rateLimitResult = await rateLimit(identifier, {
    maxRequests: 20, // Limit AI calls
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra poco.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { data, symbol } = body as { data: DashboardData; symbol: string };

    if (!data || !symbol) {
      return NextResponse.json(
        { error: 'Parametri data e symbol richiesti' },
        { status: 400 }
      );
    }

    const analysis = await analyzeDashboardWithAI(data, symbol);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json(
      {
        error: 'Errore nell\'analisi AI',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

