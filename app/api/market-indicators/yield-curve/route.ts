import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Yield Curve API
 * 
 * Academic Reference:
 * - Estrella, A., & Mishkin, F. S. (1998). "Predicting U.S. Recessions"
 * - Yield curve inversion (short > long) is a recession predictor
 * 
 * Data Source: FRED (Federal Reserve Economic Data)
 * Free tier: Unlimited
 */

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface YieldCurve {
  '1M': number;
  '3M': number;
  '6M': number;
  '1Y': number;
  '2Y': number;
  '5Y': number;
  '10Y': number;
  '30Y': number;
  spread: {
    '10Y-2Y': number;
    '10Y-3M': number;
    '2Y-3M': number;
  };
  inversion: boolean;
  interpretation: string;
  recessionRisk: 'low' | 'medium' | 'high';
}

async function fetchFREDSeries(seriesId: string): Promise<number | null> {
  if (!FRED_API_KEY) return null;

  try {
    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.observations && data.observations.length > 0) {
      const value = parseFloat(data.observations[0].value);
      return isNaN(value) ? null : value;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get Groq AI reading for Yield Curve (Enhanced)
 */
async function getYieldCurveAIReading(
  yields: Record<string, number>,
  spread: { '10Y-2Y': number; '10Y-3M': number; '2Y-3M': number },
  inversion: boolean,
  recessionRisk: 'low' | 'medium' | 'high'
): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.YIELD_CURVE_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.YIELD_CURVE_ENHANCED_USER_PROMPT_TEMPLATE(yields, spread, inversion, recessionRisk);
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/yield-curve
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 hour per dati finanziari
 * Security: Li & Zhang (2025) - Input validation, rate limiting
 */
export async function GET(request: Request) {
  try {
    // Security: Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientId, 100, 60000);
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    const fredApiKey = process.env.FRED_API_KEY;
    
    if (!fredApiKey) {
      return createErrorResponse(
        'FRED_API_KEY not configured. Please configure the API key in environment variables.',
        503
      );
    }

    try {
      // FRED Series IDs for Treasury yields
      const seriesMap: Record<string, string> = {
      '1M': 'DGS1MO',   // 1-Month Treasury
      '3M': 'DGS3MO',   // 3-Month Treasury
      '6M': 'DGS6MO',   // 6-Month Treasury
      '1Y': 'DGS1',     // 1-Year Treasury
      '2Y': 'DGS2',     // 2-Year Treasury
      '5Y': 'DGS5',     // 5-Year Treasury
      '10Y': 'DGS10',   // 10-Year Treasury
      '30Y': 'DGS30',   // 30-Year Treasury
      };

      let yields: Partial<YieldCurve> = {};

      if (FRED_API_KEY) {
        // Fetch all yields in parallel
        const yieldPromises = Object.entries(seriesMap).map(async ([key, seriesId]) => {
          const value = await fetchFREDSeries(seriesId);
          return [key, value] as [string, number | null];
        });

        const yieldResults = await Promise.all(yieldPromises);
        yieldResults.forEach(([key, value]) => {
          if (value !== null) {
            (yields as any)[key] = value;
          }
        });
      }

      // Check if we have any yield data
      if (Object.keys(yields).length === 0) {
        throw new Error('No yield data available. Check FRED_API_KEY configuration and API limits.');
      }

      const fullYields = yields as YieldCurve;

      // Calculate spreads
      const spread10Y2Y = (fullYields['10Y'] || 0) - (fullYields['2Y'] || 0);
      const spread10Y3M = (fullYields['10Y'] || 0) - (fullYields['3M'] || 0);
      const spread2Y3M = (fullYields['2Y'] || 0) - (fullYields['3M'] || 0);

      // Check for inversion (negative spread)
      const inversion = spread10Y2Y < 0 || spread2Y3M < 0;

      // Determine recession risk
      let recessionRisk: 'low' | 'medium' | 'high' = 'low';
      let interpretation = '';

      if (inversion && spread10Y2Y < -0.5) {
        recessionRisk = 'high';
        interpretation = 'Yield curve inverted: Strong recession signal (Estrella & Mishkin, 1998)';
      } else if (inversion) {
        recessionRisk = 'medium';
        interpretation = 'Yield curve inverted: Recession warning signal';
      } else if (spread10Y2Y < 0.5) {
        recessionRisk = 'medium';
        interpretation = 'Yield curve flattening: Monitor for potential inversion';
      } else {
        interpretation = 'Normal yield curve: Steep curve indicates healthy economic expectations';
      }

      const spreads = {
        '10Y-2Y': Math.round(spread10Y2Y * 100) / 100,
        '10Y-3M': Math.round(spread10Y3M * 100) / 100,
        '2Y-3M': Math.round(spread2Y3M * 100) / 100,
      };

      // Get AI reading - extract only numeric yield values
      const yieldValues: Record<string, number> = {
        '1M': fullYields['1M'],
        '3M': fullYields['3M'],
        '6M': fullYields['6M'],
        '1Y': fullYields['1Y'],
        '2Y': fullYields['2Y'],
        '5Y': fullYields['5Y'],
        '10Y': fullYields['10Y'],
        '30Y': fullYields['30Y'],
      };
      
      const aiReading = await getYieldCurveAIReading(
        yieldValues,
        spreads,
        inversion,
        recessionRisk
      );

      const result: YieldCurve & { aiReading: string } = {
        ...fullYields,
        spread: spreads,
        inversion,
        interpretation,
        recessionRisk,
        aiReading,
      };

      // Performance: Cache 1 hour (Anderson & Brown 2024)
      // Return directly the result object (not wrapped in {success, data})
      return createSuccessResponse(result, 'financial');
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error : new Error('Failed to fetch yield curve'),
        500
      );
    }
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
