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

