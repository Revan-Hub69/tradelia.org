import { NextResponse } from 'next/server';

const TRADING_ECONOMICS_CLIENT_KEY = process.env.TRADING_ECONOMICS_CLIENT_KEY;
const TRADING_ECONOMICS_CLIENT_SECRET = process.env.TRADING_ECONOMICS_CLIENT_SECRET;
const TRADING_ECONOMICS_BASE_URL = 'https://api.tradingeconomics.com';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

interface EconomicEvent {
  CalendarId: number;
  Country: string;
  Category: string;
  Event: string;
  Reference: string;
  Source: string;
  Actual: number | string | null;
  Forecast: number | string | null;
  Previous: number | string | null;
  Date: string;
  Importance: number;
  LastUpdate: string;
  predictedImpact?: {
    onStocks: 'positive' | 'negative' | 'neutral';
    onForex: 'positive' | 'negative' | 'neutral';
    onCommodities: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0-100
  };
  historicalPerformance?: {
    avgMove: number; // Average market move after this event
    successRate: number; // How often forecast was accurate
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const country = searchParams.get('country') || 'all'; // 'all', 'united states', 'euro area', 'united kingdom', etc.

    // Try Finnhub Economic Calendar first (FREE, already have API key)
    if (FINNHUB_API_KEY) {
      try {
        const finnhubResponse = await fetch(
          `https://finnhub.io/api/v1/calendar/economic?token=${FINNHUB_API_KEY}`,
          {
            next: { revalidate: 3600 }, // Cache 1 hour
          }
        );

        if (finnhubResponse.ok) {
          const finnhubData = await finnhubResponse.json();
          
          if (finnhubData && Array.isArray(finnhubData.economicCalendar)) {
            // Filter by date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            let filteredData = finnhubData.economicCalendar
              .filter((event: any) => {
                const eventDate = new Date(event.time);
                return eventDate >= startDate && eventDate <= endDate;
              })
              .map((event: any) => ({
                CalendarId: event.id || Date.now(),
                Country: event.country || 'Unknown',
                Category: event.category || 'Economic',
                Event: event.event || 'Economic Event',
                Reference: event.time || '',
                Source: event.source || 'Finnhub',
                Actual: event.actual || null,
                Forecast: event.forecast || null,
                Previous: event.previous || null,
                Date: event.time || new Date().toISOString(),
                Importance: event.impact === 'high' ? 3 : event.impact === 'medium' ? 2 : 1,
                LastUpdate: new Date().toISOString(),
              }));

            // Sort by date and importance
            filteredData.sort((a: EconomicEvent, b: EconomicEvent) => {
              const dateA = new Date(a.Date).getTime();
              const dateB = new Date(b.Date).getTime();
              if (dateA !== dateB) {
                return dateA - dateB;
              }
              return b.Importance - a.Importance;
            });

            return NextResponse.json({
              success: true,
              data: filteredData,
              total: filteredData.length,
              source: 'finnhub',
            }, {
              headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
              },
            });
          }
        }
      } catch (error) {
        console.error('Error fetching Finnhub economic calendar:', error);
        // Fall through to Trading Economics
      }
    }

    // Fallback to Trading Economics if configured
    if (TRADING_ECONOMICS_CLIENT_KEY && TRADING_ECONOMICS_CLIENT_SECRET) {
      // Continue with Trading Economics implementation below
    } else {
      // Return empty array if no API configured
      return NextResponse.json({
        success: true,
        data: [],
        note: 'Economic calendar not available. Configure FINNHUB_API_KEY or TRADING_ECONOMICS credentials.',
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      });
    }

    // Trading Economics fallback (if configured)
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const url = `${TRADING_ECONOMICS_BASE_URL}/calendar`;
    const params = new URLSearchParams({
      c: TRADING_ECONOMICS_CLIENT_KEY,
      d: TRADING_ECONOMICS_CLIENT_SECRET,
      importance: '1,2,3', // All importance levels
    });
    
    // Add country filter only if not 'all'
    if (country !== 'all') {
      params.append('country', country);
    }

    try {
      const response = await fetch(`${url}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Trading Economics API error: ${response.status}`);
      }

      const data = await response.json() as EconomicEvent[];

      // Filter by date range
      let filteredData = data.filter(event => {
        const eventDate = new Date(event.Date);
        return eventDate >= startDate && eventDate <= endDate;
      });

      // Add impact prediction and historical performance (simulated for MVP)
      filteredData = filteredData.map(event => {
        // Simple impact prediction based on event type and importance
        const impactMap: Record<string, { onStocks: 'positive' | 'negative' | 'neutral'; onForex: 'positive' | 'negative' | 'neutral'; onCommodities: 'positive' | 'negative' | 'neutral' }> = {
          'Inflation': { onStocks: 'negative', onForex: 'negative', onCommodities: 'positive' },
          'Employment': { onStocks: 'positive', onForex: 'positive', onCommodities: 'neutral' },
          'GDP': { onStocks: 'positive', onForex: 'positive', onCommodities: 'neutral' },
          'Interest Rate': { onStocks: 'negative', onForex: 'positive', onCommodities: 'negative' },
        };

        const defaultImpact = { onStocks: 'neutral' as const, onForex: 'neutral' as const, onCommodities: 'neutral' as const };
        const predictedImpact = impactMap[event.Category] || defaultImpact;

        return {
          ...event,
          predictedImpact: {
            ...predictedImpact,
            confidence: event.Importance * 30 + 20, // 30-50% for low, 60-80% for high (estimated)
          },
          historicalPerformance: {
            avgMove: event.Importance * 0.5 + 1.0, // Estimated based on importance
            successRate: 60 + event.Importance * 10 + 10, // 60-80% (estimated)
          },
        };
      });

      // Sort by date and importance
      filteredData.sort((a, b) => {
        const dateA = new Date(a.Date).getTime();
        const dateB = new Date(b.Date).getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        return b.Importance - a.Importance;
      });

      return NextResponse.json({
        success: true,
        data: filteredData,
        total: filteredData.length,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
        },
      });
    } catch (error) {
      console.error('Error fetching Trading Economics calendar:', error);
      // Return empty array on error
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch economic calendar',
        data: [],
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in economic calendar route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch economic calendar',
        data: [],
      },
      { status: 500 }
    );
  }
}
