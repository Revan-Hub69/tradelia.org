/**
 * API: Market Sentiment Aggregato
 * 
 * Calcola sentiment complessivo del mercato crypto basato su:
 * - Percentuale di crypto in crescita vs in calo
 * - Pressione media
 * - Funding rates aggregati
 * - Volume totale
 */

import { NextRequest, NextResponse } from 'next/server';

interface MarketSentiment {
  overall: 'very-bearish' | 'bearish' | 'neutral' | 'bullish' | 'very-bullish';
  score: number; // -100 to +100
  gainersPercent: number; // % crypto in crescita
  averageChange: number; // Cambio medio %
  averagePressure: number; // Pressione media
  totalVolume24h: number;
  interpretation: string;
  indicators: {
    priceAction: number; // -1 to 1
    orderFlow: number; // -1 to 1
    funding: number; // -1 to 1 (se disponibile)
  };
}

export async function GET(request: NextRequest) {
  try {
    // Fetch market overview
    const baseUrl = request.nextUrl.origin;
    const overviewRes = await fetch(`${baseUrl}/api/crypto/market-overview?limit=20`);
    
    if (!overviewRes.ok) {
      return NextResponse.json(
        { error: 'Errore nel recupero market overview' },
        { status: 503 }
      );
    }

    const overview = await overviewRes.json();
    const cryptos = overview.cryptos || [];

    if (cryptos.length === 0) {
      return NextResponse.json(
        { error: 'Nessun dato disponibile' },
        { status: 503 }
      );
    }

    // Calcola metriche
    const gainers = cryptos.filter((c: any) => c.change24hPercent > 0).length;
    const gainersPercent = (gainers / cryptos.length) * 100;
    const averageChange = cryptos.reduce((sum: number, c: any) => sum + c.change24hPercent, 0) / cryptos.length;
    const averagePressure = cryptos.reduce((sum: number, c: any) => sum + c.pressure.overall, 0) / cryptos.length;
    const totalVolume24h = cryptos.reduce((sum: number, c: any) => sum + c.volume24h, 0);

    // Calcola score sentiment
    const priceActionScore = averageChange / 10; // Normalizza (assumendo max 10% cambio medio)
    const orderFlowScore = averagePressure;
    
    // Score complessivo: media pesata
    const sentimentScore = (priceActionScore * 0.6 + orderFlowScore * 0.4) * 100;
    const sentimentScoreClamped = Math.max(-100, Math.min(100, sentimentScore));

    // Determina sentiment
    let overall: 'very-bearish' | 'bearish' | 'neutral' | 'bullish' | 'very-bullish';
    if (sentimentScoreClamped >= 60) {
      overall = 'very-bullish';
    } else if (sentimentScoreClamped >= 30) {
      overall = 'bullish';
    } else if (sentimentScoreClamped <= -60) {
      overall = 'very-bearish';
    } else if (sentimentScoreClamped <= -30) {
      overall = 'bearish';
    } else {
      overall = 'neutral';
    }

    // Interpretazione
    let interpretation = '';
    if (overall === 'very-bullish') {
      interpretation = 'Mercato molto rialzista: maggioranza crypto in crescita, pressione di acquisto elevata.';
    } else if (overall === 'bullish') {
      interpretation = 'Mercato rialzista: più crypto in crescita che in calo, pressione di acquisto moderata.';
    } else if (overall === 'very-bearish') {
      interpretation = 'Mercato molto ribassista: maggioranza crypto in calo, pressione di vendita elevata.';
    } else if (overall === 'bearish') {
      interpretation = 'Mercato ribassista: più crypto in calo che in crescita, pressione di vendita moderata.';
    } else {
      interpretation = 'Mercato neutrale: bilanciamento tra crescita e calo, pressione bilanciata.';
    }

    const sentiment: MarketSentiment = {
      overall,
      score: sentimentScoreClamped,
      gainersPercent,
      averageChange,
      averagePressure,
      totalVolume24h,
      interpretation,
      indicators: {
        priceAction: priceActionScore,
        orderFlow: orderFlowScore,
        funding: 0, // TODO: aggiungere quando disponibile
      },
    };

    return NextResponse.json(sentiment, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/market-sentiment:', error);
    return NextResponse.json(
      { error: 'Errore nel calcolo sentiment' },
      { status: 500 }
    );
  }
}

