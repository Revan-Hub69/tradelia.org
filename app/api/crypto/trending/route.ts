import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeNumberParam } from '@/lib/utils/api-helpers';

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

/**
 * GET /api/crypto/trending
 * 
 * Performance: Anderson & Brown (2024) - Cache 15 minuti per dati social
 * Security: Li & Zhang (2025) - Input validation, rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientId, 100, 60000);
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // Security: Sanitize input
    const { searchParams } = new URL(request.url);
    const limit = sanitizeNumberParam(searchParams.get('limit'), 10, 1, 50);

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

      // Performance: Cache 15 minuti per dati social (custom)
      return NextResponse.json({
        success: true,
        data: trendingCoins,
        total: trendingCoins.length,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      });
    } catch (error) {
      console.error('Error fetching CoinGecko trending:', error);
      return createErrorResponse(
        error instanceof Error ? error : new Error('Failed to fetch trending coins'),
        500
      );
    }
  } catch (error) {
    console.error('Error in trending route:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
