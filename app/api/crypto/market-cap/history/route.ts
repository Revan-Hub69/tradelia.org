/**
 * API: Market Cap History
 * 
 * Fornisce storico market cap per una crypto
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMarketCapHistory, COINGECKO_IDS } from '@/lib/price-apis/coingecko';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol')?.toUpperCase();
    const days = parseInt(searchParams.get('days') || '30');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol richiesto' },
        { status: 400 }
      );
    }

    const coinId = COINGECKO_IDS[symbol];
    if (!coinId) {
      return NextResponse.json(
        { error: `Coin ID non trovato per ${symbol}` },
        { status: 404 }
      );
    }

    const history = await getMarketCapHistory(coinId, days);

    return NextResponse.json({
      symbol,
      coinId,
      history,
      period: days,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/market-cap/history:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero market cap history' },
      { status: 500 }
    );
  }
}

