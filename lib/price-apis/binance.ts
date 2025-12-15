/**
 * Binance API Integration
 * Free Tier: 1200 API calls/minute (estremamente generoso!)
 * Supporta: Crypto only
 * 
 * Setup:
 * Nessuna registrazione necessaria per public API
 * Rate limit: 1200 calls/minuto (weight-based)
 */

interface BinanceTicker {
  symbol: string;
  price: string;
}

/**
 * Ottiene prezzo corrente di una crypto da Binance
 */
export async function getBinancePrice(symbol: string): Promise<number | null> {
  try {
    // Binance usa formato BTCUSDT, ETHUSDT, etc.
    // Se l'utente inserisce BTC, aggiungiamo USDT
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Se errore 400, prova senza USDT (potrebbe essere altcoin pair)
      if (response.status === 400 && !symbol.includes('USDT')) {
        return null; // Symbol non trovato
      }
      console.error(`Binance API error: ${response.status}`);
      return null;
    }

    const data: BinanceTicker = await response.json();

    if (data.price) {
      return parseFloat(data.price);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Binance price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene prezzo corrente con fallback a coppie alternative
 */
export async function getBinancePriceWithFallback(symbol: string): Promise<number | null> {
  // Prova prima con USDT
  let price = await getBinancePrice(symbol);
  
  if (price !== null) {
    return price;
  }

  // Se fallisce, prova con BUSD (meno comune)
  if (!symbol.includes('BUSD')) {
    price = await getBinancePrice(symbol.replace('USDT', 'BUSD'));
    if (price !== null) {
      return price;
    }
  }

  return null;
}

/**
 * Order Book Entry
 */
export interface OrderBookEntry {
  price: number;
  quantity: number;
}

/**
 * Order Book Response
 */
export interface BinanceOrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
  timestamp: number;
}

/**
 * Ottiene order book da Binance
 * @param symbol - Simbolo crypto (es. BTC, ETH)
 * @param limit - Numero di livelli (5, 10, 20, 50, 100, 500, 1000, 5000)
 * @returns Order book con bids e asks
 */
export async function getBinanceOrderBook(
  symbol: string,
  limit: number = 100
): Promise<BinanceOrderBook | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    // Binance accetta limit: 5, 10, 20, 50, 100, 500, 1000, 5000
    const validLimits = [5, 10, 20, 50, 100, 500, 1000, 5000];
    const closestLimit = validLimits.reduce((prev, curr) => 
      Math.abs(curr - limit) < Math.abs(prev - limit) ? curr : prev
    );

    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=${closestLimit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 1 }, // Cache 1 secondo
      }
    );

    if (!response.ok) {
      console.error(`Binance order book error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      bids: data.bids.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      asks: data.asks.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
      })),
      lastUpdateId: data.lastUpdateId,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Binance order book for ${symbol}:`, error);
    return null;
  }
}

