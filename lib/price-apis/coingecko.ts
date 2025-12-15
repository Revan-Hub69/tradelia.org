/**
 * CoinGecko API - Market Cap e Dati Completi
 * 
 * API gratuita con rate limit generoso
 * https://www.coingecko.com/en/api
 */

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
}

interface CoinGeckoMarketData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCapChange24h: number;
  marketCapChangePercent24h: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  ath: number;
  athChangePercent: number;
  atl: number;
  atlChangePercent: number;
}

/**
 * Ottiene top N crypto per market cap da CoinGecko
 */
export async function getTopCryptoByMarketCap(
  limit: number = 50,
  vsCurrency: string = 'usd'
): Promise<CoinGeckoMarketData[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h%2C7d%2C30d`,
      {
        next: { revalidate: 60 }, // Cache 1 minuto
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoCoin[] = await response.json();

    return data.map((coin) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      volume24h: coin.total_volume,
      priceChange24h: coin.price_change_24h,
      priceChangePercent24h: coin.price_change_percentage_24h,
      marketCapChange24h: coin.market_cap_change_24h,
      marketCapChangePercent24h: coin.market_cap_change_percentage_24h,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      maxSupply: coin.max_supply,
      ath: coin.ath,
      athChangePercent: coin.ath_change_percentage,
      atl: coin.atl,
      atlChangePercent: coin.atl_change_percentage,
    }));
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return [];
  }
}

/**
 * Ottiene dati storici market cap per una crypto
 */
export async function getMarketCapHistory(
  coinId: string,
  days: number = 30,
  vsCurrency: string = 'usd'
): Promise<Array<{ timestamp: number; marketCap: number; price: number }>> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=daily`,
      {
        next: { revalidate: 3600 }, // Cache 1 ora
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const marketCaps = data.market_caps || [];
    const prices = data.prices || [];

    return marketCaps.map((mc: [number, number], i: number) => ({
      timestamp: mc[0],
      marketCap: mc[1],
      price: prices[i]?.[1] || 0,
    }));
  } catch (error) {
    console.error(`Error fetching market cap history for ${coinId}:`, error);
    return [];
  }
}

/**
 * Mappa simboli crypto a CoinGecko IDs
 */
export const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  TRX: 'tron',
  AVAX: 'avalanche-2',
  SHIB: 'shiba-inu',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  ETC: 'ethereum-classic',
  LTC: 'litecoin',
  NEAR: 'near',
  XLM: 'stellar',
  ALGO: 'algorand',
};

