/**
 * Binance Futures API Integration
 * 
 * Dati futures: Funding Rates, Open Interest, Liquidazioni
 * 
 * Docs: https://binance-docs.github.io/apidocs/futures/en/
 */

export interface FundingRate {
  symbol: string;
  fundingRate: number; // Rate in percentuale (es. 0.01 = 0.01%)
  fundingRatePercent: number; // Rate * 100 per display
  nextFundingTime: number; // Timestamp prossimo funding
  markPrice: number;
}

export interface OpenInterest {
  symbol: string;
  openInterest: number; // OI in USD
  openInterestValue: number; // OI in contratto base
  timestamp: number;
}

export interface LiquidationData {
  symbol: string;
  longLiquidations: number; // USD
  shortLiquidations: number; // USD
  totalLiquidations: number; // USD
  timestamp: number;
}

/**
 * Ottiene funding rate corrente
 */
export async function getBinanceFundingRate(symbol: string): Promise<FundingRate | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${binanceSymbol}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }, // Cache 30 secondi (funding cambia ogni 8h)
      }
    );

    if (!response.ok) {
      console.error(`Binance futures funding error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      symbol: data.symbol,
      fundingRate: parseFloat(data.lastFundingRate),
      fundingRatePercent: parseFloat(data.lastFundingRate) * 100,
      nextFundingTime: data.nextFundingTime,
      markPrice: parseFloat(data.markPrice),
    };
  } catch (error) {
    console.error(`Error fetching Binance funding rate for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene Open Interest
 */
export async function getBinanceOpenInterest(symbol: string): Promise<OpenInterest | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/openInterest?symbol=${binanceSymbol}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 10 }, // Cache 10 secondi
      }
    );

    if (!response.ok) {
      console.error(`Binance futures OI error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Ottieni anche il prezzo per calcolare valore in USD
    const markPriceResponse = await fetch(
      `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${binanceSymbol}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 10 },
      }
    );

    let markPrice = 0;
    if (markPriceResponse.ok) {
      const markData = await markPriceResponse.json();
      markPrice = parseFloat(markData.markPrice);
    }

    return {
      symbol: data.symbol,
      openInterest: parseFloat(data.openInterest) * markPrice, // Valore in USD
      openInterestValue: parseFloat(data.openInterest), // Valore in contratto
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Binance OI for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene dati liquidazioni (ultime 24h)
 * Nota: Binance non ha API diretta, usiamo stima da Coinglass o calcoliamo da altri dati
 */
export async function getBinanceLiquidations(symbol: string): Promise<LiquidationData | null> {
  try {
    // Binance non espone liquidazioni direttamente via API pubblica
    // Possiamo usare Coinglass API (gratuita con limiti) o stimare da altri dati
    // Per ora ritorniamo null e implementeremo Coinglass dopo
    
    // TODO: Integrare Coinglass API per liquidazioni reali
    return null;
  } catch (error) {
    console.error(`Error fetching Binance liquidations for ${symbol}:`, error);
    return null;
  }
}

