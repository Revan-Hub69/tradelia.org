/**
 * API: Market Reading Completo
 * 
 * Aggrega tutti i dati (order book, imbalance, futures) e genera
 * una lettura completa del mercato tramite Groq AI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMarketReading } from '@/lib/ai/groq-helper';

interface MarketReading {
  symbol: string;
  timestamp: number;
  data: {
    orderBook?: any;
    imbalance?: any;
    futures?: any;
  };
  reading: string | null;
  warnings: string[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTC';

    // Fetch tutti i dati in parallelo
    const baseUrl = request.nextUrl.origin;
    
    const [orderBookRes, imbalanceRes, futuresRes] = await Promise.all([
      fetch(`${baseUrl}/api/crypto/microstructure/orderbook?symbol=${symbol}`),
      fetch(`${baseUrl}/api/crypto/microstructure/imbalance?symbol=${symbol}`),
      fetch(`${baseUrl}/api/crypto/futures/data?symbol=${symbol}`),
    ]);

    const orderBook = orderBookRes.ok ? await orderBookRes.json() : null;
    const imbalance = imbalanceRes.ok ? await imbalanceRes.json() : null;
    const futures = futuresRes.ok ? await futuresRes.json() : null;

    // Prepara dati per Groq
    const dataForReading = {
      orderBook: orderBook?.aggregated ? {
        totalBidVolume: orderBook.aggregated.totalBidVolume,
        totalAskVolume: orderBook.aggregated.totalAskVolume,
        spread: imbalance?.spread || 0,
        spreadPercent: imbalance?.spreadPercent || 0,
      } : undefined,
      imbalance: imbalance ? {
        overallImbalance: imbalance.overallImbalance,
        imbalances: imbalance.imbalances.map((imb: any) => ({
          range: imb.range,
          imbalance: imb.imbalance,
        })),
      } : undefined,
      futures: futures ? {
        fundingRate: futures.funding?.fundingRate,
        openInterest: futures.openInterest?.openInterest,
        sentiment: futures.sentiment?.interpretation,
      } : undefined,
    };

    // Genera lettura completa
    const reading = await generateMarketReading(symbol, dataForReading);

    // Warnings automatici
    const warnings: string[] = [];
    
    if (imbalance?.spreadPercent && imbalance.spreadPercent > 0.1) {
      warnings.push('Spread molto largo: rischio slippage elevato');
    }
    
    if (futures?.funding?.fundingRatePercent && Math.abs(futures.funding.fundingRatePercent) > 0.1) {
      warnings.push('Funding rate estremo: possibile eccesso di sentiment');
    }
    
    if (imbalance?.overallImbalance && Math.abs(imbalance.overallImbalance) > 0.7) {
      warnings.push('Imbalance molto estremo: possibile manipolazione o liquidità artificiale');
    }

    const result: MarketReading = {
      symbol,
      timestamp: Date.now(),
      data: {
        orderBook: orderBook ? {
          depth: orderBook.aggregated?.depth,
          totalBidVolume: orderBook.aggregated?.totalBidVolume,
          totalAskVolume: orderBook.aggregated?.totalAskVolume,
        } : undefined,
        imbalance: imbalance ? {
          overallImbalance: imbalance.overallImbalance,
          spreadPercent: imbalance.spreadPercent,
        } : undefined,
        futures: futures ? {
          fundingRate: futures.funding?.fundingRatePercent,
          openInterest: futures.openInterest?.openInterest,
        } : undefined,
      },
      reading,
      warnings,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/microstructure/reading:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione lettura mercato' },
      { status: 500 }
    );
  }
}

