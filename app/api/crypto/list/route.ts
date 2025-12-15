/**
 * API Route: Dynamic Crypto List
 * 
 * GET /api/crypto/list
 * 
 * Query params:
 * - limit: number (default: 50) - Numero di crypto
 * - minMarketCap: number (optional) - Market cap minimo
 * - exchange: string (optional) - 'binance' | 'all' (default: 'binance')
 * - search: string (optional) - Cerca per nome/symbol
 * 
 * Returns: Lista dinamica di crypto disponibili
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTopBinanceCryptocurrencies, getTopCryptocurrencies } from '@/lib/crypto/top-crypto-list';
import { rateLimit } from '@/lib/security/rate-limiting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Rate limiting
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
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const minMarketCap = searchParams.get('minMarketCap')
      ? parseFloat(searchParams.get('minMarketCap')!)
      : undefined;
    const exchange = searchParams.get('exchange') || 'binance';
    const search = searchParams.get('search')?.toLowerCase();

    // Fetch crypto list
    const cryptoList =
      exchange === 'binance'
        ? await getTopBinanceCryptocurrencies(limit)
        : await getTopCryptocurrencies(limit);

    // Filtra per market cap
    let filtered = minMarketCap
      ? cryptoList.filter((c) => c.marketCap >= minMarketCap)
      : cryptoList;

    // Filtra per search
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.symbol.toLowerCase().includes(search) ||
          c.name.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      count: filtered.length,
      limit,
      exchange,
      crypto: filtered.map((c) => ({
        symbol: c.symbol,
        name: c.name,
        marketCap: c.marketCap,
        marketCapRank: c.marketCapRank,
        price: c.price,
        priceChange24h: c.priceChange24h,
        priceChangePercent24h: c.priceChangePercent24h,
        volume24h: c.volume24h,
        availableOnBinance: exchange === 'binance' ? true : c.availableOnBinance,
      })),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in GET /api/crypto/list:', error);
    return NextResponse.json(
      {
        error: 'Errore interno',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

