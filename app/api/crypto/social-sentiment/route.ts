import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset') || 'BTC';
    const slug = SLUG_MAP[asset.toUpperCase()] || 'bitcoin';

    if (!SANTIMENT_API_KEY) {
      // Return mock data if API key not configured
      return NextResponse.json({
        success: true,
        data: {
          asset,
          sentiment: 0,
          socialVolume: 0,
          socialDominance: 0,
          timestamp: Date.now(),
          note: 'SANTIMENT_API_KEY not configured - using mock data',
        },
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
        },
      });
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

      return NextResponse.json({
        success: true,
        data: result,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
        },
      });
    } catch (error) {
      console.error('Error fetching Santiment data:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch social sentiment',
          data: {
            asset,
            sentiment: 0,
            socialVolume: 0,
            socialDominance: 0,
            timestamp: Date.now(),
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in social sentiment route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch social sentiment',
        data: {
          asset: 'BTC',
          sentiment: 0,
          socialVolume: 0,
          socialDominance: 0,
          timestamp: Date.now(),
        },
      },
      { status: 500 }
    );
  }
}
