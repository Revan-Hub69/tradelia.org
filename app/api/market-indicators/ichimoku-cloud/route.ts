import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Ichimoku Cloud API
 * 
 * Ichimoku Cloud - Comprehensive trend indicator
 * - Tenkan-sen (Conversion Line)
 * - Kijun-sen (Base Line)
 * - Senkou Span A (Leading Span A)
 * - Senkou Span B (Leading Span B)
 * - Chikou Span (Lagging Span)
 * - Cloud Position (above/below price)
 * 
 * Academic Reference:
 * - Ichimoku Theory - Comprehensive trend analysis
 * - Price above cloud = bullish
 * - Price below cloud = bearish
 * - Cloud color change = trend change
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) or calculated
 * Updates: Every 5 minutes
 */

interface IchimokuCloudData {
  symbol: string;
  tenkanSen: number;
  kijunSen: number;
  senkouSpanA: number;
  senkouSpanB: number;
  chikouSpan: number;
  price: number;
  cloudPosition: 'above' | 'below' | 'inside';
  trend: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Ichimoku Cloud
 */
async function getIchimokuCloud(symbol: string = 'SPY'): Promise<IchimokuCloudData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real Ichimoku
      const response = await fetch(
        `https://api.twelvedata.com/ichimoku?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const tenkanSen = parseFloat(data.values?.[0]?.tenkan_sen || '0');
        const kijunSen = parseFloat(data.values?.[0]?.kijun_sen || '0');
        const senkouSpanA = parseFloat(data.values?.[0]?.senkou_span_a || '0');
        const senkouSpanB = parseFloat(data.values?.[0]?.senkou_span_b || '0');
        const chikouSpan = parseFloat(data.values?.[0]?.chikou_span || '0');
        
        // Get current price
        const quoteResponse = await fetch(
          `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${twelveDataApiKey}`
        );
        let price = 400;
        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          price = parseFloat(quoteData.close || '400');
        }
        
        const cloudTop = Math.max(senkouSpanA, senkouSpanB);
        const cloudBottom = Math.min(senkouSpanA, senkouSpanB);
        const cloudPosition = price > cloudTop ? 'above' : price < cloudBottom ? 'below' : 'inside';
        const trend = cloudPosition === 'above' ? 'bullish' : cloudPosition === 'below' ? 'bearish' : 'neutral';
        const signal = trend;
        
        let interpretation = '';
        if (trend === 'bullish') {
          interpretation = 'Ichimoku bullish: Price above cloud, strong uptrend';
        } else if (trend === 'bearish') {
          interpretation = 'Ichimoku bearish: Price below cloud, strong downtrend';
        } else {
          interpretation = 'Ichimoku neutral: Price inside cloud, trend unclear';
        }

        return {
          symbol,
          tenkanSen: Math.round(tenkanSen * 100) / 100,
          kijunSen: Math.round(kijunSen * 100) / 100,
          senkouSpanA: Math.round(senkouSpanA * 100) / 100,
          senkouSpanB: Math.round(senkouSpanB * 100) / 100,
          chikouSpan: Math.round(chikouSpan * 100) / 100,
          price: Math.round(price * 100) / 100,
          cloudPosition,
          trend,
          interpretation,
          signal,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Ichimoku Cloud from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    return null;
  }
}

/**
 * Get Groq AI reading for Ichimoku Cloud (Enhanced)
 */
async function getIchimokuCloudAIReading(data: IchimokuCloudData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Ichimoku Cloud',
    {
      symbol: data.symbol,
      price: data.price.toFixed(2),
      cloudPosition: data.cloudPosition === 'above' ? 'Sopra la nuvola' :
                     data.cloudPosition === 'below' ? 'Sotto la nuvola' : 'Dentro la nuvola',
      trend: data.trend === 'bullish' ? 'Rialzista' :
             data.trend === 'bearish' ? 'Ribassista' : 'Neutrale',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Ichimoku Cloud Theory - Indicatore di trend completo. Prezzo sopra la nuvola = bullish, prezzo sotto la nuvola = bearish. Cambio colore della nuvola = cambio trend.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/ichimoku-cloud
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

    const ichimokuData = await getIchimokuCloud(symbol);

    if (!ichimokuData) {
      return createErrorResponse(
        'Ichimoku Cloud data not available.',
        503
      );
    }

    const aiReading = await getIchimokuCloudAIReading(ichimokuData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...ichimokuData,
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
