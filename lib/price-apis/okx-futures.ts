/**
 * OKX Futures API Integration
 * 
 * Dati futures da OKX:
 * - Funding rates
 * - Open Interest
 * - Long/Short Ratio
 */

export interface OKXFuturesData {
  fundingRate: number;
  fundingRatePercent: number; // Annualized
  openInterest: number;
  openInterestUsd: number;
  longShortRatio: number; // Long / Short
  nextFundingTime: number; // Timestamp
  timestamp: number;
}

/**
 * Ottiene funding rate da OKX
 */
export async function getOKXFundingRate(symbol: string): Promise<number | null> {
  try {
    const okxSymbol = symbol.includes('-') ? symbol : `${symbol}-USDT`;
    const swapSymbol = `${okxSymbol}-SWAP`;
    
    const response = await fetch(
      `https://www.okx.com/api/v5/public/funding-rate?instId=${swapSymbol}`,
      { cache: 'no-store' }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== '0' || !data.data || data.data.length === 0) {
      return null;
    }

    const fundingRate = parseFloat(data.data[0].fundingRate || 0);
    return fundingRate;
  } catch (error) {
    console.error(`Error fetching OKX funding rate for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene open interest da OKX
 */
export async function getOKXOpenInterest(symbol: string): Promise<number | null> {
  try {
    const okxSymbol = symbol.includes('-') ? symbol : `${symbol}-USDT`;
    const swapSymbol = `${okxSymbol}-SWAP`;
    
    const response = await fetch(
      `https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=${swapSymbol}`,
      { cache: 'no-store' }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== '0' || !data.data || data.data.length === 0) {
      return null;
    }

    const openInterest = parseFloat(data.data[0].oi || 0);
    return openInterest;
  } catch (error) {
    console.error(`Error fetching OKX open interest for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene long/short ratio da OKX
 */
export async function getOKXLongShortRatio(symbol: string): Promise<number | null> {
  try {
    const okxSymbol = symbol.includes('-') ? symbol : `${symbol}-USDT`;
    const swapSymbol = `${okxSymbol}-SWAP`;
    
    const response = await fetch(
      `https://www.okx.com/api/v5/public/long-short-account-ratio?instId=${swapSymbol}`,
      { cache: 'no-store' }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== '0' || !data.data || data.data.length === 0) {
      return null;
    }

    const longRatio = parseFloat(data.data[0].longRatio || 0);
    const shortRatio = parseFloat(data.data[0].shortRatio || 0);
    
    if (shortRatio === 0) return null;
    return longRatio / shortRatio;
  } catch (error) {
    console.error(`Error fetching OKX long/short ratio for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene tutti i dati futures da OKX
 */
export async function getOKXFuturesData(symbol: string): Promise<OKXFuturesData | null> {
  try {
    const [fundingRate, openInterest, longShortRatio, ticker] = await Promise.allSettled([
      getOKXFundingRate(symbol),
      getOKXOpenInterest(symbol),
      getOKXLongShortRatio(symbol),
      // Get price for USD conversion
      fetch(`https://www.okx.com/api/v5/market/ticker?instId=${symbol.includes('-') ? symbol : `${symbol}-USDT`}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d?.data?.[0] ? parseFloat(d.data[0].last) : null),
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
    console.error(`Error fetching OKX futures data for ${symbol}:`, error);
    return null;
  }
}

