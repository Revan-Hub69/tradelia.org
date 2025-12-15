/**
 * API: Solid Indicators
 * 
 * Fornisce indicatori accademicamente solidi:
 * - VWAP (Volume-Weighted Average Price)
 * - Volume Profile
 * - Realized Volatility
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBinanceOrderBook } from '@/lib/price-apis/binance';
import { getOKXOrderBook } from '@/lib/price-apis/okx';
import { getBybitOrderBook } from '@/lib/price-apis/bybit';
import { calculateVWAP } from '@/lib/analysis/vwap';
import { calculateVolumeProfile } from '@/lib/analysis/volume-profile';
import { getRealizedVolatilityFromBinance } from '@/lib/analysis/realized-volatility';

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

    // Aggrega order book
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

    // Prezzo corrente (mid-price)
    const currentPrice = (bids[0].price + asks[0].price) / 2;

    // Calcola indicatori
    const vwap = calculateVWAP(bids, asks, currentPrice);
    const volumeProfile = calculateVolumeProfile(bids, asks, currentPrice, 50);
    const realizedVol = await getRealizedVolatilityFromBinance(symbol, 30);

    return NextResponse.json({
      symbol,
      currentPrice,
      vwap,
      volumeProfile: {
        poc: volumeProfile.poc,
        valueAreaHigh: volumeProfile.valueAreaHigh,
        valueAreaLow: volumeProfile.valueAreaLow,
        totalVolume: volumeProfile.totalVolume,
        levels: volumeProfile.levels.slice(0, 20), // Top 20 livelli
      },
      realizedVolatility: realizedVol,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/indicators/solid:', error);
    return NextResponse.json(
      { error: 'Errore nel calcolo indicatori solidi' },
      { status: 500 }
    );
  }
}

