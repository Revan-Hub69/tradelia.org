import { NextResponse } from 'next/server';
import vader from 'vader-sentiment';

const { SentimentIntensityAnalyzer } = vader;

const SANTIMENT_API_KEY = process.env.SANTIMENT_API_KEY;
const SANTIMENT_BASE_URL = 'https://api.santiment.net/graphql';

interface SentimentData {
  asset: string;
  assetType: 'crypto' | 'stock' | 'forex' | 'commodity';
  sentiment: number; // -100 to +100
  socialVolume: number;
  source: string;
  timestamp: number;
  trend?: {
    score7d: number;
    score30d: number;
    direction: 'increasing' | 'decreasing' | 'stable';
  };
}

const SANTIMENT_QUERY = `
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

const CRYPTO_SLUG_MAP: Record<string, string> = {
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

// Reddit subreddits per asset type
const REDDIT_SUBREDDITS: Record<string, string[]> = {
  'SPY': ['wallstreetbets', 'stocks', 'investing'],
  'QQQ': ['wallstreetbets', 'stocks', 'investing'],
  'DIA': ['wallstreetbets', 'stocks', 'investing'],
  'AAPL': ['wallstreetbets', 'stocks', 'investing', 'apple'],
  'MSFT': ['wallstreetbets', 'stocks', 'investing'],
  'GOOGL': ['wallstreetbets', 'stocks', 'investing'],
  'EURUSD': ['forex', 'trading'],
  'GBPUSD': ['forex', 'trading'],
  'USDJPY': ['forex', 'trading'],
  'GOLD': ['wallstreetbets', 'stocks', 'investing', 'preciousmetals'],
  'OIL': ['wallstreetbets', 'stocks', 'investing', 'oil'],
};

async function fetchRedditSentiment(asset: string, subreddits: string[]): Promise<{ sentiment: number; volume: number }> {
  try {
    const allPosts: string[] = [];
    
    for (const subreddit of subreddits) {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Tradelia/1.0' },
        });
        
        if (response.ok) {
          const data = await response.json();
          const posts = data.data?.children?.map((child: { data: { title: string } }) => child.data.title) || [];
          allPosts.push(...posts);
        }
      } catch (error) {
        console.error(`Error fetching r/${subreddit}:`, error);
      }
    }

    if (allPosts.length === 0) {
      return { sentiment: 0, volume: 0 };
    }

    // Analyze sentiment for all posts
    const sentiments = allPosts.map((title: string) =>
      SentimentIntensityAnalyzer.polarity_scores(title)
    );

    const totalSentiment = sentiments.reduce((sum, s) => sum + s.compound, 0);
    const averageSentiment = (totalSentiment / sentiments.length) * 100; // Convert to -100 to +100 scale

    return {
      sentiment: Math.round(averageSentiment * 100) / 100,
      volume: allPosts.length,
    };
  } catch (error) {
    console.error('Error fetching Reddit sentiment:', error);
    return { sentiment: 0, volume: 0 };
  }
}

async function fetchSantimentSentiment(slug: string): Promise<{ sentiment: number; volume: number }> {
  if (!SANTIMENT_API_KEY) {
    return { sentiment: 0, volume: 0 };
  }

  try {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);

    const response = await fetch(SANTIMENT_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Apikey ${SANTIMENT_API_KEY}`,
      },
      body: JSON.stringify({
        query: SANTIMENT_QUERY,
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

    const positiveData = data.data?.getMetric?.timeseriesData || [];
    const negativeData = data.data?.getMetric?.timeseriesData || [];
    const volumeData = data.data?.getMetric?.timeseriesData || [];

    const latestPositive = positiveData[positiveData.length - 1]?.value || 0;
    const latestNegative = negativeData[negativeData.length - 1]?.value || 0;
    const latestVolume = volumeData[volumeData.length - 1]?.value || 0;

    const total = latestPositive + latestNegative;
    const sentiment = total > 0 
      ? ((latestPositive - latestNegative) / total) * 100 
      : 0;

    const avgVolume = volumeData.length > 0
      ? volumeData.reduce((sum: number, item: { value: number }) => sum + (item.value || 0), 0) / volumeData.length
      : 0;

    return {
      sentiment: Math.round(sentiment * 100) / 100,
      volume: Math.round(avgVolume),
    };
  } catch (error) {
    console.error('Error fetching Santiment sentiment:', error);
    return { sentiment: 0, volume: 0 };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset') || 'BTC';
    const assetType = (searchParams.get('assetType') || 'crypto') as 'crypto' | 'stock' | 'forex' | 'commodity';

    let sentiment = 0;
    let volume = 0;
    let source = 'reddit';

    if (assetType === 'crypto') {
      // Try Santiment first for crypto
      const slug = CRYPTO_SLUG_MAP[asset.toUpperCase()];
      if (slug && SANTIMENT_API_KEY) {
        const santimentData = await fetchSantimentSentiment(slug);
        if (santimentData.volume > 0) {
          sentiment = santimentData.sentiment;
          volume = santimentData.volume;
          source = 'santiment';
        }
      }

      // Fallback to Reddit if Santiment fails or not available
      if (volume === 0) {
        const redditData = await fetchRedditSentiment(asset, ['cryptocurrency', 'CryptoCurrency']);
        sentiment = redditData.sentiment;
        volume = redditData.volume;
        source = 'reddit';
      }
    } else {
      // For stocks, forex, commodities - use Reddit
      const subreddits = REDDIT_SUBREDDITS[asset.toUpperCase()] || ['wallstreetbets', 'stocks', 'investing'];
      const redditData = await fetchRedditSentiment(asset, subreddits);
      sentiment = redditData.sentiment;
      volume = redditData.volume;
      source = 'reddit';
    }

    // Simulate trend (in production, would fetch historical data)
    const trend = {
      score7d: sentiment + (Math.random() - 0.5) * 10,
      score30d: sentiment + (Math.random() - 0.5) * 15,
      direction: (sentiment > 20 ? 'increasing' : sentiment < -20 ? 'decreasing' : 'stable') as 'increasing' | 'decreasing' | 'stable',
    };

    const result: SentimentData = {
      asset,
      assetType,
      sentiment,
      socialVolume: volume,
      source,
      timestamp: Date.now(),
      trend,
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
    console.error('Error in market sentiment route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sentiment',
        data: {
          asset: 'BTC',
          assetType: 'crypto',
          sentiment: 0,
          socialVolume: 0,
          source: 'reddit',
          timestamp: Date.now(),
        },
      },
      { status: 500 }
    );
  }
}
