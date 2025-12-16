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

// Interface per liquidazioni (non usata direttamente, calcolata da funding rate)
// interface BinanceLiquidation {
//   symbol: string;
//   price: string;
//   side: 'BUY' | 'SELL';
//   size: string;
//   time: number;
// }

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
    const binanceSymbol = symbol.includes("USDT") ? symbol : `${symbol}USDT`;
    const url = `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${binanceSymbol}`;

    console.log(`[Binance Futures] Fetching funding rate for ${symbol} -> ${binanceSymbol} from ${url}`);

    const response = await fetch(url, {
      // Rimuoviamo la cache per debugging
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`[Binance Futures] Response status: ${response.status} for ${symbol}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error');
      console.error(`[Binance Futures] Error for ${symbol}: ${response.status} - ${response.statusText} - ${errorText}`);
      
      // 400 = symbol non esiste
      if (response.status === 400) {
        console.warn(`[Binance Futures] Symbol ${symbol} (${binanceSymbol}) non esiste su Binance Futures (400)`);
        return null; // Symbol non esiste
      }
      // Altri errori = problema temporaneo
      console.error(`[Binance Futures] API error temporaneo per ${symbol}: ${response.status}`);
      return null;
    }

    const data: BinanceFundingRate = await response.json();
    console.log(`[Binance Futures] Successfully fetched funding rate for ${symbol}:`, {
      fundingRate: data.lastFundingRate,
      markPrice: data.markPrice,
    });

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
    const binanceSymbol = symbol.includes("USDT") ? symbol : `${symbol}USDT`;

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
  liquidationRisk: "low" | "medium" | "high" | "very-high";
} | null> {
  try {
    // Stima basata su funding rate e open interest
    // Funding rate alto = molti long = rischio liquidazione long se prezzo scende
    // Funding rate negativo = molti short = rischio liquidazione short se prezzo sale

    let liquidationRisk: "low" | "medium" | "high" | "very-high";

    if (Math.abs(fundingRate) > 0.1) {
      liquidationRisk = "very-high";
    } else if (Math.abs(fundingRate) > 0.05) {
      liquidationRisk = "high";
    } else if (Math.abs(fundingRate) > 0.02) {
      liquidationRisk = "medium";
    } else {
      liquidationRisk = "low";
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
    const binanceSymbol = symbol.includes("USDT") ? symbol : `${symbol}USDT`;

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

    if (!latest) {
      return null;
    }

    const longAccount = parseFloat(latest.longAccount || latest.longShortRatio || "0.5");
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
 * Restituisce dati parziali quando possibile invece di null
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
  liquidationRisk: "low" | "medium" | "high" | "very-high";
  estimatedLiquidationPriceLong: number;
  estimatedLiquidationPriceShort: number;
  partial?: boolean; // Indica se alcuni dati mancano
} | null> {
  try {
    const [funding, oi, longShort] = await Promise.allSettled([
      getBinanceFundingRate(symbol),
      getBinanceOpenInterest(symbol),
      getBinanceLongShortRatio(symbol),
    ]);

    const fundingData = funding.status === "fulfilled" ? funding.value : null;
    const oiData = oi.status === "fulfilled" ? oi.value : null;
    const longShortData = longShort.status === "fulfilled" ? longShort.value : null;

    console.log(`[Binance Futures] Results for ${symbol}:`, {
      funding: funding.status,
      fundingData: fundingData ? 'OK' : 'NULL',
      oi: oi.status,
      oiData: oiData ? 'OK' : 'NULL',
      longShort: longShort.status,
      longShortData: longShortData ? 'OK' : 'NULL',
    });

    // Se manca funding, non possiamo procedere (serve per markPrice)
    if (!fundingData) {
      if (funding.status === 'rejected') {
        console.error(`[Binance Futures] Funding rejected for ${symbol}:`, funding.reason);
      } else {
        console.error(`[Binance Futures] Missing funding data for ${symbol} (status: ${funding.status})`);
      }
      return null;
    }

    console.log(`[Binance Futures] Successfully got futures data for ${symbol}`);

    // Usa valori di default se mancano dati
    const openInterest = oiData?.openInterest || 0;
    const openInterestValue = oiData?.openInterestValue || 0;
    const longShortRatio = longShortData?.longShortRatio || 1;
    const longAccount = longShortData?.longAccount || 50;
    const shortAccount = longShortData?.shortAccount || 50;

    // Calcola liquidazioni (sempre possibile se abbiamo funding)
    const liquidations = await getBinanceLiquidationsEstimate(
      symbol,
      fundingData.markPrice,
      fundingData.fundingRate
    );

    if (!liquidations) {
      // Fallback con valori di default
      const avgLeverage = 10;
      return {
        ...fundingData,
        openInterest,
        openInterestValue,
        longShortRatio,
        longAccount,
        shortAccount,
        liquidationRisk: "medium" as const,
        estimatedLiquidationPriceLong: fundingData.markPrice * (1 - 1 / avgLeverage),
        estimatedLiquidationPriceShort: fundingData.markPrice * (1 + 1 / avgLeverage),
        partial: !oiData || !longShortData,
      };
    }

    return {
      ...fundingData,
      openInterest,
      openInterestValue,
      longShortRatio,
      longAccount,
      shortAccount,
      ...liquidations,
      partial: !oiData || !longShortData,
    };
  } catch (error) {
    console.error(`Error fetching futures data for ${symbol}:`, error);
    return null;
  }
}
