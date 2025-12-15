/**
 * Volume Aggregator
 * 
 * Aggrega volumi da multiple exchange per avere volume totale accurato
 * 
 * Exchange supportati:
 * - Binance (spot + futures)
 * - OKX (spot + futures)
 * - Bybit (spot + futures)
 * - CoinGecko (aggregato)
 */

export interface ExchangeVolume {
  exchange: string;
  spotVolume24h: number;
  futuresVolume24h: number;
  totalVolume24h: number;
  volumeChange24h: number; // %
  timestamp: number;
}

export interface AggregatedVolume {
  totalSpotVolume24h: number;
  totalFuturesVolume24h: number;
  totalVolume24h: number;
  volumeChange24h: number; // %
  exchanges: ExchangeVolume[];
  spotVsFuturesRatio: number; // spot / futures
  topExchange: string;
  timestamp: number;
}

/**
 * Ottiene volume da Binance
 */
async function getBinanceVolume(symbol: string): Promise<ExchangeVolume | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    // Spot volume
    const spotRes = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`
    );
    if (!spotRes.ok) return null;
    const spotData = await spotRes.json();
    
    // Futures volume
    const futuresRes = await fetch(
      `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${binanceSymbol}`
    );
    const futuresData = futuresRes.ok ? await futuresRes.json() : null;
    
    const spotVolume = parseFloat(spotData.quoteVolume || 0); // USDT volume
    const futuresVolume = futuresData ? parseFloat(futuresData.quoteVolume || 0) : 0;
    
    return {
      exchange: 'Binance',
      spotVolume24h: spotVolume,
      futuresVolume24h: futuresVolume,
      totalVolume24h: spotVolume + futuresVolume,
      volumeChange24h: 0, // Would need historical data
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Binance volume for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene volume da OKX
 */
async function getOKXVolume(symbol: string): Promise<ExchangeVolume | null> {
  try {
    const okxSymbol = symbol.includes('USDT') ? symbol : `${symbol}-USDT`;
    
    // Spot volume
    const spotRes = await fetch(
      `https://www.okx.com/api/v5/market/ticker?instId=${okxSymbol}`
    );
    if (!spotRes.ok) return null;
    const spotData = await spotRes.json();
    
    // Futures volume
    const futuresRes = await fetch(
      `https://www.okx.com/api/v5/market/ticker?instId=${okxSymbol}-SWAP`
    );
    const futuresData = futuresRes.ok ? await futuresRes.json() : null;
    
    const spotVolume = spotData.data?.[0] ? parseFloat(spotData.data[0].vol24h || 0) * parseFloat(spotData.data[0].last || 0) : 0;
    const futuresVolume = futuresData?.data?.[0] ? parseFloat(futuresData.data[0].vol24h || 0) * parseFloat(futuresData.data[0].last || 0) : 0;
    
    return {
      exchange: 'OKX',
      spotVolume24h: spotVolume,
      futuresVolume24h: futuresVolume,
      totalVolume24h: spotVolume + futuresVolume,
      volumeChange24h: 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching OKX volume for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene volume da Bybit
 */
async function getBybitVolume(symbol: string): Promise<ExchangeVolume | null> {
  try {
    const bybitSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    // Spot volume
    const spotRes = await fetch(
      `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${bybitSymbol}`
    );
    if (!spotRes.ok) return null;
    const spotData = await spotRes.json();
    
    // Futures volume
    const futuresRes = await fetch(
      `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${bybitSymbol}`
    );
    const futuresData = futuresRes.ok ? await futuresRes.json() : null;
    
    const spotVolume = spotData.result?.list?.[0] ? parseFloat(spotData.result.list[0].turnover24h || 0) : 0;
    const futuresVolume = futuresData?.result?.list?.[0] ? parseFloat(futuresData.result.list[0].turnover24h || 0) : 0;
    
    return {
      exchange: 'Bybit',
      spotVolume24h: spotVolume,
      futuresVolume24h: futuresVolume,
      totalVolume24h: spotVolume + futuresVolume,
      volumeChange24h: 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Bybit volume for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene volume aggregato da CoinGecko
 */
async function getCoinGeckoVolume(symbol: string): Promise<number | null> {
  try {
    // CoinGecko usa ID invece di symbol
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_vol=true`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const coinData = data[symbol.toLowerCase()];
    return coinData?.usd_24h_vol || null;
  } catch (error) {
    console.error(`Error fetching CoinGecko volume for ${symbol}:`, error);
    return null;
  }
}

/**
 * Aggrega volumi da tutti gli exchange
 */
export async function aggregateVolume(symbol: string): Promise<AggregatedVolume | null> {
  try {
    const [binance, okx, bybit, coingecko] = await Promise.allSettled([
      getBinanceVolume(symbol),
      getOKXVolume(symbol),
      getBybitVolume(symbol),
      getCoinGeckoVolume(symbol),
    ]);

    const exchanges: ExchangeVolume[] = [];
    
    if (binance.status === 'fulfilled' && binance.value) {
      exchanges.push(binance.value);
    }
    if (okx.status === 'fulfilled' && okx.value) {
      exchanges.push(okx.value);
    }
    if (bybit.status === 'fulfilled' && bybit.value) {
      exchanges.push(bybit.value);
    }

    const totalSpotVolume = exchanges.reduce((sum, e) => sum + e.spotVolume24h, 0);
    const totalFuturesVolume = exchanges.reduce((sum, e) => sum + e.futuresVolume24h, 0);
    const totalVolume = totalSpotVolume + totalFuturesVolume;

    // CoinGecko come riferimento per validazione
    const coingeckoVolume = coingecko.status === 'fulfilled' && coingecko.value ? coingecko.value : null;
    
    // Se CoinGecko è disponibile e molto diverso, usalo come fallback
    const finalTotalVolume = coingeckoVolume && Math.abs(coingeckoVolume - totalVolume) / coingeckoVolume > 0.5
      ? coingeckoVolume
      : totalVolume;

    const topExchange = exchanges.length > 0
      ? exchanges.reduce((max, e) => e.totalVolume24h > max.totalVolume24h ? e : max, exchanges[0]).exchange
      : 'Unknown';

    return {
      totalSpotVolume24h: totalSpotVolume,
      totalFuturesVolume24h: totalFuturesVolume,
      totalVolume24h: finalTotalVolume,
      volumeChange24h: 0, // Would need historical data
      exchanges,
      spotVsFuturesRatio: totalFuturesVolume > 0 ? totalSpotVolume / totalFuturesVolume : 0,
      topExchange,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error aggregating volume for ${symbol}:`, error);
    return null;
  }
}

