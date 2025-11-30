/**
 * Price API Manager
 * Gestisce multiple API con fallback automatico
 * 
 * Strategia:
 * 1. Finnhub (stocks/forex) - 60 calls/min
 * 2. Binance (crypto) - 1200 calls/min
 * 3. Yahoo Finance (fallback) - illimitato
 */

import { getFinnhubStockPrice, getFinnhubCryptoPrice, getFinnhubForexPrice } from './finnhub';
import { getBinancePriceWithFallback } from './binance';
import { getYahooFinancePriceSimple } from './yahoo-finance';

interface PriceResult {
  price: number | null;
  source: 'finnhub' | 'binance' | 'yahoo' | null;
  error?: string;
}

/**
 * Ottiene prezzo corrente con fallback automatico
 */
export async function getCurrentPrice(
  symbol: string,
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity' | 'other'
): Promise<PriceResult> {
  // 1. Prova provider principale in base al tipo
  if (assetType === 'crypto') {
    // Crypto: Prova Binance (molto generoso)
    const binancePrice = await getBinancePriceWithFallback(symbol);
    if (binancePrice !== null) {
      return { price: binancePrice, source: 'binance' };
    }

    // Fallback: Finnhub crypto
    const finnhubPrice = await getFinnhubCryptoPrice(symbol);
    if (finnhubPrice !== null) {
      return { price: finnhubPrice, source: 'finnhub' };
    }
  } else if (assetType === 'forex') {
    // Forex: Prova Finnhub
    const finnhubPrice = await getFinnhubForexPrice(symbol);
    if (finnhubPrice !== null) {
      return { price: finnhubPrice, source: 'finnhub' };
    }
  } else {
    // Stocks: Prova Finnhub (60 calls/min, molto generoso)
    const finnhubPrice = await getFinnhubStockPrice(symbol);
    if (finnhubPrice !== null) {
      return { price: finnhubPrice, source: 'finnhub' };
    }
  }

  // 2. Fallback: Yahoo Finance (illimitato, ma non ufficiale)
  const yahooPrice = await getYahooFinancePriceSimple(symbol, assetType);
  if (yahooPrice !== null) {
    return { price: yahooPrice, source: 'yahoo' };
  }

  // 3. Tutti i provider hanno fallito
  return {
    price: null,
    source: null,
    error: 'Impossibile ottenere prezzo da nessun provider',
  };
}

/**
 * Ottiene prezzo con cache (5 minuti)
 */
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

export async function getCurrentPriceCached(
  symbol: string,
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity' | 'other'
): Promise<PriceResult> {
  const cacheKey = `${symbol}-${assetType}`;
  const cached = priceCache.get(cacheKey);

  // Se cache valida, ritorna cached
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { price: cached.price, source: 'finnhub' }; // Source non importante per cache
  }

  // Ottieni prezzo fresco
  const result = await getCurrentPrice(symbol, assetType);

  // Salva in cache se successo
  if (result.price !== null) {
    priceCache.set(cacheKey, {
      price: result.price,
      timestamp: Date.now(),
    });
  }

  return result;
}

