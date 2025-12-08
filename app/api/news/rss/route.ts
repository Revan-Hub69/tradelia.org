import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import vader from 'vader-sentiment';

const parser = new Parser({
  timeout: 10000,
  maxRedirects: 5,
});

const RSS_FEEDS = [
  {
    name: 'Bloomberg Markets',
    url: 'https://www.bloomberg.com/feeds/bloomberg/markets.rss',
    category: 'markets',
    priority: 'high',
  },
  {
    name: 'Reuters Markets',
    url: 'https://www.reuters.com/rssFeed/marketsNews',
    category: 'markets',
    priority: 'high',
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/?format=rss',
    category: 'markets',
    priority: 'high',
  },
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'crypto',
    priority: 'high',
  },
  {
    name: 'The Block',
    url: 'https://www.theblock.co/rss.xml',
    category: 'crypto',
    priority: 'high',
  },
  {
    name: 'MarketWatch',
    url: 'https://feeds.marketwatch.com/marketwatch/markets/',
    category: 'markets',
    priority: 'medium',
  },
  {
    name: 'Yahoo Finance',
    url: 'https://feeds.finance.yahoo.com/rss/2.0/headline',
    category: 'markets',
    priority: 'medium',
  },
];

const { SentimentIntensityAnalyzer } = vader;

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  sentiment: {
    compound: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  impactScore: number;
  description?: string;
  credibilityScore?: number; // 0-100, based on source reputation
  clusterId?: string; // For news clustering
}

// Keywords per impact score
const HIGH_IMPACT_KEYWORDS = [
  'fed', 'fomc', 'interest rate', 'inflation', 'cpi', 'gdp', 'unemployment',
  'bitcoin', 'ethereum', 'crypto', 'regulation', 'sec', 'cfdc',
  'earnings', 'revenue', 'profit', 'loss', 'bankruptcy', 'merger', 'acquisition',
  'crash', 'surge', 'rally', 'correction', 'bear market', 'bull market',
];

const MEDIUM_IMPACT_KEYWORDS = [
  'forecast', 'upgrade', 'downgrade', 'analyst', 'price target',
  'volatility', 'vix', 'fear', 'greed', 'sentiment',
];

function calculateImpactScore(title: string, description: string = ''): number {
  const text = `${title} ${description}`.toLowerCase();
  let score = 1; // Base score

  // High impact keywords
  const highImpactCount = HIGH_IMPACT_KEYWORDS.filter(keyword => 
    text.includes(keyword)
  ).length;
  score += highImpactCount * 3;

  // Medium impact keywords
  const mediumImpactCount = MEDIUM_IMPACT_KEYWORDS.filter(keyword => 
    text.includes(keyword)
  ).length;
  score += mediumImpactCount * 1;

  return Math.min(score, 10); // Cap at 10
}

function getSentimentLabel(compound: number): 'positive' | 'negative' | 'neutral' {
  if (compound >= 0.05) return 'positive';
  if (compound <= -0.05) return 'negative';
  return 'neutral';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const allNews: NewsItem[] = [];

    // Fetch da tutte le RSS feeds in parallelo
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        if (!feedData.items) return [];

        return feedData.items.map((item) => {
          const sentiment = SentimentIntensityAnalyzer.polarity_scores(item.title || '');
          const description = item.contentSnippet || item.content || '';
          const impactScore = calculateImpactScore(item.title || '', description);

          return {
            title: item.title || 'No title',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            source: feed.name,
            category: feed.category,
            sentiment: {
              compound: sentiment.compound,
              label: getSentimentLabel(sentiment.compound),
            },
            impactScore,
            description: description.substring(0, 200), // Limit description length
          };
        });
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    results.forEach(newsItems => {
      allNews.push(...newsItems);
    });

    // Simple news clustering: group similar titles
    const clusterNews = (news: typeof allNews): typeof allNews => {
      const clusters: Record<string, typeof allNews> = {};
      
      news.forEach((item) => {
        // Simple clustering: check if title is similar to existing clusters
        const words = item.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        let foundCluster = false;
        
        for (const [clusterId, clusterItems] of Object.entries(clusters)) {
          const clusterWords = clusterItems[0].title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const commonWords = words.filter(w => clusterWords.includes(w));
          
          // If >30% words in common, add to cluster
          if (commonWords.length / Math.max(words.length, clusterWords.length) > 0.3) {
            clusters[clusterId].push({ ...item, clusterId });
            foundCluster = true;
            break;
          }
        }
        
        if (!foundCluster) {
          const newClusterId = `cluster_${Object.keys(clusters).length}`;
          clusters[newClusterId] = [{ ...item, clusterId: newClusterId }];
        }
      });
      
      // Flatten clusters, keeping first item of each cluster
      return Object.values(clusters).flat();
    };

    // Cluster news
    const clusteredNews = clusterNews(allNews);

    // Sort by impact score, credibility, and date
    clusteredNews.sort((a, b) => {
      if (b.impactScore !== a.impactScore) {
        return b.impactScore - a.impactScore;
      }
      if (b.credibilityScore !== a.credibilityScore) {
        return (b.credibilityScore || 0) - (a.credibilityScore || 0);
      }
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    // Filter by category if specified
    let filteredNews = allNews;
    if (category && category !== 'all') {
      filteredNews = allNews.filter(item => item.category === category);
    }

    // Limit results
    const limitedNews = filteredNews.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedNews,
      total: limitedNews.length,
      categories: ['all', 'markets', 'crypto'],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache
      },
    });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
