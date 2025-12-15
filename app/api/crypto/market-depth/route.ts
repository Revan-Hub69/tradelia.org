/**
 * API Route: Market Depth Analysis
 * 
 * GET /api/crypto/market-depth?symbol=BTC
 * 
 * Analisi completa del mercato crypto:
 * - Volume multi-exchange aggregato
 * - Whale movements
 * - Exchange flows
 * - Market depth analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security/rate-limiting';
import { aggregateVolume } from '@/lib/crypto/volume-aggregator';
import { analyzeWhaleMovements } from '@/lib/crypto/whale-tracker';
import { calculateExchangeFlows } from '@/lib/crypto/exchange-flows';

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

    // Fetch all data in parallel
    const [volumeData, whaleData, flowData, priceData] = await Promise.allSettled([
      aggregateVolume(symbol),
      analyzeWhaleMovements(symbol, 1000000), // $1M minimum
      // Get current price for exchange flows
      fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`)
        .then(r => r.ok ? r.json() : null)
        .then(data => data ? parseFloat(data.price) : null),
    ]);

    const price = priceData.status === 'fulfilled' && priceData.value ? priceData.value : 0;
    
    const [exchangeFlowData] = await Promise.allSettled([
      calculateExchangeFlows(symbol, price),
    ]);

    return NextResponse.json({
      success: true,
      symbol,
      data: {
        volume: volumeData.status === 'fulfilled' ? volumeData.value : null,
        whales: whaleData.status === 'fulfilled' ? whaleData.value : null,
        exchangeFlows: exchangeFlowData.status === 'fulfilled' ? exchangeFlowData.value : null,
        price,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in market depth analysis:', error);
    return NextResponse.json(
      {
        error: 'Errore nell\'analisi market depth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

