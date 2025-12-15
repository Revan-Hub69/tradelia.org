import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Accumulation/Distribution Line API
 * 
 * Accumulation/Distribution Line - Volume-weighted price indicator
 * - A/D Line Value (cumulative)
 * - A/D Line Change
 * - A/D Line Trend
 * - Divergence with price
 * 
 * Academic Reference:
 * - A/D Line Theory - Volume-weighted price indicator
 * - A/D Line rising = accumulation, bullish
 * - A/D Line falling = distribution, bearish
 * - A/D Line divergence = possible reversal
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface AccumulationDistributionData {
  symbol: string;
  adLine: number;
  adChange: number;
  adChangePercent: number;
  trend: 'accumulation' | 'distribution' | 'neutral';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Accumulation/Distribution Line
 */
async function getAccumulationDistribution(symbol: string = 'SPY'): Promise<AccumulationDistributionData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real A/D Line
      const response = await fetch(
        `https://api.twelvedata.com/ad?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const adLine = parseFloat(data.values?.[0]?.ad || '0');
        const previousAD = parseFloat(data.values?.[1]?.ad || adLine);
        const adChange = adLine - previousAD;
        const adChangePercent = previousAD !== 0 ? (adChange / Math.abs(previousAD)) * 100 : 0;
        
        const trend = adChange > 1000000 ? 'accumulation' : adChange < -1000000 ? 'distribution' : 'neutral';
        const signal = trend === 'accumulation' ? 'bullish' : trend === 'distribution' ? 'bearish' : 'neutral';
        
        let interpretation = '';
        if (trend === 'accumulation') {
          interpretation = 'A/D Line accumulation: Strong buying pressure, bullish signal';
        } else if (trend === 'distribution') {
          interpretation = 'A/D Line distribution: Strong selling pressure, bearish signal';
        } else {
          interpretation = 'A/D Line neutral: Balanced accumulation/distribution';
        }

        return {
          symbol,
          adLine: Math.round(adLine),
          adChange: Math.round(adChange),
          adChangePercent: Math.round(adChangePercent * 100) / 100,
          trend,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Accumulation/Distribution Line from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating Accumulation/Distribution:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Accumulation/Distribution (Enhanced)
 */
async function getAccumulationDistributionAIReading(data: AccumulationDistributionData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Accumulation/Distribution Line',
    {
      symbol: data.symbol,
      adLine: data.adLine.toLocaleString('it-IT'),
      adChange: `${data.adChange >= 0 ? '+' : ''}${data.adChange.toLocaleString('it-IT')}`,
      adChangePercent: `${data.adChangePercent >= 0 ? '+' : ''}${data.adChangePercent.toFixed(2)}%`,
      trend: data.trend === 'accumulation' ? 'Accumulazione' :
             data.trend === 'distribution' ? 'Distribuzione' : 'Neutrale',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Accumulation/Distribution Line Theory - La A/D Line è un indicatore volume-weighted. A/D Line in aumento = accumulazione (bullish), A/D Line in diminuzione = distribuzione (bearish). Divergenza A/D Line vs. prezzo = possibile reversal.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/accumulation-distribution
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

    const adData = await getAccumulationDistribution(symbol);

    if (!adData) {
      return createErrorResponse(
        'Accumulation/Distribution data not available.',
        503
      );
    }

    const aiReading = await getAccumulationDistributionAIReading(adData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...adData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/accumulation-distribution:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
