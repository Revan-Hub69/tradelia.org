/**
 * Yahoo Finance API (Non Ufficiale)
 * Free Tier: Illimitato (ma non ufficiale)
 * Supporta: Stocks, Crypto, Forex, Commodities
 * 
 * Setup:
 * npm install yahoo-finance2
 * 
 * Nota: Yahoo Finance non ha API ufficiale, questa è una libreria
 * che fa scraping. Può essere instabile se Yahoo cambia struttura.
 */

/**
 * Ottiene prezzo corrente usando yahoo-finance2
 * 
 * Nota: Questa funzione richiede il pacchetto yahoo-finance2
 * Installare con: npm install yahoo-finance2
 */
export async function getYahooFinancePrice(symbol: string, assetType: string): Promise<number | null> {
  try {
    // Dynamic import per evitare errori se pacchetto non installato
    const yahooFinance = await import('yahoo-finance2').catch(() => null);

    if (!yahooFinance) {
      console.warn('yahoo-finance2 not installed. Install with: npm install yahoo-finance2');
      return null;
    }

    // Yahoo Finance usa simboli standard
    // Stocks: AAPL, MSFT, etc.
    // Crypto: BTC-USD, ETH-USD, etc.
    // Forex: EURUSD=X, GBPUSD=X, etc.

    let yahooSymbol = symbol;

    if (assetType === 'crypto') {
      // Converti BTC -> BTC-USD
      yahooSymbol = symbol.includes('-') ? symbol : `${symbol}-USD`;
    } else if (assetType === 'forex') {
      // Converti EURUSD -> EURUSD=X
      yahooSymbol = symbol.includes('=') ? symbol : `${symbol}=X`;
    }

    const quote = await yahooFinance.default.quote(yahooSymbol);

    if (quote && quote.regularMarketPrice) {
      return quote.regularMarketPrice;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Yahoo Finance price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Versione semplificata senza dipendenze esterne
 * Usa fetch diretto (meno affidabile ma funziona)
 */
export async function getYahooFinancePriceSimple(symbol: string, assetType: string): Promise<number | null> {
  try {
    // Yahoo Finance non ufficiale endpoint
    // Questo può essere instabile
    let yahooSymbol = symbol;

    if (assetType === 'crypto') {
      yahooSymbol = `${symbol}-USD`;
    } else if (assetType === 'forex') {
      yahooSymbol = `${symbol}=X`;
    }

    // Prova endpoint non ufficiale (può essere bloccato)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return data.chart.result[0].meta.regularMarketPrice;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Yahoo Finance price for ${symbol}:`, error);
    return null;
  }
}

