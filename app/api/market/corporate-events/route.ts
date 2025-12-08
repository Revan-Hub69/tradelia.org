import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface CorporateEvent {
  symbol: string;
  name: string;
  type: 'earnings' | 'dividend' | 'split' | 'merger' | 'acquisition';
  date: string;
  description?: string;
  value?: number | string;
  currency?: string;
  exchange?: string;
  country?: string;
  earningsSurprise?: {
    actual?: number;
    estimate?: number;
    surprise?: number; // Actual - Estimate
    surprisePercent?: number; // (Actual - Estimate) / Estimate * 100
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const country = searchParams.get('country') || 'US';
    const type = searchParams.get('type') as CorporateEvent['type'] | null;

    if (!FINNHUB_API_KEY) {
      // Return mock data if API key not configured
      const mockEvents: CorporateEvent[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'earnings',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Q1 2025 Earnings Release',
          exchange: 'NASDAQ',
          country: 'US',
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          type: 'dividend',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          value: 0.75,
          currency: 'USD',
          exchange: 'NASDAQ',
          country: 'US',
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockEvents,
        note: 'FINNHUB_API_KEY not configured - using mock data',
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      });
    }

    try {
      const events: CorporateEvent[] = [];
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch earnings calendar
      if (!type || type === 'earnings') {
        try {
          const earningsUrl = `${FINNHUB_BASE_URL}/calendar/earnings?from=${startDate.toISOString().split('T')[0]}&to=${endDate.toISOString().split('T')[0]}&token=${FINNHUB_API_KEY}`;
          const earningsResponse = await fetch(earningsUrl);
          if (earningsResponse.ok) {
            const earningsData = await earningsResponse.json();
            if (earningsData.earningsCalendar && Array.isArray(earningsData.earningsCalendar)) {
              earningsData.earningsCalendar.forEach((earning: any) => {
                // Calculate earnings surprise if actual and estimate available
                const actual = earning.actual ? parseFloat(earning.actual) : undefined;
                const estimate = earning.estimate ? parseFloat(earning.estimate) : undefined;
                
                let earningsSurprise = undefined;
                if (actual !== undefined && estimate !== undefined && estimate !== 0) {
                  const surprise = actual - estimate;
                  const surprisePercent = (surprise / estimate) * 100;
                  earningsSurprise = {
                    actual,
                    estimate,
                    surprise,
                    surprisePercent,
                  };
                }

                events.push({
                  symbol: earning.symbol || '',
                  name: earning.name || '',
                  type: 'earnings',
                  date: earning.date || new Date().toISOString(),
                  description: `Q${earning.quarter || 'N/A'} ${earning.year || new Date().getFullYear()} Earnings`,
                  exchange: earning.exchange || '',
                  country: earning.country || country,
                  earningsSurprise,
                });
              });
            }
          }
        } catch (e) {
          console.error('Error fetching earnings:', e);
        }
      }

      // Fetch dividend calendar (if available in Finnhub)
      if (!type || type === 'dividend') {
        // Note: Finnhub free tier may not have dividend calendar
        // This is a placeholder for when we have access
        // For now, we'll use stock dividends endpoint if available
      }

      // Filter by type if specified
      const filteredEvents = type 
        ? events.filter(e => e.type === type)
        : events;

      // Filter by date range
      const dateFiltered = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });

      // Sort by date
      dateFiltered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return NextResponse.json({
        success: true,
        data: dateFiltered,
        total: dateFiltered.length,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      });
    } catch (error) {
      console.error('Error fetching corporate events:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch corporate events',
          data: [],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in corporate events route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch corporate events',
        data: [],
      },
      { status: 500 }
    );
  }
}
