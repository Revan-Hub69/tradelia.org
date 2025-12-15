import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

const BINANCE_BASE = 'https://api.binance.com/api/v3';
const COINBASE_BASE = 'https://api.exchange.coinbase.com';
const KRAKEN_BASE = 'https://api.kraken.com/0/public';
const OKX_BASE = 'https://www.okx.com/api/v5';

interface OrderBookLevel {
  price: number;
  quantity: number;
}

interface ExchangeDepth {
  exchange: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

async function fetchBinanceDepth(symbol: string, limit: number = 400): Promise<ExchangeDepth | null> {
  try {
    const binanceSymbol = symbol.replace('USDT', 'USDT');
    const url = `${BINANCE_BASE}/depth?symbol=${binanceSymbol}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    return {
      exchange: 'Binance',
      bids: data.bids.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      asks: data.asks.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching Binance depth:', error);
    return null;
  }
}

async function fetchCoinbaseDepth(symbol: string, level: number = 3): Promise<ExchangeDepth | null> {
  try {
    const coinbaseSymbol = symbol.replace('USDT', 'USD');
    const url = `${COINBASE_BASE}/products/${coinbaseSymbol}/book?level=${level}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    return {
      exchange: 'Coinbase',
      bids: (data.bids || []).slice(0, 400).map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      asks: (data.asks || []).slice(0, 400).map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching Coinbase depth:', error);
    return null;
  }
}

async function fetchKrakenDepth(symbol: string): Promise<ExchangeDepth | null> {
  try {
    // Kraken uses different symbol format
    const krakenSymbol = symbol === 'BTCUSDT' ? 'XBTUSD' : symbol.replace('USDT', 'USD');
    const url = `${KRAKEN_BASE}/Depth?pair=${krakenSymbol}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    const pairData = data.result?.[Object.keys(data.result)[0]];

    if (!pairData) return null;

    return {
      exchange: 'Kraken',
      bids: (pairData.bids || []).slice(0, 400).map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      asks: (pairData.asks || []).slice(0, 400).map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching Kraken depth:', error);
    return null;
  }
}

async function fetchOKXDepth(symbol: string, sz: number = 400): Promise<ExchangeDepth | null> {
  try {
    const okxSymbol = `${symbol.replace('USDT', '')}-USDT-SWAP`;
    const url = `${OKX_BASE}/market/books?instId=${okxSymbol}&sz=${sz}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    const bookData = data.data?.[0];

    if (!bookData) return null;

    return {
      exchange: 'OKX',
      bids: (bookData.bids || []).map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      asks: (bookData.asks || []).map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching OKX depth:', error);
    return null;
  }
}

function aggregateOrderBook(exchanges: ExchangeDepth[]): {
  aggregatedBids: OrderBookLevel[];
  aggregatedAsks: OrderBookLevel[];
} {
  const bidMap = new Map<number, number>();
  const askMap = new Map<number, number>();

  // Aggregate bids and asks from all exchanges
  exchanges.forEach(exchange => {
    exchange.bids.forEach(({ price, quantity }) => {
      const roundedPrice = Math.round(price * 100) / 100; // Round to 2 decimals
      bidMap.set(roundedPrice, (bidMap.get(roundedPrice) || 0) + quantity);
    });

    exchange.asks.forEach(({ price, quantity }) => {
      const roundedPrice = Math.round(price * 100) / 100;
      askMap.set(roundedPrice, (askMap.get(roundedPrice) || 0) + quantity);
    });
  });

  // Convert to arrays and sort
  const aggregatedBids = Array.from(bidMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 400);

  const aggregatedAsks = Array.from(askMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => a.price - b.price)
    .slice(0, 400);

  return { aggregatedBids, aggregatedAsks };
}

/**
 * GET /api/crypto/multi-exchange-depth
 * 
 * Performance: Anderson & Brown (2024) - Cache 30 secondi per dati real-time
 * Security: Li & Zhang (2025) - Input validation, rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Rate limiting (lower limit for heavy endpoint)
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientId, 50, 60000);
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // Security: Sanitize input
    const { searchParams } = new URL(request.url);
    const symbol = sanitizeQueryParam(searchParams.get('symbol'), 'BTCUSDT');

    // Fetch from all exchanges in parallel
    const [binance, coinbase, kraken, okx] = await Promise.all([
      fetchBinanceDepth(symbol),
      fetchCoinbaseDepth(symbol),
      fetchKrakenDepth(symbol),
      fetchOKXDepth(symbol),
    ]);

    const exchanges = [binance, coinbase, kraken, okx].filter(
      (e): e is ExchangeDepth => e !== null
    );

    if (exchanges.length === 0) {
      return createErrorResponse(
        'No exchange data available',
        500
      );
    }

    // Aggregate order books
    const { aggregatedBids, aggregatedAsks } = aggregateOrderBook(exchanges);

    // Calculate total volumes
    const totalBidVolume = aggregatedBids.reduce((sum, level) => sum + level.quantity, 0);
    const totalAskVolume = aggregatedAsks.reduce((sum, level) => sum + level.quantity, 0);
    const imbalance = totalBidVolume > 0 && totalAskVolume > 0
      ? ((totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume)) * 100
      : 0;

    // Performance: Cache 30 secondi per dati real-time (custom)
    return NextResponse.json({
      success: true,
      data: {
        symbol,
        exchanges: exchanges.map(e => ({
          name: e.exchange,
          bidCount: e.bids.length,
          askCount: e.asks.length,
          totalBidVolume: e.bids.reduce((sum, level) => sum + level.quantity, 0),
          totalAskVolume: e.asks.reduce((sum, level) => sum + level.quantity, 0),
        })),
        aggregated: {
          bids: aggregatedBids,
          asks: aggregatedAsks,
          totalBidVolume,
          totalAskVolume,
          imbalance: Math.round(imbalance * 100) / 100,
        },
        timestamp: Date.now(),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    });
  } catch (error) {
    console.error('Error in multi-exchange depth route:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Failed to fetch multi-exchange depth'),
      500
    );
  }
}
