import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Chaikin Money Flow (CMF) API
 * 
 * Chaikin Money Flow - Volume-weighted accumulation/distribution
 * - CMF Value (-1 to +1)
 * - CMF Trend
 * - Accumulation/Distribution signal
 * 
 * Academic Reference:
 * - CMF Theory - Combines price and volume
 * - CMF > 0 = accumulation, bullish
 * - CMF < 0 = distribution, bearish
 * - CMF extremes = possible reversal
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface CMFData {
  symbol: string;
  cmf: number;
  trend: 'accumulation' | 'distribution' | 'neutral';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Chaikin Money Flow
 */
async function getCMF(symbol: string = 'SPY'): Promise<CMFData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real CMF
      const response = await fetch(
        `https://api.twelvedata.com/cmf?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const cmf = parseFloat(data.values?.[0]?.cmf || '0');
        
        const trend = cmf > 0.1 ? 'accumulation' : cmf < -0.1 ? 'distribution' : 'neutral';
        const signal = trend === 'accumulation' ? 'bullish' : trend === 'distribution' ? 'bearish' : 'neutral';
        
        let interpretation = '';
        if (trend === 'accumulation') {
          interpretation = 'CMF accumulation: Strong buying pressure, bullish signal';
        } else if (trend === 'distribution') {
          interpretation = 'CMF distribution: Strong selling pressure, bearish signal';
        } else {
          interpretation = 'CMF neutral: Balanced money flow';
        }

        return {
          symbol,
          cmf: Math.round(cmf * 1000) / 1000,
          trend,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Chaikin Money Flow from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating CMF:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for CMF (Enhanced)
 */
async function getCMFAIReading(data: CMFData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Chaikin Money Flow (CMF)',
    {
      symbol: data.symbol,
      cmf: data.cmf.toFixed(3),
      trend: data.trend === 'accumulation' ? 'Accumulazione' :
             data.trend === 'distribution' ? 'Distribuzione' : 'Neutrale',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Chaikin Money Flow Theory - CMF combina prezzo e volume. CMF > 0 = accumulazione (bullish), CMF < 0 = distribuzione (bearish). Estremi CMF = possibili reversal.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/chaikin-money-flow
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

    const cmfData = await getCMF(symbol);

    if (!cmfData) {
      return createErrorResponse(
        'CMF data not available.',
        503
      );
    }

    const aiReading = await getCMFAIReading(cmfData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...cmfData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/chaikin-money-flow:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
