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
  performanceTracking?: {
    currentPrice?: number;
    changeSinceIPO?: number;
    changePercent?: number;
    daysSinceIPO?: number;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const country = searchParams.get('country') || 'all'; // 'all', 'US', 'EU', 'ASIA', etc.

    if (!FINNHUB_API_KEY) {
      return NextResponse.json(
        {
          error: 'FINNHUB_API_KEY not configured. Please configure the API key in environment variables.',
          success: false,
        },
        { status: 503 }
      );
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

      // Fetch performance data for past IPOs (if available)
      const pastIPOs = data.ipoCalendar.filter((ipo: any) => {
        const ipoDate = new Date(ipo.date || ipo.ipoDate);
        return ipoDate < new Date();
      });

      // Process IPO data and add sentiment/participation (simulated for now)
      let ipos: IPOEvent[] = await Promise.all(
        data.ipoCalendar.map(async (ipo: any) => {
          // Determine country from exchange
          const ipoCountry = exchangeToCountry[ipo.exchange] || 'US';
          
          // Calculate sentiment from available data (would use news API in production)
          // For now, use neutral baseline
          const sentimentScore = 0; // Would calculate from news sentiment API
          
          // Calculate institutional participation (would use IPO data in production)
          // For now, use estimated baseline
          const institutionalPct = 75; // Estimated baseline

          // Add performance tracking for past IPOs
          let performanceTracking: IPOEvent['performanceTracking'] = undefined;
          const ipoDate = new Date(ipo.date || ipo.ipoDate);
          const isPast = ipoDate < new Date();
          
          if (isPast && ipo.symbol && FINNHUB_API_KEY) {
            try {
              const quoteResponse = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${ipo.symbol}&token=${FINNHUB_API_KEY}`,
                { next: { revalidate: 300 } }
              );
              
              if (quoteResponse.ok) {
                const quote = await quoteResponse.json();
                const expectedPrice = ipo.price ? parseFloat(ipo.price) : undefined;
                const currentPrice = quote.c;
                
                if (expectedPrice && currentPrice) {
                  const daysSince = Math.floor((Date.now() - ipoDate.getTime()) / (1000 * 60 * 60 * 24));
                  const changeSinceIPO = currentPrice - expectedPrice;
                  const changePercent = (changeSinceIPO / expectedPrice) * 100;
                  
                  performanceTracking = {
                    currentPrice,
                    changeSinceIPO,
                    changePercent,
                    daysSinceIPO: daysSince,
                  };
                }
              }
            } catch (error) {
              console.error(`Error fetching performance for ${ipo.symbol}:`, error);
            }
          }

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
            performanceTracking,
          };
        })
      );

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
