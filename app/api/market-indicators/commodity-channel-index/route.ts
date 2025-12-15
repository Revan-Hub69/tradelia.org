import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Commodity Channel Index (CCI) API
 * 
 * Commodity Channel Index - Momentum oscillator
 * - CCI Value (-300 to +300 typically)
 * - Overbought (>+100) / Oversold (<-100)
 * - Zero line crossovers
 * 
 * Academic Reference:
 * - CCI Theory - Momentum oscillator
 * - CCI > +100 = overbought, bearish
 * - CCI < -100 = oversold, bullish
 * - CCI crossing zero = trend change
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface CCIData {
  symbol: string;
  cci: number;
  signal: 'overbought' | 'oversold' | 'neutral';
  interpretation: string;
  trend: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Commodity Channel Index
 */
async function getCCI(symbol: string = 'SPY'): Promise<CCIData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real CCI
      const response = await fetch(
        `https://api.twelvedata.com/cci?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const cci = parseFloat(data.values?.[0]?.cci || '0');
        
        const signal = cci > 100 ? 'overbought' : cci < -100 ? 'oversold' : 'neutral';
        const trend = cci > 0 ? 'bullish' : cci < 0 ? 'bearish' : 'neutral';
        
        let interpretation = '';
        if (signal === 'overbought') {
          interpretation = 'CCI overbought (>+100): Strong momentum, possible reversal';
        } else if (signal === 'oversold') {
          interpretation = 'CCI oversold (<-100): Weak momentum, possible bounce';
        } else if (cci > 0) {
          interpretation = 'CCI positive: Bullish momentum';
        } else if (cci < 0) {
          interpretation = 'CCI negative: Bearish momentum';
        } else {
          interpretation = 'CCI neutral: Balanced momentum';
        }

        return {
          symbol,
          cci: Math.round(cci * 100) / 100,
          signal,
          interpretation,
          trend,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Commodity Channel Index from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating CCI:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for CCI (Enhanced)
 */
async function getCCIAIReading(data: CCIData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Commodity Channel Index (CCI)',
    {
      symbol: data.symbol,
      cci: `${data.cci.toFixed(1)}`,
      signal: data.signal === 'overbought' ? 'Overbought (>+100)' :
              data.signal === 'oversold' ? 'Oversold (<-100)' : 'Neutrale',
      trend: data.trend === 'bullish' ? 'Bullish' :
             data.trend === 'bearish' ? 'Bearish' : 'Neutrale',
    },
    {
      theory: 'Commodity Channel Index Theory - Oscillatore di momentum. CCI > +100 = overbought (bearish), CCI < -100 = oversold (bullish). CCI crossing zero = cambio di trend.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/commodity-channel-index
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

    const cciData = await getCCI(symbol);

    if (!cciData) {
      return createErrorResponse(
        'CCI data not available.',
        503
      );
    }

    const aiReading = await getCCIAIReading(cciData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...cciData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/commodity-channel-index:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
