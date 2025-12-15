/**
 * API: Crypto Order Book Multi-Exchange
 * 
 * Aggrega order book da Binance, OKX, Bybit per ottenere
 * profondità L400 multi-exchange.
 * 
 * Include spiegazione AI generata tramite Groq.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBinanceOrderBook } from '@/lib/price-apis/binance';
import { getOKXOrderBook } from '@/lib/price-apis/okx';
import { getBybitOrderBook } from '@/lib/price-apis/bybit';
import { generateOrderBookExplanation, generateMultiExchangeExplanation } from '@/lib/ai/groq-helper';
import { OrderBookEntry, BinanceOrderBook } from '@/lib/price-apis/binance';

interface AggregatedOrderBook {
  symbol: string;
  exchanges: {
    name: string;
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    timestamp: number;
  }[];
  aggregated: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    totalBidVolume: number;
    totalAskVolume: number;
    depth: number;
  };
  explanation?: string;
  methodology?: string;
}

/**
 * Aggrega order book da più exchange
 */
function aggregateOrderBooks(
  exchangeBooks: Array<{
    name: string;
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }>
): {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  totalBidVolume: number;
  totalAskVolume: number;
} {
  // Mappa per aggregare per prezzo
  const bidMap = new Map<number, number>();
  const askMap = new Map<number, number>();

  // Aggrega tutti i bid
  for (const book of exchangeBooks) {
    for (const bid of book.bids) {
      const existing = bidMap.get(bid.price) || 0;
      bidMap.set(bid.price, existing + bid.quantity);
    }
  }

  // Aggrega tutti gli ask
  for (const book of exchangeBooks) {
    for (const ask of book.asks) {
      const existing = askMap.get(ask.price) || 0;
      askMap.set(ask.price, existing + ask.quantity);
    }
  }

  // Converti in array e ordina
  const bids: OrderBookEntry[] = Array.from(bidMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => b.price - a.price) // Ordine decrescente (migliori bid prima)
    .slice(0, 400); // L400

  const asks: OrderBookEntry[] = Array.from(askMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => a.price - b.price) // Ordine crescente (migliori ask prima)
    .slice(0, 400); // L400

  const totalBidVolume = bids.reduce((sum, bid) => sum + bid.quantity, 0);
  const totalAskVolume = asks.reduce((sum, ask) => sum + ask.quantity, 0);

  return {
    bids,
    asks,
    totalBidVolume,
    totalAskVolume,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validazione input con Zod
    const { OrderBookQuerySchema } = await import('@/lib/validation/crypto-schemas');
    const queryResult = OrderBookQuerySchema.safeParse({
      symbol: searchParams.get('symbol'),
      explanation: searchParams.get('explanation'),
      limit: searchParams.get('limit'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryResult.error.errors,
          validSymbols: ['BTC', 'ETH', 'BNB', 'SOL'],
        },
        { status: 400 }
      );
    }

    const { symbol, explanation: includeExplanation } = queryResult.data;

    // Fetch order book da tutti gli exchange in parallelo
    const [binanceBook, okxBook, bybitBook] = await Promise.all([
      getBinanceOrderBook(symbol, 100),
      getOKXOrderBook(symbol, 100),
      getBybitOrderBook(symbol, 100),
    ]);

    const exchangeBooks = [];

    if (binanceBook) {
      exchangeBooks.push({
        name: 'Binance',
        bids: binanceBook.bids,
        asks: binanceBook.asks,
        timestamp: binanceBook.timestamp,
      });
    }

    if (okxBook) {
      exchangeBooks.push({
        name: 'OKX',
        bids: okxBook.bids,
        asks: okxBook.asks,
        timestamp: okxBook.timestamp,
      });
    }

    if (bybitBook) {
      exchangeBooks.push({
        name: 'Bybit',
        bids: bybitBook.bids,
        asks: bybitBook.asks,
        timestamp: bybitBook.timestamp,
      });
    }

    if (exchangeBooks.length === 0) {
      return NextResponse.json(
        { error: 'Nessun order book disponibile dagli exchange' },
        { status: 503 }
      );
    }

    // Aggrega
    const aggregated = aggregateOrderBooks(exchangeBooks);

    const result: AggregatedOrderBook = {
      symbol,
      exchanges: exchangeBooks,
      aggregated: {
        ...aggregated,
        depth: aggregated.bids.length + aggregated.asks.length,
      },
    };

    // Genera spiegazione AI se richiesta
    if (includeExplanation) {
      const depth = aggregated.bids.length + aggregated.asks.length;
      const [orderBookExplanation, multiExchangeExplanation] = await Promise.all([
        generateOrderBookExplanation(symbol, aggregated.bids.length, 'Multi-Exchange'),
        generateMultiExchangeExplanation(
          symbol,
          exchangeBooks.map((e) => e.name),
          depth
        ),
      ]);

      result.explanation = orderBookExplanation || undefined;
      result.methodology = multiExchangeExplanation || undefined;
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=5',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/microstructure/orderbook:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero order book' },
      { status: 500 }
    );
  }
}

