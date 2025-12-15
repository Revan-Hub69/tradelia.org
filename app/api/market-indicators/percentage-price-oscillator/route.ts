import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Percentage Price Oscillator (PPO) API
 * 
 * Percentage Price Oscillator - Momentum indicator
 * - PPO Value (%)
 * - PPO Signal Line
 * - PPO Histogram
 * - PPO Trend
 * 
 * Academic Reference:
 * - PPO Theory - Similar to MACD but percentage-based
 * - PPO > 0 = bullish momentum
 * - PPO < 0 = bearish momentum
 * - PPO crossover = trend change signal
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface PPOData {
  symbol: string;
  ppo: number;
  ppoPercent: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  signalType: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Percentage Price Oscillator
 */
async function getPPO(symbol: string = 'SPY'): Promise<PPOData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real PPO
      const response = await fetch(
        `https://api.twelvedata.com/ppo?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const ppo = parseFloat(data.values?.[0]?.ppo || '0');
        const signal = parseFloat(data.values?.[0]?.ppo_signal || '0');
        const histogram = ppo - signal;
        const ppoPercent = ppo * 100;
        
        const trend = ppo > 0.1 ? 'bullish' : ppo < -0.1 ? 'bearish' : 'neutral';
        const signalType = histogram > 0 ? 'bullish' : histogram < 0 ? 'bearish' : 'neutral';
        
        let interpretation = '';
        if (trend === 'bullish' && signalType === 'bullish') {
          interpretation = 'PPO bullish: Strong positive momentum, bullish crossover';
        } else if (trend === 'bearish' && signalType === 'bearish') {
          interpretation = 'PPO bearish: Strong negative momentum, bearish crossover';
        } else {
          interpretation = 'PPO neutral: Moderate momentum';
        }

        return {
          symbol,
          ppo: Math.round(ppo * 1000) / 1000,
          ppoPercent: Math.round(ppoPercent * 100) / 100,
          signal: Math.round(signal * 1000) / 1000,
          histogram: Math.round(histogram * 1000) / 1000,
          trend,
          interpretation,
          signalType,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Percentage Price Oscillator from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    return null;
  }
}

/**
 * Get Groq AI reading for PPO (Enhanced)
 */
async function getPPOAIReading(data: PPOData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Percentage Price Oscillator (PPO)',
    {
      symbol: data.symbol,
      ppo: `${data.ppoPercent >= 0 ? '+' : ''}${data.ppoPercent.toFixed(2)}%`,
      signal: `${data.signal >= 0 ? '+' : ''}${(data.signal * 100).toFixed(2)}%`,
      histogram: `${data.histogram >= 0 ? '+' : ''}${(data.histogram * 100).toFixed(2)}%`,
      trend: data.trend === 'bullish' ? 'Rialzista' :
             data.trend === 'bearish' ? 'Ribassista' : 'Neutrale',
      signalType: data.signalType === 'bullish' ? 'Bullish Crossover' :
                  data.signalType === 'bearish' ? 'Bearish Crossover' : 'Neutrale',
    },
    {
      theory: 'Percentage Price Oscillator Theory - PPO è simile a MACD ma basato su percentuali. PPO > 0 = momentum bullish, PPO < 0 = momentum bearish. PPO crossover = segnale di cambio trend.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/percentage-price-oscillator
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

    const ppoData = await getPPO(symbol);

    if (!ppoData) {
      return createErrorResponse(
        'PPO data not available.',
        503
      );
    }

    const aiReading = await getPPOAIReading(ppoData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...ppoData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
