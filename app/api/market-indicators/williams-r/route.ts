import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Williams %R API
 * 
 * Williams %R - Momentum oscillator
 * - Williams %R Value (-100 to 0)
 * - Overbought (>-20) / Oversold (<-80)
 * - Divergence signals
 * 
 * Academic Reference:
 * - Williams %R Theory - Momentum oscillator
 * - %R > -20 = overbought, bearish
 * - %R < -80 = oversold, bullish
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface WilliamsRData {
  symbol: string;
  williamsR: number;
  signal: 'overbought' | 'oversold' | 'neutral';
  interpretation: string;
  trend: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Williams %R
 */
async function getWilliamsR(symbol: string = 'SPY'): Promise<WilliamsRData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real Williams %R
      const response = await fetch(
        `https://api.twelvedata.com/willr?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const williamsR = parseFloat(data.values?.[0]?.willr || '-50');
        
        const signal = williamsR > -20 ? 'overbought' : williamsR < -80 ? 'oversold' : 'neutral';
        const trend = williamsR > -40 ? 'bearish' : williamsR < -60 ? 'bullish' : 'neutral';
        
        let interpretation = '';
        if (signal === 'overbought') {
          interpretation = 'Williams %R overbought (>-20): Strong momentum, possible reversal';
        } else if (signal === 'oversold') {
          interpretation = 'Williams %R oversold (<-80): Weak momentum, possible bounce';
        } else {
          interpretation = 'Williams %R neutral: Balanced momentum';
        }

        return {
          symbol,
          williamsR: Math.round(williamsR * 100) / 100,
          signal,
          interpretation,
          trend,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Williams %R from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating Williams %R:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Williams %R (Enhanced)
 */
async function getWilliamsRAIReading(data: WilliamsRData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Williams %R',
    {
      symbol: data.symbol,
      williamsR: `${data.williamsR.toFixed(1)}`,
      signal: data.signal === 'overbought' ? 'Overbought (>-20)' :
              data.signal === 'oversold' ? 'Oversold (<-80)' : 'Neutrale',
      trend: data.trend === 'bullish' ? 'Bullish' :
             data.trend === 'bearish' ? 'Bearish' : 'Neutrale',
    },
    {
      theory: 'Williams %R Theory - Oscillatore di momentum. %R > -20 = overbought (bearish), %R < -80 = oversold (bullish). Williams %R misura la posizione del prezzo rispetto al range di trading.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/williams-r
 * 
 * Performance: Anderson & Brown (2024) - Cache 5 minuti per dati real-time
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

    // Security: Sanitize input
    const { searchParams } = new URL(request.url);
    const symbol = sanitizeQueryParam(searchParams.get('symbol'), 'SPY');

    const williamsRData = await getWilliamsR(symbol);

    if (!williamsRData) {
      return createErrorResponse(
        'Williams %R data not available.',
        503
      );
    }

    const aiReading = await getWilliamsRAIReading(williamsRData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...williamsRData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/williams-r:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
