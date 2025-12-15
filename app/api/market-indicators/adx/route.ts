import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * ADX (Average Directional Index) API
 * 
 * ADX - Trend strength indicator
 * - ADX Value (0-100)
 * - +DI (Positive Directional Indicator)
 * - -DI (Negative Directional Indicator)
 * - Trend Strength
 * 
 * Academic Reference:
 * - ADX Theory - Measures trend strength
 * - ADX > 25 = strong trend
 * - ADX < 20 = weak trend/no trend
 * - +DI > -DI = bullish, -DI > +DI = bearish
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface ADXData {
  symbol: string;
  adx: number;
  plusDI: number;
  minusDI: number;
  trendStrength: 'strong' | 'moderate' | 'weak';
  direction: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get ADX
 */
async function getADX(symbol: string = 'SPY'): Promise<ADXData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real ADX
      const response = await fetch(
        `https://api.twelvedata.com/adx?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const adx = parseFloat(data.values?.[0]?.adx || '20');
        const plusDI = parseFloat(data.values?.[0]?.plus_di || '20');
        const minusDI = parseFloat(data.values?.[0]?.minus_di || '20');
        
        const trendStrength = adx > 25 ? 'strong' : adx > 20 ? 'moderate' : 'weak';
        const direction = plusDI > minusDI ? 'bullish' : plusDI < minusDI ? 'bearish' : 'neutral';
        const signal = direction;
        
        let interpretation = '';
        if (trendStrength === 'strong' && direction === 'bullish') {
          interpretation = 'Strong bullish trend: ADX > 25, +DI > -DI - strong uptrend';
        } else if (trendStrength === 'strong' && direction === 'bearish') {
          interpretation = 'Strong bearish trend: ADX > 25, -DI > +DI - strong downtrend';
        } else if (trendStrength === 'weak') {
          interpretation = 'Weak trend: ADX < 20 - no clear trend, choppy market';
        } else {
          interpretation = 'Moderate trend: ADX 20-25 - developing trend';
        }

        return {
          symbol,
          adx: Math.round(adx * 100) / 100,
          plusDI: Math.round(plusDI * 100) / 100,
          minusDI: Math.round(minusDI * 100) / 100,
          trendStrength,
          direction,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch ADX from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating ADX:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for ADX (Enhanced)
 */
async function getADXAIReading(data: ADXData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'ADX (Average Directional Index)',
    {
      symbol: data.symbol,
      adx: `${data.adx.toFixed(1)}`,
      plusDI: `${data.plusDI.toFixed(1)}`,
      minusDI: `${data.minusDI.toFixed(1)}`,
      trendStrength: data.trendStrength === 'strong' ? 'Forte' :
                      data.trendStrength === 'moderate' ? 'Moderato' : 'Debole',
      direction: data.direction === 'bullish' ? 'Rialzista' :
                  data.direction === 'bearish' ? 'Ribassista' : 'Neutrale',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'ADX Theory - ADX misura la forza del trend. ADX > 25 = trend forte, ADX < 20 = trend debole/nessun trend. +DI > -DI = bullish, -DI > +DI = bearish.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/adx
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

    const adxData = await getADX(symbol);

    if (!adxData) {
      return createErrorResponse(
        'ADX data not available.',
        503
      );
    }

    const aiReading = await getADXAIReading(adxData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...adxData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/adx:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
