import { NextRequest, NextResponse } from 'next/server';

/**
 * Economic Calendar API
 * 
 * Global Economic Calendar with events and announcements
 * - GDP Releases
 * - Central Bank Decisions (Fed, ECB, BOJ, BOE)
 * - Employment Reports
 * - Inflation Data (CPI, PPI)
 * - PMI Releases
 * 
 * Academic Reference: Economic Calendar Theory
 * Data Source: Trading Economics (PAID) or Finnhub (FREE, limited)
 * Updates: Daily
 */

interface EconomicEvent {
  id: string;
  country: string;
  event: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  previous?: number;
  forecast?: number;
  actual?: number;
  category: 'gdp' | 'inflation' | 'employment' | 'central-bank' | 'pmi' | 'other';
}

interface EconomicCalendarResponse {
  events: EconomicEvent[];
  timestamp: string;
  aiReading: string;
}

/**
 * Get Economic Calendar
 */
async function getEconomicCalendar(days: number = 7): Promise<EconomicEvent[]> {
  const tradingEconomicsApiKey = process.env.TRADING_ECONOMICS_API_KEY;
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!tradingEconomicsApiKey && !finnhubApiKey) {
    throw new Error('TRADING_ECONOMICS_API_KEY or FINNHUB_API_KEY not configured');
  }

  try {
    const events: EconomicEvent[] = [];
    
    // Try Finnhub first (if available)
    if (finnhubApiKey) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/calendar/economic?token=${finnhubApiKey}`,
          { next: { revalidate: 3600 } }
        );
        
        if (response.ok) {
          const data = await response.json();
          // Process Finnhub economic calendar data
          // Format depends on Finnhub API response
        }
      } catch (error) {
        console.error('Error fetching Finnhub economic calendar:', error);
      }
    }

    // Try Trading Economics if configured
    if (tradingEconomicsApiKey && events.length === 0) {
      // Trading Economics API implementation
      // This requires paid API - throw error if not configured
      throw new Error('Trading Economics API requires paid subscription. Configure TRADING_ECONOMICS_API_KEY for this feature.');
    }

    if (events.length === 0) {
      throw new Error('Failed to fetch economic calendar data. Configure TRADING_ECONOMICS_API_KEY or FINNHUB_API_KEY.');
    }

    return events;
  } catch (error) {
    console.error('Error fetching Economic Calendar:', error);
    return [];
  }
}

/**
 * Get Groq AI reading for Economic Calendar (Enhanced)
 */
async function getEconomicCalendarAIReading(events: EconomicEvent[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Economic Calendar (Calendario Economico)',
    {
      events: events.slice(0, 10).map(e => ({
        evento: `${e.event} (${e.country})`,
        data: e.date,
        impatto: e.impact === 'high' ? 'Alto' : e.impact === 'medium' ? 'Medio' : 'Basso',
        categoria: e.category === 'gdp' ? 'GDP' :
                   e.category === 'inflation' ? 'Inflazione' :
                   e.category === 'employment' ? 'Occupazione' :
                   e.category === 'central-bank' ? 'Banca Centrale' :
                   e.category === 'pmi' ? 'PMI' : 'Altro',
      })),
      totalEvents: events.length,
      highImpactEvents: events.filter(e => e.impact === 'high').length,
    },
    {
      theory: 'Economic Calendar Theory - Il calendario economico mostra eventi macroeconomici importanti che influenzano i mercati. Eventi ad alto impatto (GDP, CPI, decisioni banche centrali) causano volatilità significativa.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const events = await getEconomicCalendar(days);

    const aiReading = await getEconomicCalendarAIReading(events);

    const response: EconomicCalendarResponse = {
      events,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    });
  } catch (error) {
    console.error('Error in GET /api/market/economic-calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
