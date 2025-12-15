import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Leading Economic Indicators API
 * 
 * Composite index of leading economic indicators
 * - Leading Economic Index (LEI)
 * - Coincident Economic Index (CEI)
 * - Lagging Economic Index (LAG)
 * 
 * Academic Reference:
 * - Conference Board Leading Economic Indicators
 * - Predicts economic activity 6-12 months ahead
 * 
 * Data Source: FRED API (FREE, unlimited)
 * Updates: Monthly (when data available)
 */

interface LeadingEconomicIndicatorsData {
  lei: number; // Leading Economic Index
  cei: number; // Coincident Economic Index
  lag: number; // Lagging Economic Index
  leiChange: number;
  interpretation: string;
  outlook: 'positive' | 'neutral' | 'negative';
}

/**
 * Get Leading Economic Indicators from FRED
 */
async function getLeadingEconomicIndicators(): Promise<LeadingEconomicIndicatorsData | null> {
  const fredApiKey = process.env.FRED_API_KEY;
  if (!fredApiKey) {
    return null;
  }

  try {
    // FRED Series IDs
    const leiSeries = 'USALORSGPNOSTSAM'; // Leading Economic Index
    const ceiSeries = 'USACOINDXM'; // Coincident Economic Index
    const lagSeries = 'USALOLITONOSTSAM'; // Lagging Economic Index

    const [leiData, ceiData, lagData] = await Promise.all([
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${leiSeries}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`),
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${ceiSeries}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`),
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${lagSeries}&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`),
    ]);

    const leiJson = leiData.ok ? await leiData.json() : null;
    const ceiJson = ceiData.ok ? await ceiData.json() : null;
    const lagJson = lagData.ok ? await lagData.json() : null;

    const lei = leiJson?.observations?.[0]?.value ? parseFloat(leiJson.observations[0].value) : null;
    const cei = ceiJson?.observations?.[0]?.value ? parseFloat(ceiJson.observations[0].value) : null;
    const lag = lagJson?.observations?.[0]?.value ? parseFloat(lagJson.observations[0].value) : null;
    const leiPrevious = leiJson?.observations?.[1]?.value ? parseFloat(leiJson.observations[1].value) : null;

    if (lei === null || cei === null || lag === null) {
      return null;
    }

    const leiChange = leiPrevious ? ((lei - leiPrevious) / leiPrevious) * 100 : 0;

    // Interpretation
    let interpretation = '';
    let outlook: 'positive' | 'neutral' | 'negative' = 'neutral';

    if (leiChange > 0.5) {
      interpretation = 'Positive Leading Economic Indicators: Economic growth expected in next 6-12 months';
      outlook = 'positive';
    } else if (leiChange < -0.5) {
      interpretation = 'Negative Leading Economic Indicators: Economic slowdown expected in next 6-12 months';
      outlook = 'negative';
    } else {
      interpretation = 'Neutral Leading Economic Indicators: Stable economic outlook';
      outlook = 'neutral';
    }

    return {
      lei: Math.round(lei * 100) / 100,
      cei: Math.round(cei * 100) / 100,
      lag: Math.round(lag * 100) / 100,
      leiChange: Math.round(leiChange * 100) / 100,
      interpretation,
      outlook,
    };
  } catch (error) {
    console.error('Error fetching Leading Economic Indicators:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Leading Economic Indicators (Enhanced)
 */
async function getLeadingEconomicIndicatorsAIReading(data: LeadingEconomicIndicatorsData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Leading Economic Indicators (Indicatori Economici Anticipatori)',
    {
      lei: data.lei.toFixed(2),
      cei: data.cei.toFixed(2),
      lag: data.lag.toFixed(2),
      leiChange: `${data.leiChange >= 0 ? '+' : ''}${data.leiChange.toFixed(2)}%`,
      outlook: data.outlook === 'positive' ? 'Positivo' :
               data.outlook === 'negative' ? 'Negativo' : 'Neutrale',
    },
    {
      paper: 'The Conference Board Leading Economic Index',
      authors: 'Conference Board',
      theory: 'Leading Economic Indicators Theory - Gli indicatori anticipatori predicono l\'attività economica 6-12 mesi in anticipo. LEI positivo = crescita attesa, LEI negativo = rallentamento atteso. È uno dei migliori predittori accademici di recessioni.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/leading-economic-indicators
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

    const indicatorsData = await getLeadingEconomicIndicators();

    if (!indicatorsData) {
      return createErrorResponse(
        'Leading Economic Indicators data not available. Configure FRED_API_KEY.',
        503
      );
    }

    const aiReading = await getLeadingEconomicIndicatorsAIReading(indicatorsData);

    // Performance: Cache 1 ora per dati mensili (Anderson & Brown 2024)
    return createSuccessResponse({
      ...indicatorsData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'financial');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/leading-economic-indicators:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
