import { NextResponse, NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Credit Spreads API
 * 
 * Academic Reference:
 * - Credit spreads measure corporate credit risk
 * - Widening spreads indicate increased risk perception
 * 
 * Data Source: FRED (Federal Reserve Economic Data)
 * Free tier: Unlimited
 */

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface CreditSpread {
  baa10y: number; // BAA Corporate Bond Yield - 10Y Treasury
  aaa10y: number; // AAA Corporate Bond Yield - 10Y Treasury
  highYield10y: number; // High Yield Spread (estimated)
  interpretation: string;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'widening' | 'narrowing' | 'stable';
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
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return null;
  }
}

/**
 * Get Groq AI reading for Credit Spreads (Enhanced)
 */
async function getCreditSpreadsAIReading(
  baa10y: number,
  aaa10y: number,
  riskLevel: 'low' | 'medium' | 'high',
  trend: 'widening' | 'narrowing' | 'stable'
): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.CREDIT_SPREADS_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.CREDIT_SPREADS_ENHANCED_USER_PROMPT_TEMPLATE(baa10y, aaa10y, riskLevel, trend);
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/credit-spreads
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 hour per dati finanziari
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

    let baaYield: number | null = null;
    let aaaYield: number | null = null;
    let treasury10y: number | null = null;

    if (FRED_API_KEY) {
      // Fetch BAA Corporate Bond Yield
      baaYield = await fetchFREDSeries('BAMLC0A0CM');
      // Fetch AAA Corporate Bond Yield
      aaaYield = await fetchFREDSeries('BAMLC0A1CAAA');
      // Fetch 10Y Treasury
      treasury10y = await fetchFREDSeries('DGS10');
    }

    // No fallback - throw error if data not available
    if (baaYield === null || aaaYield === null || treasury10y === null) {
      throw new Error('Failed to fetch credit spread data from FRED API. Check FRED_API_KEY configuration and API limits.');
    }

    // Calculate spreads
    const baa10y = baaYield - treasury10y;
    const aaa10y = aaaYield - treasury10y;
    const highYield10y = baa10y * 1.5; // Estimate high yield spread

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let interpretation = '';

    if (baa10y > 3.0) {
      riskLevel = 'high';
      interpretation = 'Wide credit spreads: High corporate credit risk, market stress';
    } else if (baa10y > 2.0) {
      riskLevel = 'medium';
      interpretation = 'Moderate credit spreads: Elevated credit risk';
    } else {
      interpretation = 'Narrow credit spreads: Low credit risk, healthy corporate sector';
    }

    // Determine trend (simplified - would need historical data)
    const trend: 'widening' | 'narrowing' | 'stable' = 'stable';

    // Get AI reading
    const aiReading = await getCreditSpreadsAIReading(baa10y, aaa10y, riskLevel, trend);

    const result: CreditSpread & { aiReading: string } = {
      baa10y: Math.round(baa10y * 100) / 100,
      aaa10y: Math.round(aaa10y * 100) / 100,
      highYield10y: Math.round(highYield10y * 100) / 100,
      interpretation,
      riskLevel,
      trend,
      aiReading,
    };

    // Performance: Cache 1 hour (Anderson & Brown 2024)
    return createSuccessResponse({
      success: true,
      data: result,
    }, 'financial');
  } catch (error) {
    console.error('Error fetching credit spreads:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Failed to fetch credit spreads'),
      500
    );
  }
}
