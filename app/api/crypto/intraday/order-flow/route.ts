/**
 * API: Order Flow Analysis (Intraday/Scalping)
 * 
 * Analisi real-time del flusso ordini per scalping
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBinanceOrderBook } from '@/lib/price-apis/binance';
import { getOKXOrderBook } from '@/lib/price-apis/okx';
import { getBybitOrderBook } from '@/lib/price-apis/bybit';
import { analyzeOrderFlow } from '@/lib/analysis/order-flow';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol')?.toUpperCase();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol richiesto' },
        { status: 400 }
      );
    }

    // Aggrega order book da più exchange
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

    const bids = Array.from(bidMap.entries())
      .map(([price, quantity]) => ({ price, quantity }))
      .sort((a, b) => b.price - a.price);

    const asks = Array.from(askMap.entries())
      .map(([price, quantity]) => ({ price, quantity }))
      .sort((a, b) => a.price - b.price);

    if (bids.length === 0 || asks.length === 0) {
      return NextResponse.json(
        { error: 'Order book non disponibile' },
        { status: 404 }
      );
    }

    // Analizza order flow
    const orderFlow = analyzeOrderFlow(bids, asks);

    return NextResponse.json({
      symbol,
      timestamp: new Date().toISOString(),
      ...orderFlow,
      orderBook: {
        totalBidVolume: bids.reduce((sum, b) => sum + b.quantity, 0),
        totalAskVolume: asks.reduce((sum, a) => sum + a.quantity, 0),
        bestBid: bids[0].price,
        bestAsk: asks[0].price,
        spread: asks[0].price - bids[0].price,
        spreadPercent: ((asks[0].price - bids[0].price) / bids[0].price) * 100,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=5',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/intraday/order-flow:', error);
    return NextResponse.json(
      { error: 'Errore nell\'analisi order flow' },
      { status: 500 }
    );
  }
}

