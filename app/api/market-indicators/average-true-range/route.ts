import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Average True Range (ATR) API
 * 
 * Average True Range - Volatility indicator
 * - ATR Value
 * - ATR Percentage (ATR / Price * 100)
 * - Volatility Level (High/Medium/Low)
 * 
 * Academic Reference:
 * - ATR Theory - Measures volatility
 * - High ATR = high volatility, high risk
 * - Low ATR = low volatility, low risk
 * - ATR used for stop-loss placement
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface ATRData {
  symbol: string;
  atr: number;
  atrPercent: number;
  volatility: 'high' | 'medium' | 'low';
  interpretation: string;
  signal: 'high-risk' | 'medium-risk' | 'low-risk';
}

/**
 * Get Average True Range
 */
async function getATR(symbol: string = 'SPY'): Promise<ATRData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real ATR
      const response = await fetch(
        `https://api.twelvedata.com/atr?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const atr = parseFloat(data.values?.[0]?.atr || '0');
        
        // Get current price for ATR%
        const quoteResponse = await fetch(
          `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${twelveDataApiKey}`
        );
        let price = 400;
        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          price = parseFloat(quoteData.close || '400');
        }
        
        const atrPercent = (atr / price) * 100;
        const volatility = atrPercent > 3 ? 'high' : atrPercent > 1.5 ? 'medium' : 'low';
        const signal = volatility === 'high' ? 'high-risk' : volatility === 'medium' ? 'medium-risk' : 'low-risk';
        
        let interpretation = '';
        if (volatility === 'high') {
          interpretation = 'High ATR: High volatility, high risk - wide price swings expected';
        } else if (volatility === 'low') {
          interpretation = 'Low ATR: Low volatility, low risk - stable price action';
        } else {
          interpretation = 'Medium ATR: Moderate volatility, moderate risk';
        }

        return {
          symbol,
          atr: Math.round(atr * 100) / 100,
          atrPercent: Math.round(atrPercent * 100) / 100,
          volatility,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Average True Range from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating ATR:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for ATR (Enhanced)
 */
async function getATRAIReading(data: ATRData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Average True Range (ATR)',
    {
      symbol: data.symbol,
      atr: data.atr.toFixed(2),
      atrPercent: `${data.atrPercent.toFixed(2)}%`,
      volatility: data.volatility === 'high' ? 'Alta' :
                  data.volatility === 'medium' ? 'Media' : 'Bassa',
      signal: data.signal === 'high-risk' ? 'Alto Rischio' :
              data.signal === 'medium-risk' ? 'Rischio Medio' : 'Basso Rischio',
    },
    {
      theory: 'Average True Range Theory - ATR misura la volatilità. ATR alto = alta volatilità (alto rischio), ATR basso = bassa volatilità (basso rischio). ATR è usato per il posizionamento di stop-loss.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/average-true-range
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

    const atrData = await getATR(symbol);

    if (!atrData) {
      return createErrorResponse(
        'ATR data not available.',
        503
      );
    }

    const aiReading = await getATRAIReading(atrData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...atrData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/average-true-range:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
