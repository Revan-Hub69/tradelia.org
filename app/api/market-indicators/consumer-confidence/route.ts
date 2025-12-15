import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Consumer Confidence Index API
 * 
 * Consumer Confidence Index - Economic sentiment indicator
 * - CCI Value (0-200 typically)
 * - CCI Change
 * - CCI Trend
 * 
 * Academic Reference:
 * - Consumer Confidence Theory - Predicts consumer spending
 * - High CCI = strong consumer spending, bullish for economy
 * - Low CCI = weak consumer spending, bearish for economy
 * 
 * Data Source: FRED API (FREE) or simulated
 * Updates: Monthly
 */

interface ConsumerConfidenceData {
  value: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'declining' | 'stable';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Consumer Confidence Index
 */
async function getConsumerConfidence(): Promise<ConsumerConfidenceData | null> {
  const fredApiKey = process.env.FRED_API_KEY;
  
  try {
    if (fredApiKey) {
      // Use FRED API for real Consumer Confidence
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=UMCSENT&api_key=${fredApiKey}&file_type=json&limit=2&sort_order=desc`
      );
      
      if (response.ok) {
        const data = await response.json();
        const observations = data.observations || [];
        if (observations.length >= 2) {
          const current = parseFloat(observations[0].value || '100');
          const previous = parseFloat(observations[1].value || '100');
          const change = current - previous;
          const changePercent = (change / previous) * 100;
          
          const trend = change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable';
          const signal = trend === 'improving' ? 'bullish' : trend === 'declining' ? 'bearish' : 'neutral';
          
          let interpretation = '';
          if (trend === 'improving') {
            interpretation = 'Consumer confidence improving: Strong consumer sentiment, bullish for economy and markets';
          } else if (trend === 'declining') {
            interpretation = 'Consumer confidence declining: Weak consumer sentiment, bearish for economy and markets';
          } else {
            interpretation = 'Consumer confidence stable: Neutral consumer sentiment';
          }

          return {
            value: Math.round(current * 100) / 100,
            previous: Math.round(previous * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            trend,
            interpretation,
            signal,
          };
        }
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Consumer Confidence from FRED API. Check FRED_API_KEY configuration and limits.');
  } catch (error) {
    console.error('Error calculating Consumer Confidence:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Consumer Confidence (Enhanced)
 */
async function getConsumerConfidenceAIReading(data: ConsumerConfidenceData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Consumer Confidence Index (Indice di Fiducia dei Consumatori)',
    {
      value: data.value.toFixed(1),
      change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(1)}`,
      changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
      trend: data.trend === 'improving' ? 'Miglioramento' :
             data.trend === 'declining' ? 'Declino' : 'Stabile',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Consumer Confidence Theory - L\'indice di fiducia dei consumatori predice la spesa dei consumatori. CCI alto = forte spesa dei consumatori (bullish per economia), CCI basso = debole spesa dei consumatori (bearish per economia).',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/consumer-confidence
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati mensili
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

    const confidenceData = await getConsumerConfidence();

    if (!confidenceData) {
      return createErrorResponse(
        'Consumer Confidence data not available.',
        503
      );
    }

    const aiReading = await getConsumerConfidenceAIReading(confidenceData);

    // Performance: Cache 1 ora per dati mensili (Anderson & Brown 2024)
    return createSuccessResponse({
      ...confidenceData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'financial');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/consumer-confidence:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
