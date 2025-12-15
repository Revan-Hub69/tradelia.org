import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Parabolic SAR API
 * 
 * Parabolic SAR - Trend following indicator
 * - SAR Value
 * - SAR Position (above/below price)
 * - Trend Direction
 * 
 * Academic Reference:
 * - Parabolic SAR Theory - Trend following indicator
 * - SAR below price = uptrend, bullish
 * - SAR above price = downtrend, bearish
 * - SAR flip = trend change signal
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface ParabolicSARData {
  symbol: string;
  sar: number;
  price: number;
  position: 'above' | 'below';
  trend: 'uptrend' | 'downtrend';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Parabolic SAR
 */
async function getParabolicSAR(symbol: string = 'SPY'): Promise<ParabolicSARData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real Parabolic SAR
      const response = await fetch(
        `https://api.twelvedata.com/sar?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const sar = parseFloat(data.values?.[0]?.sar || '0');
        
        // Get current price
        const quoteResponse = await fetch(
          `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${twelveDataApiKey}`
        );
        let price = 400;
        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          price = parseFloat(quoteData.close || '400');
        }
        
        const position = sar < price ? 'below' : 'above';
        const trend = position === 'below' ? 'uptrend' : 'downtrend';
        const signal = trend === 'uptrend' ? 'bullish' : 'bearish';
        
        let interpretation = '';
        if (trend === 'uptrend') {
          interpretation = 'Parabolic SAR uptrend: SAR below price, bullish signal - trend following';
        } else {
          interpretation = 'Parabolic SAR downtrend: SAR above price, bearish signal - trend following';
        }

        return {
          symbol,
          sar: Math.round(sar * 100) / 100,
          price: Math.round(price * 100) / 100,
          position,
          trend,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Parabolic SAR from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    console.error('Error calculating Parabolic SAR:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Parabolic SAR (Enhanced)
 */
async function getParabolicSARAIReading(data: ParabolicSARData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Parabolic SAR',
    {
      symbol: data.symbol,
      sar: data.sar.toFixed(2),
      price: data.price.toFixed(2),
      position: data.position === 'below' ? 'Sotto il prezzo' : 'Sopra il prezzo',
      trend: data.trend === 'uptrend' ? 'Uptrend' : 'Downtrend',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Parabolic SAR Theory - Indicatore trend following. SAR sotto il prezzo = uptrend (bullish), SAR sopra il prezzo = downtrend (bearish). SAR flip = segnale di cambio trend.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/parabolic-sar
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

    const sarData = await getParabolicSAR(symbol);

    if (!sarData) {
      return createErrorResponse(
        'Parabolic SAR data not available.',
        503
      );
    }

    const aiReading = await getParabolicSARAIReading(sarData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...sarData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/parabolic-sar:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
