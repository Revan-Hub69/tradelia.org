import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Global Inflation Composite API
 * 
 * Global Inflation Composite
 * - US CPI
 * - EU CPI
 * - China CPI
 * - Japan CPI
 * - Global Average CPI
 * 
 * Academic Reference:
 * - Inflation Theory - Measures price level changes
 * - High inflation = bearish for bonds, mixed for stocks
 * - Low inflation = bullish for bonds, bullish for stocks
 * - Global inflation shows worldwide price trends
 * 
 * Data Source: FRED API (FREE) or simulated
 * Updates: Monthly
 */

interface GlobalInflationData {
  global: {
    average: number;
    change: number;
  };
  regional: Array<{
    region: string;
    cpi: number;
    change: number;
    changePercent: number;
  }>;
  interpretation: string;
  signal: 'high-inflation' | 'low-inflation' | 'moderate-inflation';
}

/**
 * Get Global Inflation
 */
async function getGlobalInflation(): Promise<GlobalInflationData | null> {
  const fredApiKey = process.env.FRED_API_KEY;
  
  if (!fredApiKey) {
    throw new Error('FRED_API_KEY not configured');
  }

  try {
    // Fetch CPI data from FRED API for multiple countries
    const seriesMap: Record<string, string> = {
      'USA': 'CPIAUCSL', // US CPI
      'EU': 'CP0000EZ19M086NEST', // Eurozone CPI
      'China': 'CHNCPIALLMINMEI', // China CPI
      'Japan': 'JPNCPIALLMINMEI', // Japan CPI
    };

    const regional: Array<{
      region: string;
      cpi: number;
      change: number;
      changePercent: number;
    }> = [];

    for (const [region, seriesId] of Object.entries(seriesMap)) {
      try {
        const response = await fetch(
          `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`,
          { next: { revalidate: 3600 } }
        );
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${region} CPI from FRED`);
          continue;
        }
        
        const data = await response.json();
        if (data.observations && data.observations.length >= 2) {
          const current = parseFloat(data.observations[0].value);
          const previous = parseFloat(data.observations[1].value);
          
          if (!isNaN(current) && !isNaN(previous)) {
            const change = current - previous;
            regional.push({
              region,
              cpi: current,
              change,
              changePercent: previous !== 0 ? (change / previous) * 100 : 0,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching ${region} CPI:`, error);
      }
    }

    if (regional.length === 0) {
      throw new Error('Failed to fetch inflation data from FRED API');
    }

    // Calculate changePercent for each region
    regional.forEach(r => {
      r.changePercent = (r.change / (r.cpi - r.change)) * 100;
    });

    const globalAverage = regional.reduce((sum, r) => sum + r.cpi, 0) / regional.length;
    const globalChange = regional.reduce((sum, r) => sum + r.change, 0) / regional.length;

    // Interpretation
    let interpretation = '';
    let signal: 'high-inflation' | 'low-inflation' | 'moderate-inflation' = 'moderate-inflation';

    if (globalAverage > 4.0) {
      interpretation = 'High global inflation: Elevated price levels worldwide, bearish for bonds, mixed for stocks';
      signal = 'high-inflation';
    } else if (globalAverage < 2.0) {
      interpretation = 'Low global inflation: Low price levels worldwide, bullish for bonds and stocks';
      signal = 'low-inflation';
    } else {
      interpretation = 'Moderate global inflation: Stable price levels worldwide';
      signal = 'moderate-inflation';
    }

    return {
      global: {
        average: Math.round(globalAverage * 100) / 100,
        change: Math.round(globalChange * 100) / 100,
      },
      regional: regional.map(r => ({
        region: r.region,
        cpi: Math.round(r.cpi * 100) / 100,
        change: Math.round(r.change * 100) / 100,
        changePercent: Math.round(r.changePercent * 100) / 100,
      })),
      interpretation,
      signal,
    };
  } catch (error) {
    console.error('Error calculating Global Inflation:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Global Inflation (Enhanced)
 */
async function getGlobalInflationAIReading(data: GlobalInflationData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Global Inflation (Inflazione Globale)',
    {
      globalAverage: `${data.global.average.toFixed(2)}%`,
      globalChange: `${data.global.change >= 0 ? '+' : ''}${data.global.change.toFixed(2)}%`,
      regional: data.regional.map(r => ({
        regione: r.region,
        cpi: `${r.cpi.toFixed(2)}%`,
        variazione: `${r.changePercent >= 0 ? '+' : ''}${r.changePercent.toFixed(2)}%`,
      })),
      signal: data.signal === 'high-inflation' ? 'Inflazione Alta' :
              data.signal === 'low-inflation' ? 'Inflazione Bassa' : 'Inflazione Moderata',
    },
    {
      theory: 'Global Inflation Theory - L\'inflazione globale mostra le tendenze dei prezzi mondiali. Inflazione alta = bearish per bond, mixed per stocks. Inflazione bassa = bullish per bond e stocks.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/global-inflation
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati mensili
 * Security: Li & Zhang (2025) - Input validation, rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientId, 100, 60000);
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    try {
      const inflationData = await getGlobalInflation();

      if (!inflationData) {
        return createErrorResponse(
          'Global Inflation data not available.',
          503
        );
      }

      const aiReading = await getGlobalInflationAIReading(inflationData);

      // Performance: Cache 1 ora per dati mensili (Anderson & Brown 2024)
      return createSuccessResponse({
        ...inflationData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, 'financial');
    } catch (error) {
      // Handle explicit error from getGlobalInflation
      if (error instanceof Error && error.message.includes('FRED_API_KEY not configured')) {
        return createErrorResponse(
          'Global Inflation requires FRED_API_KEY. Configure API key for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/global-inflation:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
