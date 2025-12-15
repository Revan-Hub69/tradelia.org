/**
 * Bybit Futures API Integration
 * 
 * Dati futures da Bybit:
 * - Funding rates
 * - Open Interest
 * - Long/Short Ratio
 */

export interface BybitFuturesData {
  fundingRate: number;
  fundingRatePercent: number; // Annualized
  openInterest: number;
  openInterestUsd: number;
  longShortRatio: number; // Long / Short
  nextFundingTime: number; // Timestamp
  timestamp: number;
}

/**
 * Ottiene funding rate da Bybit
 */
export async function getBybitFundingRate(symbol: string): Promise<number | null> {
  try {
    const bybitSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const response = await fetch(
      `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${bybitSymbol}`,
      { cache: 'no-store' }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.retCode !== 0 || !data.result?.list || data.result.list.length === 0) {
      return null;
    }

    const fundingRate = parseFloat(data.result.list[0].fundingRate || 0);
    return fundingRate;
  } catch (error) {
    console.error(`Error fetching Bybit funding rate for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene open interest da Bybit
 */
export async function getBybitOpenInterest(symbol: string): Promise<number | null> {
  try {
    const bybitSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const response = await fetch(
      `https://api.bybit.com/v5/market/open-interest?category=linear&symbol=${bybitSymbol}&interval=5`,
      { cache: 'no-store' }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.retCode !== 0 || !data.result?.list || data.result.list.length === 0) {
      return null;
    }

    const openInterest = parseFloat(data.result.list[0].openInterest || 0);
    return openInterest;
  } catch (error) {
    console.error(`Error fetching Bybit open interest for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene long/short ratio da Bybit
 */
export async function getBybitLongShortRatio(symbol: string): Promise<number | null> {
  try {
    const bybitSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const response = await fetch(
      `https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=${bybitSymbol}&period=5m`,
      { cache: 'no-store' }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.retCode !== 0 || !data.result?.list || data.result.list.length === 0) {
      return null;
    }

    const longRatio = parseFloat(data.result.list[0].longAccount || 0);
    const shortRatio = parseFloat(data.result.list[0].shortAccount || 0);
    
    if (shortRatio === 0) return null;
    return longRatio / shortRatio;
  } catch (error) {
    console.error(`Error fetching Bybit long/short ratio for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene tutti i dati futures da Bybit
 */
export async function getBybitFuturesData(symbol: string): Promise<BybitFuturesData | null> {
  try {
    const [fundingRate, openInterest, longShortRatio, ticker] = await Promise.allSettled([
      getBybitFundingRate(symbol),
      getBybitOpenInterest(symbol),
      getBybitLongShortRatio(symbol),
      // Get price for USD conversion
      fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol.includes('USDT') ? symbol : `${symbol}USDT`}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d?.result?.list?.[0] ? parseFloat(d.result.list[0].lastPrice) : null),
    ]);

    const funding = fundingRate.status === 'fulfilled' ? fundingRate.value : null;
    const oi = openInterest.status === 'fulfilled' ? openInterest.value : null;
    const lsr = longShortRatio.status === 'fulfilled' ? longShortRatio.value : null;
    const price = ticker.status === 'fulfilled' ? ticker.value : null;

    if (funding === null && oi === null && lsr === null) {
      return null;
    }

    return {
      fundingRate: funding || 0,
      fundingRatePercent: funding ? funding * 100 * 365 * 3 : 0, // Annualized (8h funding)
      openInterest: oi || 0,
      openInterestUsd: (oi || 0) * (price || 0),
      longShortRatio: lsr || 0,
      nextFundingTime: Date.now() + 8 * 60 * 60 * 1000, // 8 hours from now
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Bybit futures data for ${symbol}:`, error);
    return null;
  }
}

