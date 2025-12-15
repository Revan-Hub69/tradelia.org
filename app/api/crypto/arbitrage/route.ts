/**
 * API Route: Cross-Exchange Arbitrage
 * 
 * GET /api/crypto/arbitrage?symbol=BTC
 * 
 * Trova opportunità arbitraggio tra exchange
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security/rate-limiting';
import { findArbitrageOpportunities } from '@/lib/crypto/cross-exchange-arbitrage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
  const rateLimitResult = await rateLimit(identifier, {
    maxRequests: 30,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra poco.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTC';

    const opportunities = await findArbitrageOpportunities(symbol);

    return NextResponse.json({
      success: true,
      symbol,
      opportunities,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error finding arbitrage opportunities:', error);
    return NextResponse.json(
      {
        error: 'Errore nella ricerca opportunità arbitraggio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

