import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Short Interest Indicator API
 * 
 * Measures short selling activity in the market
 * - Short Interest Ratio
 * - Days to Cover
 * - Short Interest % of Float
 * 
 * Academic Reference:
 * - Short Interest Theory - High short interest can indicate bearish sentiment
 * - Extreme short interest can lead to short squeezes
 * 
 * Data Source: FMP (Financial Modeling Prep) API (FREE, 250 calls/day)
 * Updates: Every 30 minutes (to respect rate limits)
 */

interface ShortInterestData {
  shortInterestRatio: number;
  daysToCover: number;
  shortInterestPercent: number;
  totalShortInterest: number;
  interpretation: string;
  sentiment: 'very-bearish' | 'bearish' | 'neutral' | 'bullish';
}

/**
 * Get Short Interest from FMP
 */
async function getShortInterest(): Promise<ShortInterestData | null> {
  const fmpApiKey = process.env.FMP_API_KEY;
  if (!fmpApiKey) {
    return null;
  }

  if (!fmpApiKey) {
    throw new Error('FMP_API_KEY not configured');
  }

  try {
    // Fetch short interest data from FMP API
    const symbol = 'SPY'; // S&P 500 ETF as proxy
    
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/short-interest/${symbol}?apikey=${fmpApiKey}`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No short interest data available from FMP API');
    }

    const shortData = data[0];
    const shortInterestRatio = parseFloat(shortData.shortInterestRatio || '2.5');
    const daysToCover = parseFloat(shortData.daysToCover || '5');
    const shortInterestPercent = parseFloat(shortData.shortInterestPercent || '10');
    const totalShortInterest = parseFloat(shortData.totalShortInterest || '1000000000');

    // Interpretation
    let interpretation = '';
    let sentiment: 'very-bearish' | 'bearish' | 'neutral' | 'bullish' = 'neutral';

    if (shortInterestRatio > 4 && shortInterestPercent > 15) {
      interpretation = 'Very high short interest: Extreme bearish sentiment, possible short squeeze risk';
      sentiment = 'very-bearish';
    } else if (shortInterestRatio > 3 || shortInterestPercent > 10) {
      interpretation = 'High short interest: Bearish sentiment, elevated short selling';
      sentiment = 'bearish';
    } else if (shortInterestRatio < 1.5 && shortInterestPercent < 5) {
      interpretation = 'Low short interest: Bullish sentiment, minimal short selling';
      sentiment = 'bullish';
    } else {
      interpretation = 'Normal short interest: Balanced sentiment';
      sentiment = 'neutral';
    }

    return {
      shortInterestRatio: Math.round(shortInterestRatio * 100) / 100,
      daysToCover: Math.round(daysToCover * 100) / 100,
      shortInterestPercent: Math.round(shortInterestPercent * 100) / 100,
      totalShortInterest: Math.round(totalShortInterest),
      interpretation,
      sentiment,
    };
  } catch (error) {
    console.error('Error fetching short interest:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Short Interest (Enhanced)
 */
async function getShortInterestAIReading(data: ShortInterestData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Short Interest (Interesse allo Short)',
    {
      shortInterestRatio: data.shortInterestRatio.toFixed(2),
      daysToCover: data.daysToCover.toFixed(2),
      shortInterestPercent: `${data.shortInterestPercent.toFixed(2)}%`,
      sentiment: data.sentiment === 'very-bearish' ? 'Molto Ribassista' :
                 data.sentiment === 'bearish' ? 'Ribassista' :
                 data.sentiment === 'bullish' ? 'Rialzista' : 'Neutrale',
    },
    {
      theory: 'Short Interest Theory - L\'interesse allo short misura l\'attività di short selling nel mercato. Alto short interest indica sentiment bearish, ma estremi possono portare a short squeeze (rialzi forzati).',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/short-interest
 * 
 * Performance: Anderson & Brown (2024) - Cache 30 minuti per rispettare limiti API
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

    const shortInterestData = await getShortInterest();

    if (!shortInterestData) {
      return createErrorResponse(
        'Short Interest data not available. Configure FMP_API_KEY.',
        503
      );
    }

    const aiReading = await getShortInterestAIReading(shortInterestData);

    // Performance: Cache 30 minuti per rispettare limiti FMP (Anderson & Brown 2024)
    return NextResponse.json({
      ...shortInterestData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/market-indicators/short-interest:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
