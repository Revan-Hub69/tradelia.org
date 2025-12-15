/**
 * API: Futures Data (Funding, Open Interest, Liquidazioni)
 * 
 * Aggrega dati futures da Binance per sentiment e trend analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBinanceFundingRate,
  getBinanceOpenInterest,
  FundingRate,
  OpenInterest,
} from '@/lib/price-apis/binance-futures';

interface FuturesData {
  symbol: string;
  funding: FundingRate | null;
  openInterest: OpenInterest | null;
  sentiment: {
    fundingExtreme: boolean; // Funding > 0.1% o < -0.1%
    fundingPositive: boolean; // Long pagano short
    oiTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown'; // Richiede storico
    interpretation: string; // Breve interpretazione
  };
  explanation?: string;
}

/**
 * Interpreta i dati futures per sentiment
 */
function interpretFuturesSentiment(
  funding: FundingRate | null,
  oi: OpenInterest | null
): {
  fundingExtreme: boolean;
  fundingPositive: boolean;
  oiTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  interpretation: string;
} {
  let fundingExtreme = false;
  let fundingPositive = false;
  let interpretation = '';

  if (funding) {
    fundingExtreme = Math.abs(funding.fundingRatePercent) > 0.1;
    fundingPositive = funding.fundingRate > 0;

    if (fundingExtreme) {
      if (funding.fundingRate > 0.1) {
        interpretation = 'Funding estremamente positivo: long pagano molto ai short. Possibile eccesso di ottimismo, rischio di reversal.';
      } else if (funding.fundingRate < -0.1) {
        interpretation = 'Funding estremamente negativo: short pagano molto ai long. Possibile eccesso di pessimismo, rischio di short squeeze.';
      }
    } else {
      interpretation = `Funding ${fundingPositive ? 'positivo' : 'negativo'} moderato. Mercato ${fundingPositive ? 'ottimista' : 'pessimista'} ma non estremo.`;
    }
  }

  // OI trend richiede storico, per ora unknown
  const oiTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown' = 'unknown';

  return {
    fundingExtreme,
    fundingPositive,
    oiTrend,
    interpretation,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTC';
    const includeExplanation = searchParams.get('explanation') === 'true';

    // Fetch dati futures in parallelo
    const [funding, openInterest] = await Promise.all([
      getBinanceFundingRate(symbol),
      getBinanceOpenInterest(symbol),
    ]);

    const sentiment = interpretFuturesSentiment(funding, openInterest);

    const result: FuturesData = {
      symbol,
      funding,
      openInterest,
      sentiment,
    };

    // Genera spiegazione AI se richiesta
    if (includeExplanation) {
      const { generateGroqExplanation } = await import('@/lib/ai/groq-helper');
      
      const prompt = `Spiega i dati futures per ${symbol}:

Funding Rate: ${funding ? `${funding.fundingRatePercent.toFixed(4)}%` : 'N/A'}
Open Interest: ${openInterest ? `$${openInterest.openInterest.toLocaleString()}` : 'N/A'}
Sentiment: ${sentiment.interpretation}

Spiega:
1. Cosa significano questi dati per il trading
2. Quando sono segnali forti vs deboli
3. Limitazioni: funding può rimanere estremo a lungo, OI non dice direzione
4. Come usare questi dati insieme ad altri indicatori`;

      const explanation = await generateGroqExplanation(prompt, {
        symbol,
        funding,
        openInterest,
        sentiment,
        type: 'futures_sentiment',
      });

      result.explanation = explanation || undefined;
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/futures/data:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dati futures' },
      { status: 500 }
    );
  }
}

