/**
 * API: Crypto Market Cap Data
 * 
 * Fornisce dati market cap, ranking, e variazioni
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTopCryptoByMarketCap } from '@/lib/price-apis/coingecko';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    const cryptoData = await getTopCryptoByMarketCap(limit);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cryptos: cryptoData,
      total: cryptoData.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/market-cap:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero market cap data' },
      { status: 500 }
    );
  }
}

