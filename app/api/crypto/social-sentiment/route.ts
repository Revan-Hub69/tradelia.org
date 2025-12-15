import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

const SANTIMENT_API_KEY = process.env.SANTIMENT_API_KEY;
const SANTIMENT_BASE_URL = 'https://api.santiment.net/graphql';

interface SocialSentimentData {
  asset: string;
  sentiment: number; // -100 to +100
  socialVolume: number;
  socialDominance: number;
  timestamp: number;
}

const SENTIMENT_QUERY = `
  query GetSocialSentiment($slug: String!, $from: DateTime!, $to: DateTime!) {
    getMetric(metric: "sentiment_positive_total") {
      timeseriesData(
        slug: $slug
        from: $from
        to: $to
        interval: "1d"
      ) {
        datetime
        value
      }
    }
    getMetric(metric: "sentiment_negative_total") {
      timeseriesData(
        slug: $slug
        from: $from
        to: $to
        interval: "1d"
      ) {
        datetime
        value
      }
    }
    getMetric(metric: "social_volume_total") {
      timeseriesData(
        slug: $slug
        from: $from
        to: $to
        interval: "1d"
      ) {
        datetime
        value
      }
    }
  }
`;

const SLUG_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'ADA': 'cardano',
  'XRP': 'ripple',
  'DOT': 'polkadot',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network',
  'LTC': 'litecoin',
};

/**
 * GET /api/crypto/social-sentiment
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati social
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
    const asset = sanitizeQueryParam(searchParams.get('asset'), 'BTC');
    const slug = SLUG_MAP[asset.toUpperCase()] || 'bitcoin';

    if (!SANTIMENT_API_KEY) {
      return createErrorResponse(
        'SANTIMENT_API_KEY not configured. Please configure the API key in environment variables.',
        503
      );
    }

    // Calculate date range (last 7 days)
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);

    try {
      const response = await fetch(SANTIMENT_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${SANTIMENT_API_KEY}`,
        },
        body: JSON.stringify({
          query: SENTIMENT_QUERY,
          variables: {
            slug,
            from: from.toISOString(),
            to: to.toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Santiment API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`Santiment GraphQL error: ${JSON.stringify(data.errors)}`);
      }

      // Calculate sentiment from positive and negative
      const positiveData = data.data?.getMetric?.timeseriesData || [];
      const negativeData = data.data?.getMetric?.timeseriesData || [];
      const volumeData = data.data?.getMetric?.timeseriesData || [];

      // Get latest values
      const latestPositive = positiveData[positiveData.length - 1]?.value || 0;
      const latestNegative = negativeData[negativeData.length - 1]?.value || 0;
      const latestVolume = volumeData[volumeData.length - 1]?.value || 0;

      // Calculate sentiment score (-100 to +100)
      const total = latestPositive + latestNegative;
      const sentiment = total > 0 
        ? ((latestPositive - latestNegative) / total) * 100 
        : 0;

      // Calculate average volume (last 7 days)
      const avgVolume = volumeData.length > 0
        ? volumeData.reduce((sum: number, item: { value: number }) => sum + (item.value || 0), 0) / volumeData.length
        : 0;

      const result: SocialSentimentData = {
        asset,
        sentiment: Math.round(sentiment * 100) / 100, // Round to 2 decimals
        socialVolume: Math.round(avgVolume),
        socialDominance: 0, // Would need additional query
        timestamp: Date.now(),
      };

      // Performance: Cache 1 ora per dati social (custom)
      return NextResponse.json({
        success: true,
        data: result,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      });
    } catch (error) {
      console.error('Error fetching Santiment data:', error);
      return createErrorResponse(
        error instanceof Error ? error : new Error('Failed to fetch social sentiment'),
        500
      );
    }
  } catch (error) {
    console.error('Error in social sentiment route:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
