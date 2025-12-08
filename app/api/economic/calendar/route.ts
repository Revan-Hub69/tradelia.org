import { NextResponse } from 'next/server';

const TRADING_ECONOMICS_CLIENT_KEY = process.env.TRADING_ECONOMICS_CLIENT_KEY;
const TRADING_ECONOMICS_CLIENT_SECRET = process.env.TRADING_ECONOMICS_CLIENT_SECRET;
const TRADING_ECONOMICS_BASE_URL = 'https://api.tradingeconomics.com';

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
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const country = searchParams.get('country') || 'all'; // 'all', 'united states', 'euro area', 'united kingdom', etc.

    if (!TRADING_ECONOMICS_CLIENT_KEY || !TRADING_ECONOMICS_CLIENT_SECRET) {
      // Return mock data if API keys not configured
      const mockEvents: EconomicEvent[] = [
        {
          CalendarId: 1,
          Country: 'United States',
          Category: 'Inflation',
          Event: 'CPI (MoM)',
          Reference: 'Jan 2025',
          Source: 'Bureau of Labor Statistics',
          Actual: null,
          Forecast: 0.3,
          Previous: 0.2,
          Date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          Importance: 3,
          LastUpdate: new Date().toISOString(),
        },
        {
          CalendarId: 2,
          Country: 'United States',
          Category: 'Employment',
          Event: 'Non-Farm Payrolls',
          Reference: 'Jan 2025',
          Source: 'Bureau of Labor Statistics',
          Actual: null,
          Forecast: 200000,
          Previous: 216000,
          Date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          Importance: 3,
          LastUpdate: new Date().toISOString(),
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockEvents,
        note: 'TRADING_ECONOMICS credentials not configured - using mock data',
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
        },
      });
    }

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
      const filteredData = data.filter(event => {
        const eventDate = new Date(event.Date);
        return eventDate >= startDate && eventDate <= endDate;
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
