/**
 * API: AI Reading per Crypto Specifica
 * 
 * Genera lettura AI completa per una singola crypto
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCryptoReading } from '@/lib/ai/groq-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();
    const baseUrl = request.nextUrl.origin;

    // Fetch tutti i dati necessari
    const [overviewRes, imbalanceRes] = await Promise.all([
      fetch(`${baseUrl}/api/crypto/market-overview?limit=50`),
      fetch(`${baseUrl}/api/crypto/microstructure/imbalance?symbol=${symbol}`),
    ]);

    if (!overviewRes.ok) {
      return NextResponse.json(
        { error: 'Errore nel recupero market overview' },
        { status: 503 }
      );
    }

    const overview = await overviewRes.json();
    const crypto = overview.cryptos?.find((c: any) => c.symbol === symbol);

    if (!crypto) {
      return NextResponse.json(
        { error: `Crypto ${symbol} non trovata` },
        { status: 404 }
      );
    }

    // Genera reading AI
    const reading = await generateCryptoReading(symbol, {
      price: crypto.price,
      change24hPercent: crypto.change24hPercent,
      volume24h: crypto.volume24h,
      orderBook: crypto.orderBook,
      supportResistance: crypto.supportResistance,
      pressure: crypto.pressure,
      liquidity: crypto.liquidity,
    });

    return NextResponse.json({
      symbol,
      timestamp: new Date().toISOString(),
      reading: reading || 'Reading non disponibile',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error(`Error in /api/crypto/${params.symbol}/reading:`, error);
    return NextResponse.json(
      { error: 'Errore nella generazione reading' },
      { status: 500 }
    );
  }
}

