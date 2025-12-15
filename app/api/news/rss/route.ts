import { NextRequest, NextResponse } from 'next/server';

/**
 * RSS Feed Aggregator API
 * 
 * Aggrega RSS feeds da multiple fonti finanziarie
 * Traduce automaticamente in italiano via AI
 * 
 * Fonti:
 * - Reuters Finance
 * - Bloomberg
 * - Financial Times
 * - Wall Street Journal
 * - MarketWatch
 * - CoinDesk (crypto)
 * - CoinTelegraph (crypto)
 */

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
}

interface RSSResponse {
  items: RSSItem[];
  timestamp: string;
  sources: string[];
  totalItems: number;
}

// RSS Feed URLs
const RSS_FEEDS = {
  reuters: 'https://www.reuters.com/finance/rss',
  bloomberg: 'https://www.bloomberg.com/feeds/podcasts/etf-report.xml',
  ft: 'https://www.ft.com/?format=rss',
  wsj: 'https://feeds.wsj.com/rss/markets',
  marketwatch: 'https://feeds.marketwatch.com/marketwatch/marketpulse',
  coindesk: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
  cointelegraph: 'https://cointelegraph.com/rss',
} as const;

/**
 * Parse RSS XML
 */
async function parseRSS(url: string, source: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Tradelia RSS Aggregator)',
      },
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!response.ok) {
      console.warn(`Failed to fetch RSS from ${source}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    
    // Simple RSS parsing (in production, use a proper RSS parser)
    const items: RSSItem[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: (titleMatch[1] || titleMatch[2] || '').trim(),
          description: (descMatch?.[1] || descMatch?.[2] || '').trim().substring(0, 200),
          link: linkMatch[1].trim(),
          pubDate: pubDateMatch?.[1]?.trim() || new Date().toISOString(),
          source,
        });
      }
    }
    
    return items.slice(0, 10); // Max 10 items per source
  } catch (error) {
    console.error(`Error parsing RSS from ${source}:`, error);
    return [];
  }
}

/**
 * Translate text to Italian via AI
 */
async function translateToItalian(text: string): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return text; // Return original if no API key
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Sei un traduttore professionale. Traduci il testo fornito dall\'inglese all\'italiano, mantenendo il significato tecnico e finanziario preciso.',
          },
          {
            role: 'user',
            content: `Traduci in italiano: ${text.substring(0, 500)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      return text;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // Optional: filter by source
    const category = searchParams.get('category'); // Optional: 'finance' | 'crypto'
    const translate = searchParams.get('translate') !== 'false'; // Default: true

    // Select feeds based on category
    const feedsToFetch = category === 'crypto'
      ? { coindesk: RSS_FEEDS.coindesk, cointelegraph: RSS_FEEDS.cointelegraph }
      : category === 'finance'
      ? { reuters: RSS_FEEDS.reuters, bloomberg: RSS_FEEDS.bloomberg, ft: RSS_FEEDS.ft, wsj: RSS_FEEDS.wsj, marketwatch: RSS_FEEDS.marketwatch }
      : RSS_FEEDS;

    // Filter by source if specified
    const filteredFeeds = source
      ? Object.fromEntries(Object.entries(feedsToFetch).filter(([key]) => key === source))
      : feedsToFetch;

    // Fetch all RSS feeds in parallel
    const feedPromises = Object.entries(filteredFeeds).map(([key, url]) =>
      parseRSS(url, key)
    );

    const feedResults = await Promise.all(feedPromises);
    let allItems: RSSItem[] = feedResults.flat();

    // Sort by date (newest first)
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    // Limit to 50 items total
    allItems = allItems.slice(0, 50);

    // Translate if requested
    if (translate) {
      const translatePromises = allItems.map(async (item) => ({
        ...item,
        title: await translateToItalian(item.title),
        description: await translateToItalian(item.description),
      }));
      allItems = await Promise.all(translatePromises);
    }

    const response: RSSResponse = {
      items: allItems,
      timestamp: new Date().toISOString(),
      sources: Object.keys(filteredFeeds),
      totalItems: allItems.length,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache
      },
    });
  } catch (error) {
    console.error('Error in GET /api/news/rss:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS feeds' },
      { status: 500 }
    );
  }
}
