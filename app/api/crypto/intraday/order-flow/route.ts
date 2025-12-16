/**
 * API Route: Order Flow Indicators
 * 
 * GET /api/crypto/intraday/order-flow
 * 
 * Calcola indicatori order flow per scalping
 * 
 * Query params:
 * - symbol: string (required) - Crypto symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { CryptoSymbolSchema } from '@/lib/validation/crypto-schemas';
import { rateLimit } from '@/lib/security/rate-limiting';
import {
  calculateDelta,
  calculateCVD,
  calculateTakerRatio,
  calculateOrderBookImbalance,
  calculateVolumeWeightedDelta,
  calculateCombinedOrderFlowSignal,
  type Trade,
  type OrderBookLevel,
} from '@/lib/indicators/order-flow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Fetch recent trades from Binance
 */
async function fetchRecentTrades(symbol: string, limit = 100): Promise<Trade[]> {
  const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${binanceSymbol}&limit=${limit}`,
      { next: { revalidate: 5 } } // Cache 5 secondi
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    return data.map((trade: any) => ({
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.qty),
      timestamp: trade.time,
      isBuyerMaker: trade.isBuyerMaker,
      tradeId: trade.id.toString(),
    }));
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
}

/**
 * Fetch order book from Binance
 */
async function fetchOrderBook(symbol: string, limit = 20): Promise<{
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}> {
  const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=${limit}`,
      { next: { revalidate: 1 } } // Cache 1 secondo
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      bids: data.bids.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
        side: 'bid' as const,
      })),
      asks: data.asks.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
        side: 'ask' as const,
      })),
    };
  } catch (error) {
    console.error('Error fetching order book:', error);
    return { bids: [], asks: [] };
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const identifier = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
  const rateLimitResult = await rateLimit(identifier, {
    maxRequests: 60, // Più frequente per real-time
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

    // Fetch trades and order book
    const [trades, orderBook] = await Promise.all([
      fetchRecentTrades(normalizedSymbol, 100),
      fetchOrderBook(normalizedSymbol, 20),
    ]);

    if (trades.length === 0) {
      return NextResponse.json(
        { error: 'Nessun trade disponibile' },
        { status: 404 }
      );
    }

    // Calculate all order flow indicators
    const delta = calculateDelta(trades);
    const cvd = calculateCVD(trades);
    const takerRatio = calculateTakerRatio(trades);
    const orderBookImbalance = calculateOrderBookImbalance(orderBook.bids, orderBook.asks);
    const vwd = calculateVolumeWeightedDelta(trades);
    const combinedSignal = calculateCombinedOrderFlowSignal(trades, orderBook.bids, orderBook.asks);

    return NextResponse.json({
      symbol: normalizedSymbol,
      timestamp: Date.now(),
      indicators: {
        delta,
        cvd,
        takerRatio,
        orderBookImbalance,
        volumeWeightedDelta: vwd,
      },
      combinedSignal: {
        signal: combinedSignal.signal,
        confidence: combinedSignal.confidence,
        reasons: combinedSignal.reasons,
      },
      summary: {
        buyPressure: delta.deltaPercent > 0,
        sellPressure: delta.deltaPercent < 0,
        imbalance: orderBookImbalance.imbalancePercent,
        aggressiveness: combinedSignal.timeAndSales.aggressiveness,
      },
    });
  } catch (error) {
    console.error('Error in order flow API:', error);
    return NextResponse.json(
      {
        error: 'Errore interno',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
