/**
 * Binance Futures API
 * 
 * Dati per trading intraday/scalping con leva:
 * - Funding rates (real-time)
 * - Open Interest
 * - Liquidations
 * - Long/Short Ratio
 */

interface BinanceFundingRate {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  estimatedSettlePrice: string;
  lastFundingRate: string;
  nextFundingTime: number;
  interestRate: string;
  nextFundingTimeStr?: string;
}

interface BinanceOpenInterest {
  symbol: string;
  openInterest: string;
  sumOpenInterest: string;
  sumOpenInterestValue: string;
}

interface BinanceLiquidation {
  symbol: string;
  price: string;
  side: 'BUY' | 'SELL';
  size: string;
  time: number;
}

/**
 * Ottiene funding rate corrente per perpetual futures
 */
export async function getBinanceFundingRate(symbol: string): Promise<{
  fundingRate: number;
  nextFundingTime: number;
  markPrice: number;
  indexPrice: number;
} | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${binanceSymbol}`,
      {
        next: { revalidate: 10 }, // Cache 10 secondi
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: BinanceFundingRate = await response.json();

    return {
      fundingRate: parseFloat(data.lastFundingRate) * 100, // In percentuale
      nextFundingTime: data.nextFundingTime,
      markPrice: parseFloat(data.markPrice),
      indexPrice: parseFloat(data.indexPrice),
    };
  } catch (error) {
    console.error(`Error fetching funding rate for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene Open Interest per futures
 */
export async function getBinanceOpenInterest(symbol: string): Promise<{
  openInterest: number;
  openInterestValue: number; // In USD
} | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/openInterest?symbol=${binanceSymbol}`,
      {
        next: { revalidate: 10 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: BinanceOpenInterest = await response.json();

    return {
      openInterest: parseFloat(data.openInterest),
      openInterestValue: parseFloat(data.sumOpenInterestValue),
    };
  } catch (error) {
    console.error(`Error fetching open interest for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene liquidazioni recenti (ultime 24h)
 * 
 * Nota: Binance non ha API pubblica per liquidazioni in tempo reale
 * Usiamo dati aggregati da fonti terze o calcoliamo da price action
 */
export async function getBinanceLiquidationsEstimate(
  symbol: string,
  currentPrice: number,
  fundingRate: number
): Promise<{
  estimatedLiquidationPriceLong: number;
  estimatedLiquidationPriceShort: number;
  liquidationRisk: 'low' | 'medium' | 'high' | 'very-high';
} | null> {
  try {
    // Stima basata su funding rate e open interest
    // Funding rate alto = molti long = rischio liquidazione long se prezzo scende
    // Funding rate negativo = molti short = rischio liquidazione short se prezzo sale
    
    let liquidationRisk: 'low' | 'medium' | 'high' | 'very-high';
    
    if (Math.abs(fundingRate) > 0.1) {
      liquidationRisk = 'very-high';
    } else if (Math.abs(fundingRate) > 0.05) {
      liquidationRisk = 'high';
    } else if (Math.abs(fundingRate) > 0.02) {
      liquidationRisk = 'medium';
    } else {
      liquidationRisk = 'low';
    }

    // Stima prezzi di liquidazione (semplificato, in produzione usare dati reali)
    // Assumiamo leverage medio 10x
    const avgLeverage = 10;
    const estimatedLiquidationPriceLong = currentPrice * (1 - 1 / avgLeverage);
    const estimatedLiquidationPriceShort = currentPrice * (1 + 1 / avgLeverage);

    return {
      estimatedLiquidationPriceLong,
      estimatedLiquidationPriceShort,
      liquidationRisk,
    };
  } catch (error) {
    console.error(`Error estimating liquidations for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene Long/Short Ratio
 */
export async function getBinanceLongShortRatio(symbol: string): Promise<{
  longShortRatio: number; // >1 = più long, <1 = più short
  longAccount: number; // % account long
  shortAccount: number; // % account short
} | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const response = await fetch(
      `https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${binanceSymbol}&period=5m`,
      {
        next: { revalidate: 10 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const latest = Array.isArray(data) ? data[data.length - 1] : data;

    if (!latest) return null;

    const longAccount = parseFloat(latest.longAccount || latest.longShortRatio || '0.5');
    const shortAccount = 1 - longAccount;
    const longShortRatio = longAccount / shortAccount;

    return {
      longShortRatio,
      longAccount: longAccount * 100,
      shortAccount: shortAccount * 100,
    };
  } catch (error) {
    console.error(`Error fetching long/short ratio for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene tutti i dati futures per una crypto
 */
export async function getBinanceFuturesData(symbol: string): Promise<{
  fundingRate: number;
  nextFundingTime: number;
  markPrice: number;
  indexPrice: number;
  openInterest: number;
  openInterestValue: number;
  longShortRatio: number;
  longAccount: number;
  shortAccount: number;
  liquidationRisk: 'low' | 'medium' | 'high' | 'very-high';
  estimatedLiquidationPriceLong: number;
  estimatedLiquidationPriceShort: number;
} | null> {
  try {
    const [funding, oi, longShort] = await Promise.all([
      getBinanceFundingRate(symbol),
      getBinanceOpenInterest(symbol),
      getBinanceLongShortRatio(symbol),
    ]);

    if (!funding || !oi || !longShort) {
      return null;
    }

    const liquidations = await getBinanceLiquidationsEstimate(
      symbol,
      funding.markPrice,
      funding.fundingRate
    );

    if (!liquidations) {
      return null;
    }

    return {
      ...funding,
      ...oi,
      ...longShort,
      ...liquidations,
    };
  } catch (error) {
    console.error(`Error fetching futures data for ${symbol}:`, error);
    return null;
  }
}

