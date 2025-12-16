/**
 * API Route: Multi-Timeframe Analysis
 * 
 * GET /api/crypto/indicators/multi-timeframe
 * 
 * Analisi multi-timeframe per conferma segnali
 * 
 * Query params:
 * - symbol: string (required)
 * - timeframes: string (optional) - Comma-separated (1m,5m,15m,1h)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CryptoSymbolSchema } from '@/lib/validation/crypto-schemas';
import { rateLimit } from '@/lib/security/rate-limiting';
import { calculateRSI, calculateMACD, type PriceData } from '@/lib/indicators/technical-indicators';
import { analyzeMultiTimeframe, scalpingMultiTimeframe, intradayMultiTimeframe, type TimeframeSignal } from '@/lib/analysis/multi-timeframe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function fetchPriceData(symbol: string, interval: string, limit = 100): Promise<PriceData[]> {
  const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

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
    return [];
  }
}

function determineTrend(prices: PriceData[]): 'uptrend' | 'downtrend' | 'sideways' {
  if (prices.length < 20) return 'sideways';

  const recent = prices.slice(-20);
  const first = recent[0].close;
  const last = recent[recent.length - 1].close;
  const change = (last - first) / first;

  if (change > 0.02) return 'uptrend';
  if (change < -0.02) return 'downtrend';
  return 'sideways';
}

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
    const symbol = searchParams.get('symbol');
    const timeframesParam = searchParams.get('timeframes') || '1m,5m,15m,1h';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Parametro symbol richiesto' },
        { status: 400 }
      );
    }

    // Normalizza symbol (rimuovi USDT se presente, sarà aggiunto dopo)
    const normalizedSymbol = symbol.toUpperCase().replace('USDT', '');
    
    const validationResult = CryptoSymbolSchema.safeParse({ symbol: normalizedSymbol });
    if (!validationResult.success) {
      console.error('Symbol validation failed:', normalizedSymbol, validationResult.error.errors);
      return NextResponse.json(
        { error: 'Symbol non valido', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const timeframes = timeframesParam.split(',').map((t) => t.trim());

    // Fetch data for each timeframe
    const timeframeData = await Promise.all(
      timeframes.map(async (tf) => {
        const data = await fetchPriceData(normalizedSymbol, tf, 100);
        if (data.length === 0) return null;

        const rsi = calculateRSI(data);
        const macd = calculateMACD(data);

        const trend = determineTrend(data);
        const currentPrice = data[data.length - 1].close;
        const priceChange = data.length > 1
          ? ((currentPrice - data[data.length - 2].close) / data[data.length - 2].close) * 100
          : 0;

        // Determine signal
        let signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell' = 'neutral';
        let confidence = 50;

        if (rsi.signal === 'oversold' && macd.trend === 'bullish' && trend === 'uptrend') {
          signal = 'strong-buy';
          confidence = 80;
        } else if (rsi.signal === 'overbought' && macd.trend === 'bearish' && trend === 'downtrend') {
          signal = 'strong-sell';
          confidence = 80;
        } else if (rsi.signal === 'oversold' || (macd.trend === 'bullish' && priceChange > 0)) {
          signal = 'buy';
          confidence = 65;
        } else if (rsi.signal === 'overbought' || (macd.trend === 'bearish' && priceChange < 0)) {
          signal = 'sell';
          confidence = 65;
        }

        return {
          timeframe: tf,
          signal,
          confidence,
          trend,
          indicators: {
            rsi: rsi.rsi,
            macd: {
              macd: macd.macd,
              signal: macd.signal,
              histogram: macd.histogram,
            },
            volume: data.reduce((sum, d) => sum + d.volume, 0) / data.length,
            priceChange,
          },
        } as TimeframeSignal;
      })
    );

    const validSignals = timeframeData.filter((s): s is TimeframeSignal => s !== null);

    // Analyze multi-timeframe
    const analysis = analyzeMultiTimeframe(validSignals);

    // Scalping analysis (1m, 5m, 15m)
    const scalpingSignals = validSignals.filter((s) => ['1m', '5m', '15m'].includes(s.timeframe));
    const scalpingAnalysis = scalpingSignals.length === 3
      ? scalpingMultiTimeframe(scalpingSignals[0], scalpingSignals[1], scalpingSignals[2])
      : null;

    // Intraday analysis (5m, 15m, 1h)
    const intradaySignals = validSignals.filter((s) => ['5m', '15m', '1h'].includes(s.timeframe));
    const intradayAnalysis = intradaySignals.length === 3
      ? intradayMultiTimeframe(intradaySignals[0], intradaySignals[1], intradaySignals[2])
      : null;

    return NextResponse.json({
      symbol: normalizedSymbol,
      timestamp: Date.now(),
      timeframes: validSignals,
      analysis,
      scalpingAnalysis,
      intradayAnalysis,
    });
  } catch (error) {
    console.error('Error in multi-timeframe API:', error);
    return NextResponse.json(
      {
        error: 'Errore interno',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

