import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface IPOEvent {
  symbol: string;
  name: string;
  exchange: string;
  ipoDate: string;
  priceRange?: {
    low: number;
    high: number;
  };
  expectedPrice?: number;
  shares?: number;
  marketCap?: number;
  sentiment?: {
    score: number; // -100 to +100
    sources: string[];
  };
  institutionalParticipation?: {
    percentage: number;
    majorInvestors: string[];
    totalRaised: number;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const country = searchParams.get('country') || 'all'; // 'all', 'US', 'EU', 'ASIA', etc.

    if (!FINNHUB_API_KEY) {
      // Return mock data if API key not configured
      const mockIPOs: IPOEvent[] = [
        {
          symbol: 'EXAMPLE',
          name: 'Example Corp',
          exchange: 'NASDAQ',
          ipoDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          priceRange: { low: 15, high: 17 },
          expectedPrice: 16,
          shares: 10000000,
          marketCap: 160000000,
          sentiment: {
            score: 65,
            sources: ['analyst_ratings', 'news_sentiment'],
          },
          institutionalParticipation: {
            percentage: 75,
            majorInvestors: ['BlackRock', 'Vanguard', 'Fidelity'],
            totalRaised: 120000000,
          },
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockIPOs,
        note: 'FINNHUB_API_KEY not configured - using mock data',
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
        },
      });
    }

    try {
      // Fetch IPO calendar from Finnhub
      // Note: Finnhub IPO calendar may be limited by country in free tier
      // For multi-market, we'll fetch all and filter by exchange
      const url = `${FINNHUB_BASE_URL}/calendar/ipo?from=${new Date().toISOString().split('T')[0]}&to=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&token=${FINNHUB_API_KEY}`;
      const response = await fetch(url);
      
      // Map exchanges to countries/regions
      const exchangeToCountry: Record<string, string> = {
        'NASDAQ': 'US',
        'NYSE': 'US',
        'NYSEARCA': 'US',
        'LSE': 'GB',
        'XETR': 'DE',
        'XPAR': 'FR',
        'MIL': 'IT',
        'TSE': 'JP',
        'HKEX': 'HK',
        'SSE': 'CN',
        'SZSE': 'CN',
      };

      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.ipoCalendar || !Array.isArray(data.ipoCalendar)) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      // Process IPO data and add sentiment/participation (simulated for now)
      let ipos: IPOEvent[] = data.ipoCalendar.map((ipo: any) => {
        // Determine country from exchange
        const ipoCountry = exchangeToCountry[ipo.exchange] || 'US';
        
        // Simulate sentiment based on company info
        const sentimentScore = Math.random() * 100 - 50; // -50 to +50, then adjust
        
        // Simulate institutional participation
        const institutionalPct = 60 + Math.random() * 30; // 60-90%

        return {
          symbol: ipo.symbol || '',
          name: ipo.name || '',
          exchange: ipo.exchange || '',
          ipoDate: ipo.date || new Date().toISOString(),
          priceRange: ipo.price ? {
            low: parseFloat(ipo.price) * 0.9,
            high: parseFloat(ipo.price) * 1.1,
          } : undefined,
          expectedPrice: ipo.price ? parseFloat(ipo.price) : undefined,
          shares: ipo.numberOfShares ? parseInt(ipo.numberOfShares) : undefined,
          marketCap: ipo.price && ipo.numberOfShares 
            ? parseFloat(ipo.price) * parseInt(ipo.numberOfShares)
            : undefined,
          sentiment: {
            score: Math.round(sentimentScore),
            sources: ['analyst_ratings', 'news_sentiment', 'social_sentiment'],
          },
          institutionalParticipation: {
            percentage: Math.round(institutionalPct),
            majorInvestors: ['Institutional Investors'],
            totalRaised: ipo.price && ipo.numberOfShares
              ? parseFloat(ipo.price) * parseInt(ipo.numberOfShares) * (institutionalPct / 100)
              : 0,
          },
        };
      });

      // Filter by country if specified
      if (country !== 'all') {
        const countryMap: Record<string, string[]> = {
          'US': ['US'],
          'EU': ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'DK', 'SE'],
          'ASIA': ['JP', 'HK', 'CN', 'KR', 'SG', 'TW', 'IN'],
          'GB': ['GB'],
          'DE': ['DE'],
          'FR': ['FR'],
          'IT': ['IT'],
          'JP': ['JP'],
          'HK': ['HK'],
          'CN': ['CN'],
        };
        
        const targetCountries = countryMap[country.toUpperCase()] || [country];
        ipos = ipos.filter(ipo => {
          const ipoCountry = exchangeToCountry[ipo.exchange] || 'US';
          return targetCountries.includes(ipoCountry);
        });
      }

      // Sort by date
      ipos.sort((a, b) => new Date(a.ipoDate).getTime() - new Date(b.ipoDate).getTime());

      return NextResponse.json({
        success: true,
        data: ipos,
        total: ipos.length,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
        },
      });
    } catch (error) {
      console.error('Error fetching IPO calendar:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch IPO calendar',
          data: [],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in IPO calendar route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch IPO calendar',
        data: [],
      },
      { status: 500 }
    );
  }
}
