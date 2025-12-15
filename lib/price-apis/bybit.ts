/**
 * Bybit API Integration
 * Free Tier: Public API senza autenticazione
 * Rate limit: 120 requests per minute per IP
 * Supporta: Crypto order book
 * 
 * Docs: https://bybit-exchange.github.io/docs/v5/
 */

import { OrderBookEntry, BinanceOrderBook } from './binance';

/**
 * Ottiene order book da Bybit
 * @param symbol - Simbolo crypto (es. BTC, ETH)
 * @param limit - Numero di livelli (1-200)
 * @returns Order book con bids e asks
 */
export async function getBybitOrderBook(
  symbol: string,
  limit: number = 100
): Promise<BinanceOrderBook | null> {
  try {
    // Bybit usa formato BTCUSDT, ETHUSDT (come Binance)
    const bybitSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

    // Bybit accetta limit: 1-200
    const validLimit = Math.min(Math.max(limit, 1), 200);

    const response = await fetch(
      `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${bybitSymbol}&limit=${validLimit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 1 }, // Cache 1 secondo
      }
    );

    if (!response.ok) {
      console.error(`Bybit order book error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.retCode !== 0 || !data.result) {
      console.error(`Bybit API error: ${data.retMsg || 'No data'}`);
      return null;
    }

    const bookData = data.result;

    return {
      bids: bookData.b.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      asks: bookData.a.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      lastUpdateId: parseInt(bookData.u || '0'),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Bybit order book for ${symbol}:`, error);
    return null;
  }
}

