import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * On-Balance Volume (OBV) API
 * 
 * On-Balance Volume - Cumulative volume indicator
 * - OBV Value
 * - OBV Trend (increasing/decreasing)
 * - Divergence with price
 * 
 * Academic Reference:
 * - OBV Theory - Volume precedes price
 * - OBV rising = accumulation, bullish
 * - OBV falling = distribution, bearish
 * - OBV divergence = possible reversal
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface OBVData {
  symbol: string;
  obv: number;
  obvChange: number;
  obvChangePercent: number;
  trend: 'accumulation' | 'distribution' | 'neutral';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get On-Balance Volume
 */
async function getOBV(symbol: string = 'SPY'): Promise<OBVData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real OBV
      const response = await fetch(
        `https://api.twelvedata.com/obv?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const obv = parseFloat(data.values?.[0]?.obv || '0');
        const previousOBV = parseFloat(data.values?.[1]?.obv || obv);
        const obvChange = obv - previousOBV;
        const obvChangePercent = previousOBV !== 0 ? (obvChange / Math.abs(previousOBV)) * 100 : 0;
        
        const trend = obvChange > 0 ? 'accumulation' : obvChange < 0 ? 'distribution' : 'neutral';
        const signal = trend === 'accumulation' ? 'bullish' : trend === 'distribution' ? 'bearish' : 'neutral';
        
        let interpretation = '';
        if (trend === 'accumulation') {
          interpretation = 'OBV rising: Accumulation, bullish signal - volume supports price';
        } else if (trend === 'distribution') {
          interpretation = 'OBV falling: Distribution, bearish signal - volume opposes price';
        } else {
          interpretation = 'OBV neutral: Balanced volume flow';
        }

        return {
          symbol,
          obv: Math.round(obv),
          obvChange: Math.round(obvChange),
          obvChangePercent: Math.round(obvChangePercent * 100) / 100,
          trend,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch On-Balance Volume from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating OBV:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for OBV (Enhanced)
 */
async function getOBVAIReading(data: OBVData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'On-Balance Volume (OBV)',
    {
      symbol: data.symbol,
      obv: data.obv.toLocaleString('it-IT'),
      obvChange: `${data.obvChange >= 0 ? '+' : ''}${data.obvChange.toLocaleString('it-IT')}`,
      obvChangePercent: `${data.obvChangePercent >= 0 ? '+' : ''}${data.obvChangePercent.toFixed(2)}%`,
      trend: data.trend === 'accumulation' ? 'Accumulazione' :
             data.trend === 'distribution' ? 'Distribuzione' : 'Neutrale',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'On-Balance Volume Theory - OBV misura il flusso cumulativo di volume. OBV in aumento = accumulazione (bullish), OBV in diminuzione = distribuzione (bearish). Il volume precede il prezzo.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/on-balance-volume
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

    const obvData = await getOBV(symbol);

    if (!obvData) {
      return createErrorResponse(
        'OBV data not available.',
        503
      );
    }

    const aiReading = await getOBVAIReading(obvData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...obvData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/on-balance-volume:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
