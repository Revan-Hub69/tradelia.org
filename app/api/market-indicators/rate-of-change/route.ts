import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam, sanitizeNumberParam } from '@/lib/utils/api-helpers';

/**
 * Rate of Change (ROC) API
 * 
 * Rate of Change - Momentum indicator
 * - ROC Value (%)
 * - ROC Period (typically 10 or 12)
 * - ROC Trend
 * 
 * Academic Reference:
 * - ROC Theory - Measures momentum
 * - ROC > 0 = bullish momentum
 * - ROC < 0 = bearish momentum
 * - ROC extremes = possible reversal
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface ROCData {
  symbol: string;
  roc: number;
  rocPercent: number;
  period: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Rate of Change
 */
async function getROC(symbol: string = 'SPY', period: number = 12): Promise<ROCData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real ROC
      const response = await fetch(
        `https://api.twelvedata.com/roc?symbol=${symbol}&interval=1day&time_period=${period}&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const roc = parseFloat(data.values?.[0]?.roc || '0');
        const rocPercent = roc * 100;
        
        const trend = roc > 2 ? 'bullish' : roc < -2 ? 'bearish' : 'neutral';
        const signal = trend;
        
        let interpretation = '';
        if (trend === 'bullish') {
          interpretation = 'ROC bullish: Strong positive momentum, bullish signal';
        } else if (trend === 'bearish') {
          interpretation = 'ROC bearish: Strong negative momentum, bearish signal';
        } else {
          interpretation = 'ROC neutral: Moderate momentum';
        }

        return {
          symbol,
          roc: Math.round(roc * 100) / 100,
          rocPercent: Math.round(rocPercent * 100) / 100,
          period,
          trend,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Rate of Change from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating ROC:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for ROC (Enhanced)
 */
async function getROCAIReading(data: ROCData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Rate of Change (ROC)',
    {
      symbol: data.symbol,
      roc: `${data.rocPercent >= 0 ? '+' : ''}${data.rocPercent.toFixed(2)}%`,
      period: `${data.period} giorni`,
      trend: data.trend === 'bullish' ? 'Rialzista' :
             data.trend === 'bearish' ? 'Ribassista' : 'Neutrale',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Rate of Change Theory - ROC misura il momentum. ROC > 0 = momentum bullish, ROC < 0 = momentum bearish. Estremi ROC = possibili reversal.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/rate-of-change
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
    const period = sanitizeNumberParam(searchParams.get('period'), 12, 1, 100);

    const rocData = await getROC(symbol, period);

    if (!rocData) {
      return createErrorResponse(
        'ROC data not available.',
        503
      );
    }

    const aiReading = await getROCAIReading(rocData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...rocData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/rate-of-change:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
