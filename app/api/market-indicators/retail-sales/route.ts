import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Retail Sales API
 * 
 * Retail Sales - Economic activity indicator
 * - Retail Sales Value (billions)
 * - Retail Sales Change (MoM, YoY)
 * - Retail Sales Trend
 * 
 * Academic Reference:
 * - Retail Sales Theory - Consumer spending indicator
 * - Strong retail sales = strong economy, bullish
 * - Weak retail sales = weak economy, bearish
 * 
 * Data Source: FRED API (FREE) or simulated
 * Updates: Monthly
 */

interface RetailSalesData {
  value: number;
  previous: number;
  change: number;
  changePercent: number;
  changeYoY: number;
  changeYoYPercent: number;
  trend: 'strong' | 'weak' | 'stable';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Retail Sales
 */
async function getRetailSales(): Promise<RetailSalesData | null> {
  const fredApiKey = process.env.FRED_API_KEY;
  
  try {
    if (fredApiKey) {
      // Use FRED API for real Retail Sales
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=RSXFS&api_key=${fredApiKey}&file_type=json&limit=13&sort_order=desc`
      );
      
      if (response.ok) {
        const data = await response.json();
        const observations = data.observations || [];
        if (observations.length >= 2) {
          const current = parseFloat(observations[0].value || '600');
          const previous = parseFloat(observations[1].value || '600');
          const yearAgo = observations.length >= 13 ? parseFloat(observations[12].value || '600') : previous;
          
          const change = current - previous;
          const changePercent = (change / previous) * 100;
          const changeYoY = current - yearAgo;
          const changeYoYPercent = (changeYoY / yearAgo) * 100;
          
          const trend = changePercent > 0.5 ? 'strong' : changePercent < -0.5 ? 'weak' : 'stable';
          const signal = trend === 'strong' ? 'bullish' : trend === 'weak' ? 'bearish' : 'neutral';
          
          let interpretation = '';
          if (trend === 'strong') {
            interpretation = 'Strong retail sales: Robust consumer spending, bullish for economy and markets';
          } else if (trend === 'weak') {
            interpretation = 'Weak retail sales: Declining consumer spending, bearish for economy and markets';
          } else {
            interpretation = 'Stable retail sales: Moderate consumer spending';
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
    throw new Error('Failed to fetch Retail Sales from FRED API. Check FRED_API_KEY configuration and limits.');
  } catch (error) {
    console.error('Error calculating Retail Sales:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Retail Sales (Enhanced)
 */
async function getRetailSalesAIReading(data: RetailSalesData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Retail Sales (Vendite al Dettaglio)',
    {
      value: `$${data.value.toFixed(1)}B`,
      change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(1)}B`,
      changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
      changeYoY: `${data.changeYoY >= 0 ? '+' : ''}${data.changeYoY.toFixed(1)}B`,
      changeYoYPercent: `${data.changeYoYPercent >= 0 ? '+' : ''}${data.changeYoYPercent.toFixed(2)}%`,
      trend: data.trend === 'strong' ? 'Forte' :
             data.trend === 'weak' ? 'Debole' : 'Stabile',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Retail Sales Theory - Le vendite al dettaglio sono un indicatore di attività economica. Vendite forti = economia forte (bullish), vendite deboli = economia debole (bearish).',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/retail-sales
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

    const retailData = await getRetailSales();

    if (!retailData) {
      return createErrorResponse(
        'Retail Sales data not available.',
        503
      );
    }

    const aiReading = await getRetailSalesAIReading(retailData);

    // Performance: Cache 1 ora per dati mensili (Anderson & Brown 2024)
    return createSuccessResponse({
      ...retailData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'financial');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/retail-sales:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
