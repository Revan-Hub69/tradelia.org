/**
 * API: Bid/Ask Imbalance
 * 
 * Calcola l'imbalance bid/ask per fasce di prezzo
 * rispetto al mid-price corrente.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBinanceOrderBook } from '@/lib/price-apis/binance';
import { getOKXOrderBook } from '@/lib/price-apis/okx';
import { getBybitOrderBook } from '@/lib/price-apis/bybit';
import { OrderBookEntry } from '@/lib/price-apis/binance';

interface ImbalanceData {
  symbol: string;
  currentPrice: number;
  midPrice: number;
  spread: number;
  spreadPercent: number;
  imbalances: {
    range: string;
    bidVolume: number;
    askVolume: number;
    imbalance: number;
    imbalancePercent: number;
  }[];
  totalBidVolume: number;
  totalAskVolume: number;
  overallImbalance: number;
}

function calculateMidPrice(bids: OrderBookEntry[], asks: OrderBookEntry[]): number {
  if (bids.length === 0 || asks.length === 0) return 0;
  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  return (bestBid + bestAsk) / 2;
}

function calculateImbalanceByRange(
  bids: OrderBookEntry[],
  asks: OrderBookEntry[],
  midPrice: number,
  minPercent: number,
  maxPercent: number
): {
  bidVolume: number;
  askVolume: number;
  imbalance: number;
} {
  const minPrice = midPrice * (1 - maxPercent / 100);
  const maxPrice = midPrice * (1 + maxPercent / 100);

  let bidVolume = 0;
  let askVolume = 0;

  for (const bid of bids) {
    if (bid.price >= minPrice && bid.price <= midPrice) {
      bidVolume += bid.quantity;
    }
  }

  for (const ask of asks) {
    if (ask.price >= midPrice && ask.price <= maxPrice) {
      askVolume += ask.quantity;
    }
  }

  const totalVolume = bidVolume + askVolume;
  const imbalance = totalVolume > 0 ? (bidVolume - askVolume) / totalVolume : 0;

  return {
    bidVolume,
    askVolume,
    imbalance,
  };
}

async function getAggregatedOrderBook(symbol: string) {
  const [binanceBook, okxBook, bybitBook] = await Promise.all([
    getBinanceOrderBook(symbol, 100),
    getOKXOrderBook(symbol, 100),
    getBybitOrderBook(symbol, 100),
  ]);

  const bidMap = new Map<number, number>();
  const askMap = new Map<number, number>();

  if (binanceBook) {
    for (const bid of binanceBook.bids) {
      bidMap.set(bid.price, (bidMap.get(bid.price) || 0) + bid.quantity);
    }
    for (const ask of binanceBook.asks) {
      askMap.set(ask.price, (askMap.get(ask.price) || 0) + ask.quantity);
    }
  }

  if (okxBook) {
    for (const bid of okxBook.bids) {
      bidMap.set(bid.price, (bidMap.get(bid.price) || 0) + bid.quantity);
    }
    for (const ask of okxBook.asks) {
      askMap.set(ask.price, (askMap.get(ask.price) || 0) + ask.quantity);
    }
  }

  if (bybitBook) {
    for (const bid of bybitBook.bids) {
      bidMap.set(bid.price, (bidMap.get(bid.price) || 0) + bid.quantity);
    }
    for (const ask of bybitBook.asks) {
      askMap.set(ask.price, (askMap.get(ask.price) || 0) + ask.quantity);
    }
  }

  const bids: OrderBookEntry[] = Array.from(bidMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => b.price - a.price);

  const asks: OrderBookEntry[] = Array.from(askMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => a.price - b.price);

  return { bids, asks };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTC';

    const { bids, asks } = await getAggregatedOrderBook(symbol);

    if (bids.length === 0 || asks.length === 0) {
      return NextResponse.json(
        { error: 'Order book non disponibile' },
        { status: 503 }
      );
    }

    const midPrice = calculateMidPrice(bids, asks);
    const bestBid = bids[0].price;
    const bestAsk = asks[0].price;
    const spread = bestAsk - bestBid;
    const spreadPercent = (spread / midPrice) * 100;

    const ranges = [
      { min: 0, max: 0.1, label: '0-0.1%' },
      { min: 0.1, max: 0.5, label: '0.1-0.5%' },
      { min: 0.5, max: 1, label: '0.5-1%' },
      { min: 1, max: 2, label: '1-2%' },
    ];

    const imbalances = ranges.map((range) => {
      const { bidVolume, askVolume, imbalance } = calculateImbalanceByRange(
        bids,
        asks,
        midPrice,
        range.min,
        range.max
      );

      return {
        range: range.label,
        bidVolume,
        askVolume,
        imbalance,
        imbalancePercent: imbalance * 100,
      };
    });

    const totalBidVolume = bids.reduce((sum, bid) => sum + bid.quantity, 0);
    const totalAskVolume = asks.reduce((sum, ask) => sum + ask.quantity, 0);
    const totalVolume = totalBidVolume + totalAskVolume;
    const overallImbalance = totalVolume > 0 
      ? (totalBidVolume - totalAskVolume) / totalVolume 
      : 0;

    const result: ImbalanceData = {
      symbol,
      currentPrice: midPrice,
      midPrice,
      spread,
      spreadPercent,
      imbalances,
      totalBidVolume,
      totalAskVolume,
      overallImbalance,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=5',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/microstructure/imbalance:', error);
    return NextResponse.json(
      { error: 'Errore nel calcolo imbalance' },
      { status: 500 }
    );
  }
}

