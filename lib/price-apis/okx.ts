/**
 * OKX API Integration
 * Free Tier: Public API senza autenticazione
 * Rate limit: 20 requests per 2 seconds per IP
 * Supporta: Crypto order book
 * 
 * Docs: https://www.okx.com/docs-v5/en/
 */

import { OrderBookEntry, BinanceOrderBook } from './binance';

/**
 * Ottiene order book da OKX
 * @param symbol - Simbolo crypto (es. BTC, ETH)
 * @param limit - Numero di livelli (1-400)
 * @returns Order book con bids e asks
 */
export async function getOKXOrderBook(
  symbol: string,
  limit: number = 100
): Promise<BinanceOrderBook | null> {
  try {
    // OKX usa formato BTC-USDT, ETH-USDT
    const okxSymbol = symbol.includes('-') 
      ? symbol 
      : `${symbol}-USDT`;

    // OKX accetta limit: 1-400
    const validLimit = Math.min(Math.max(limit, 1), 400);

    const response = await fetch(
      `https://www.okx.com/api/v5/market/books?instId=${okxSymbol}&sz=${validLimit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 1 }, // Cache 1 secondo
      }
    );

    if (!response.ok) {
      console.error(`OKX order book error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.code !== '0' || !data.data || data.data.length === 0) {
      console.error(`OKX API error: ${data.msg || 'No data'}`);
      return null;
    }

    const bookData = data.data[0];

    return {
      bids: bookData.bids.map(([price, qty, ...rest]: [string, string, ...any[]]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      asks: bookData.asks.map(([price, qty, ...rest]: [string, string, ...any[]]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      lastUpdateId: parseInt(bookData.ts || '0'),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching OKX order book for ${symbol}:`, error);
    return null;
  }
}

