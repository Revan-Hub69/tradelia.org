/**
 * API Route: Technical Indicators
 * 
 * GET /api/crypto/indicators/technical
 * 
 * Query params:
 * - symbol: string (required) - Crypto symbol (e.g., BTC, ETH)
 * - timeframe: string (optional) - Timeframe (1m, 5m, 15m, 1h, 4h, 1d)
 * - indicators: string (optional) - Comma-separated list (rsi,macd,bollinger,atr,stochastic)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CryptoSymbolSchema } from '@/lib/validation/crypto-schemas';
import { rateLimit } from '@/lib/security/rate-limiting';
import {
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateStochastic,
  type PriceData,
} from '@/lib/indicators/technical-indicators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Fetch historical price data from exchange
 */
async function fetchPriceData(
  symbol: string,
  timeframe: string,
  limit = 100
): Promise<PriceData[]> {
  // Usa Binance API per dati storici
  const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
  const interval = timeframe || '1h';

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    return data.map((kline: any[]) => ({
      timestamp: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimit(request, {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minuto
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra poco.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const timeframe = searchParams.get('timeframe') || '1h';
    const indicatorsParam = searchParams.get('indicators') || 'rsi,macd,bollinger,atr,stochastic';

    // Validazione
    if (!symbol) {
      return NextResponse.json(
        { error: 'Parametro symbol richiesto' },
        { status: 400 }
      );
    }

    const validationResult = CryptoSymbolSchema.safeParse(symbol);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Symbol non valido', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Fetch price data
    const priceData = await fetchPriceData(symbol, timeframe, 100);

    if (priceData.length === 0) {
      return NextResponse.json(
        { error: 'Nessun dato disponibile' },
        { status: 404 }
      );
    }

    // Calcola indicatori richiesti
    const indicators = indicatorsParam.split(',').map((i) => i.trim().toLowerCase());
    const results: Record<string, any> = {};

    if (indicators.includes('rsi')) {
      results.rsi = calculateRSI(priceData);
    }

    if (indicators.includes('macd')) {
      results.macd = calculateMACD(priceData);
    }

    if (indicators.includes('bollinger')) {
      results.bollinger = calculateBollingerBands(priceData);
    }

    if (indicators.includes('atr')) {
      results.atr = calculateATR(priceData);
    }

    if (indicators.includes('stochastic')) {
      results.stochastic = calculateStochastic(priceData);
    }

    return NextResponse.json({
      symbol,
      timeframe,
      timestamp: Date.now(),
      indicators: results,
      price: {
        current: priceData[priceData.length - 1].close,
        high: Math.max(...priceData.map((p) => p.high)),
        low: Math.min(...priceData.map((p) => p.low)),
      },
    });
  } catch (error) {
    console.error('Error in technical indicators API:', error);
    return NextResponse.json(
      {
        error: 'Errore interno',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

