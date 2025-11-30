/**
 * Finnhub API Integration
 * Free Tier: 60 API calls/minute
 * Supporta: Stocks, Forex, Crypto
 * 
 * Setup:
 * 1. Registrati su https://finnhub.io
 * 2. Ottieni API key gratuita
 * 3. Aggiungi a .env: FINNHUB_API_KEY=your_key_here
 */

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

/**
 * Ottiene prezzo corrente di uno stock
 */
export async function getFinnhubStockPrice(symbol: string): Promise<number | null> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.warn('FINNHUB_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status}`);
      return null;
    }

    const data: FinnhubQuote = await response.json();

    if (data.c && data.c > 0) {
      return data.c;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Finnhub price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene prezzo corrente di una crypto
 * Nota: Finnhub supporta crypto ma con simboli specifici (es. BINANCE:BTCUSDT)
 */
export async function getFinnhubCryptoPrice(symbol: string): Promise<number | null> {
  // Finnhub usa formato BINANCE:BTCUSDT per crypto
  const finnhubSymbol = symbol.includes(':') ? symbol : `BINANCE:${symbol}USDT`;
  
  return getFinnhubStockPrice(finnhubSymbol);
}

/**
 * Ottiene prezzo corrente di forex
 * Nota: Finnhub usa formato OANDA:EUR_USD
 */
export async function getFinnhubForexPrice(symbol: string): Promise<number | null> {
  // Converti EURUSD -> OANDA:EUR_USD
  const forexSymbol = symbol.length === 6 
    ? `OANDA:${symbol.slice(0, 3)}_${symbol.slice(3)}`
    : symbol;
  
  return getFinnhubStockPrice(forexSymbol);
}

