import { NextResponse } from 'next/server';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

interface TrendingData {
  coins: TrendingCoin[];
  exchanges: unknown[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const url = `${COINGECKO_BASE_URL}/search/trending`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json() as TrendingData;

      // Get detailed price data for trending coins
      const coinIds = data.coins.slice(0, limit).map(coin => coin.item.id);
      const priceUrl = `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;

      const priceResponse = await fetch(priceUrl);
      if (!priceResponse.ok) {
        throw new Error(`CoinGecko price API error: ${priceResponse.status}`);
      }

      const priceData = await priceResponse.json() as Record<string, {
        usd: number;
        usd_24h_change: number;
        usd_24h_vol: number;
        usd_market_cap: number;
      }>;

      // Combine trending data with price data
      const trendingCoins = data.coins.slice(0, limit).map(coin => {
        const priceInfo = priceData[coin.item.id];
        return {
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol.toUpperCase(),
          marketCapRank: coin.item.market_cap_rank,
          image: coin.item.large || coin.item.small || coin.item.thumb,
          price: priceInfo?.usd || 0,
          priceChange24h: priceInfo?.usd_24h_change || 0,
          volume24h: priceInfo?.usd_24h_vol || 0,
          marketCap: priceInfo?.usd_market_cap || 0,
          score: coin.item.score,
          priceBtc: coin.item.price_btc,
        };
      });

      return NextResponse.json({
        success: true,
        data: trendingCoins,
        total: trendingCoins.length,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800', // 15 min cache
        },
      });
    } catch (error) {
      console.error('Error fetching CoinGecko trending:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch trending coins',
          data: [],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in trending route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch trending coins',
        data: [],
      },
      { status: 500 }
    );
  }
}
