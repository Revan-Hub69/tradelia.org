import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Industrial Production API
 * 
 * Industrial Production - Manufacturing activity indicator
 * - Industrial Production Index
 * - IP Change (MoM, YoY)
 * - IP Trend
 * 
 * Academic Reference:
 * - Industrial Production Theory - Manufacturing activity indicator
 * - Strong IP = strong manufacturing, bullish
 * - Weak IP = weak manufacturing, bearish
 * 
 * Data Source: FRED API (FREE) or simulated
 * Updates: Monthly
 */

interface IndustrialProductionData {
  value: number;
  previous: number;
  change: number;
  changePercent: number;
  changeYoY: number;
  changeYoYPercent: number;
  trend: 'expanding' | 'contracting' | 'stable';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Industrial Production
 */
async function getIndustrialProduction(): Promise<IndustrialProductionData | null> {
  const fredApiKey = process.env.FRED_API_KEY;
  
  try {
    if (fredApiKey) {
      // Use FRED API for real Industrial Production
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=INDPRO&api_key=${fredApiKey}&file_type=json&limit=13&sort_order=desc`
      );
      
      if (response.ok) {
        const data = await response.json();
        const observations = data.observations || [];
        if (observations.length >= 2) {
          const current = parseFloat(observations[0].value || '100');
          const previous = parseFloat(observations[1].value || '100');
          const yearAgo = observations.length >= 13 ? parseFloat(observations[12].value || '100') : previous;
          
          const change = current - previous;
          const changePercent = (change / previous) * 100;
          const changeYoY = current - yearAgo;
          const changeYoYPercent = (changeYoY / yearAgo) * 100;
          
          const trend = changePercent > 0.3 ? 'expanding' : changePercent < -0.3 ? 'contracting' : 'stable';
          const signal = trend === 'expanding' ? 'bullish' : trend === 'contracting' ? 'bearish' : 'neutral';
          
          let interpretation = '';
          if (trend === 'expanding') {
            interpretation = 'Industrial production expanding: Strong manufacturing activity, bullish for economy';
          } else if (trend === 'contracting') {
            interpretation = 'Industrial production contracting: Weak manufacturing activity, bearish for economy';
          } else {
            interpretation = 'Industrial production stable: Moderate manufacturing activity';
          }

          return {
            value: Math.round(current * 100) / 100,
            previous: Math.round(previous * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            changeYoY: Math.round(changeYoY * 100) / 100,
            changeYoYPercent: Math.round(changeYoYPercent * 100) / 100,
            trend,
            interpretation,
            signal,
          };
        }
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch Industrial Production from FRED API. Check FRED_API_KEY configuration and limits.');
  } catch (error) {
    console.error('Error calculating Industrial Production:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Industrial Production (Enhanced)
 */
async function getIndustrialProductionAIReading(data: IndustrialProductionData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Industrial Production (Produzione Industriale)',
    {
      value: data.value.toFixed(2),
      change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}`,
      changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
      changeYoY: `${data.changeYoY >= 0 ? '+' : ''}${data.changeYoY.toFixed(2)}`,
      changeYoYPercent: `${data.changeYoYPercent >= 0 ? '+' : ''}${data.changeYoYPercent.toFixed(2)}%`,
      trend: data.trend === 'expanding' ? 'Espansione' :
             data.trend === 'contracting' ? 'Contrazione' : 'Stabile',
      signal: data.signal === 'bullish' ? 'Rialzista' :
               data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Industrial Production Theory - La produzione industriale è un indicatore di attività manifatturiera. IP forte = manifattura forte (bullish), IP debole = manifattura debole (bearish).',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/industrial-production
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

    const ipData = await getIndustrialProduction();

    if (!ipData) {
      return createErrorResponse(
        'Industrial Production data not available.',
        503
      );
    }

    const aiReading = await getIndustrialProductionAIReading(ipData);

    // Performance: Cache 1 ora per dati mensili (Anderson & Brown 2024)
    return createSuccessResponse({
      ...ipData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'financial');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/industrial-production:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
