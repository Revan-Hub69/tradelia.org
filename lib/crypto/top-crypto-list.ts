/**
 * Top Cryptocurrencies List
 * 
 * Fetch dinamico delle top crypto da CoinGecko
 * Supporta top 50, 100, 200, etc.
 * 
 * API: CoinGecko (free, 50 calls/min)
 */

export interface CryptoInfo {
  id: string;
  symbol: string;
  name: string;
  marketCap: number;
  marketCapRank: number;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  availableOnBinance?: boolean; // Verificato separatamente
}

/**
 * Fetch top N cryptocurrencies da CoinGecko
 * 
 * @param limit - Numero di crypto da fetchare (default: 50)
 * @returns Array di crypto info ordinate per market cap
 */
export async function getTopCryptocurrencies(
  limit = 50
): Promise<CryptoInfo[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`,
      {
        next: { revalidate: 300 }, // Cache 5 minuti
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      marketCap: coin.market_cap || 0,
      marketCapRank: coin.market_cap_rank || 999,
      price: coin.current_price || 0,
      priceChange24h: coin.price_change_24h || 0,
      priceChangePercent24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
    }));
  } catch (error) {
    console.error('Error fetching top cryptocurrencies:', error);
    // Fallback a lista hardcoded
    return getHardcodedTopCrypto();
  }
}

/**
 * Verifica se una crypto è disponibile su Binance
 * 
 * @param symbol - Crypto symbol (e.g., 'BTC', 'ETH')
 * @returns true se disponibile su Binance
 */
export async function isAvailableOnBinance(symbol: string): Promise<boolean> {
  try {
    const binanceSymbol = `${symbol}USDT`;
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
      {
        next: { revalidate: 3600 }, // Cache 1 ora
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Ottiene lista top crypto disponibili su Binance
 * 
 * @param limit - Numero di crypto (default: 50)
 * @returns Array di crypto disponibili su Binance
 */
export async function getTopBinanceCryptocurrencies(
  limit = 50
): Promise<CryptoInfo[]> {
  const allCrypto = await getTopCryptocurrencies(limit * 2); // Fetch più per avere abbastanza dopo filtro

  // Verifica disponibilità su Binance (in batch per performance)
  const availabilityChecks = await Promise.allSettled(
    allCrypto.map((crypto) =>
      isAvailableOnBinance(crypto.symbol).then((available) => ({
        crypto,
        available,
      }))
    )
  );

  const availableCrypto = availabilityChecks
    .filter((result) => result.status === 'fulfilled' && result.value.available)
    .map((result) => (result as PromiseFulfilledResult<{ crypto: CryptoInfo; available: boolean }>).value.crypto)
    .slice(0, limit);

  return availableCrypto;
}

/**
 * Lista hardcoded fallback (top 15)
 */
function getHardcodedTopCrypto(): CryptoInfo[] {
  return [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', marketCap: 0, marketCapRank: 1, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', marketCap: 0, marketCapRank: 2, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', marketCap: 0, marketCapRank: 3, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'solana', symbol: 'SOL', name: 'Solana', marketCap: 0, marketCapRank: 4, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', marketCap: 0, marketCapRank: 5, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', marketCap: 0, marketCapRank: 6, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', marketCap: 0, marketCapRank: 7, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', marketCap: 0, marketCapRank: 8, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', marketCap: 0, marketCapRank: 9, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', marketCap: 0, marketCapRank: 10, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', marketCap: 0, marketCapRank: 11, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', marketCap: 0, marketCapRank: 12, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', marketCap: 0, marketCapRank: 13, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', marketCap: 0, marketCapRank: 14, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
    { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', marketCap: 0, marketCapRank: 15, price: 0, priceChange24h: 0, priceChangePercent24h: 0, volume24h: 0 },
  ];
}

