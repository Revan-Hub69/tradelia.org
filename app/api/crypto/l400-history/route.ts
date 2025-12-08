import { NextResponse } from 'next/server';

/**
 * L400 Historical Support/Resistance API
 * 
 * Academic Reference:
 * - Lo, A. W., & MacKinlay, A. C. (1988). "Stock Market Prices Do Not Follow Random Walks"
 * - Steidlmayer, J. P. (1989). "Steidlmayer on Markets"
 * 
 * Stores historical support/resistance levels for pattern recognition
 */

interface HistoricalLevel {
  price: number;
  volume: number;
  type: 'support' | 'resistance';
  timestamp: string;
  strength: number; // 0-1, based on volume and frequency
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const days = parseInt(searchParams.get('days') || '30', 10);

    // For MVP, we'll calculate historical levels from current order book
    // In production, would store historical order book snapshots
    
    // Fetch current order book
    const orderBookResponse = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=400`);
    if (!orderBookResponse.ok) {
      throw new Error('Failed to fetch order book');
    }
    const orderBook = await orderBookResponse.json();

    // Fetch current price
    const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const ticker = tickerResponse.ok ? await tickerResponse.json() : { price: '0' };
    const currentPrice = parseFloat(ticker.price);

    // Calculate support/resistance levels from current order book
    const bids = orderBook.bids.map(([price, qty]: [string, string]) => ({
      price: parseFloat(price),
      volume: parseFloat(qty) * parseFloat(price),
    }));

    const asks = orderBook.asks.map(([price, qty]: [string, string]) => ({
      price: parseFloat(price),
      volume: parseFloat(qty) * parseFloat(price),
    }));

    // Find significant support levels (high bid volume)
    const avgBidVolume = bids.reduce((sum: number, b: { volume: number }) => sum + b.volume, 0) / bids.length;
    const stdBidVolume = Math.sqrt(
      bids.reduce((sum: number, b: { volume: number }) => sum + Math.pow(b.volume - avgBidVolume, 2), 0) / bids.length
    );

    const supportLevels: HistoricalLevel[] = bids
      .filter((b: { price: number; volume: number }) => b.volume > avgBidVolume + 2 * stdBidVolume)
      .map((b: { price: number; volume: number }) => ({
        price: b.price,
        volume: b.volume,
        type: 'support' as const,
        timestamp: new Date().toISOString(),
        strength: Math.min(1, b.volume / (avgBidVolume + 3 * stdBidVolume)),
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    // Find significant resistance levels (high ask volume)
    const avgAskVolume = asks.reduce((sum: number, a: { volume: number }) => sum + a.volume, 0) / asks.length;
    const stdAskVolume = Math.sqrt(
      asks.reduce((sum: number, a: { volume: number }) => sum + Math.pow(a.volume - avgAskVolume, 2), 0) / asks.length
    );

    const resistanceLevels: HistoricalLevel[] = asks
      .filter((a: { price: number; volume: number }) => a.volume > avgAskVolume + 2 * stdAskVolume)
      .map((a: { price: number; volume: number }) => ({
        price: a.price,
        volume: a.volume,
        type: 'resistance' as const,
        timestamp: new Date().toISOString(),
        strength: Math.min(1, a.volume / (avgAskVolume + 3 * stdAskVolume)),
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        currentPrice,
        supportLevels,
        resistanceLevels,
        totalLevels: supportLevels.length + resistanceLevels.length,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 1 min cache
      },
    });
  } catch (error) {
    console.error('Error fetching L400 history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical levels' },
      { status: 500 }
    );
  }
}
