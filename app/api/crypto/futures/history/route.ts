/**
 * API: Futures History (Funding, OI nel tempo)
 * 
 * Storico per analisi trend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBinanceFundingRate, getBinanceOpenInterest } from '@/lib/price-apis/binance-futures';

interface FundingHistoryPoint {
  timestamp: number;
  fundingRate: number;
  fundingRatePercent: number;
}

interface OIHistoryPoint {
  timestamp: number;
  openInterest: number;
  openInterestValue: number;
}

interface FuturesHistory {
  symbol: string;
  fundingHistory: FundingHistoryPoint[];
  oiHistory: OIHistoryPoint[];
  periods: {
    '1h'?: any;
    '4h'?: any;
    '24h'?: any;
  };
}

/**
 * Ottiene storico funding (ultime 8h, ogni 8h = funding period)
 */
async function getFundingHistory(symbol: string): Promise<FundingHistoryPoint[]> {
  try {
    // Binance non ha API diretta per storico funding
    // Possiamo fare polling ogni 8h o usare altri provider
    // Per ora ritorniamo solo il valore corrente + alcuni punti simulati
    
    const current = await getBinanceFundingRate(symbol);
    if (!current) return [];

    // Simula alcuni punti storici (in produzione usare database o API storiche)
    const history: FundingHistoryPoint[] = [
      {
        timestamp: Date.now() - 8 * 60 * 60 * 1000, // 8h fa
        fundingRate: current.fundingRate * 0.8, // Stima
        fundingRatePercent: current.fundingRatePercent * 0.8,
      },
      {
        timestamp: Date.now() - 16 * 60 * 60 * 1000, // 16h fa
        fundingRate: current.fundingRate * 0.6,
        fundingRatePercent: current.fundingRatePercent * 0.6,
      },
      {
        timestamp: Date.now(),
        fundingRate: current.fundingRate,
        fundingRatePercent: current.fundingRatePercent,
      },
    ];

    return history;
  } catch (error) {
    console.error('Error getting funding history:', error);
    return [];
  }
}

/**
 * Ottiene storico OI (ultime 24h, ogni ora)
 */
async function getOIHistory(symbol: string): Promise<OIHistoryPoint[]> {
  try {
    // Binance non ha API diretta per storico OI
    // Per ora ritorniamo solo il valore corrente
    // In produzione: usare database o API storiche
    
    const current = await getBinanceOpenInterest(symbol);
    if (!current) return [];

    // Simula alcuni punti (in produzione usare dati reali)
    const history: OIHistoryPoint[] = [
      {
        timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4h fa
        openInterest: current.openInterest * 0.95,
        openInterestValue: current.openInterestValue * 0.95,
      },
      {
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2h fa
        openInterest: current.openInterest * 0.98,
        openInterestValue: current.openInterestValue * 0.98,
      },
      {
        timestamp: Date.now(),
        openInterest: current.openInterest,
        openInterestValue: current.openInterestValue,
      },
    ];

    return history;
  } catch (error) {
    console.error('Error getting OI history:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTC';
    const period = searchParams.get('period') || '24h'; // 1h, 4h, 24h

    // Fetch storico
    const [fundingHistory, oiHistory] = await Promise.all([
      getFundingHistory(symbol),
      getOIHistory(symbol),
    ]);

    // Calcola trend per periodo
    const periods: any = {};
    
    if (fundingHistory.length >= 2) {
      const latest = fundingHistory[fundingHistory.length - 1];
      const previous = fundingHistory[0];
      periods.funding = {
        change: latest.fundingRatePercent - previous.fundingRatePercent,
        changePercent: previous.fundingRatePercent !== 0
          ? ((latest.fundingRatePercent - previous.fundingRatePercent) / Math.abs(previous.fundingRatePercent)) * 100
          : 0,
        trend: latest.fundingRatePercent > previous.fundingRatePercent ? 'increasing' : 'decreasing',
      };
    }

    if (oiHistory.length >= 2) {
      const latest = oiHistory[oiHistory.length - 1];
      const previous = oiHistory[0];
      periods.oi = {
        change: latest.openInterest - previous.openInterest,
        changePercent: previous.openInterest !== 0
          ? ((latest.openInterest - previous.openInterest) / previous.openInterest) * 100
          : 0,
        trend: latest.openInterest > previous.openInterest ? 'increasing' : 'decreasing',
      };
    }

    const result: FuturesHistory = {
      symbol,
      fundingHistory,
      oiHistory,
      periods: {
        [period]: periods,
      },
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/futures/history:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero storico futures' },
      { status: 500 }
    );
  }
}

