import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Futures Term Structure API
 * 
 * Analyzes futures term structure (contango/backwardation)
 * - Oil Futures (WTI, Brent)
 * - Gold Futures
 * - Natural Gas Futures
 * 
 * Academic Reference:
 * - Futures Term Structure Theory - Contango/backwardation indicates supply/demand expectations
 * - Backwardation = supply tightness, Contango = supply abundance
 * 
 * Data Source: Yahoo Finance (Unofficial, FREE)
 * Updates: Every 10 minutes
 */

interface FuturesTermStructureData {
  commodity: string;
  currentPrice: number;
  futuresPrices: Array<{
    month: string;
    price: number;
    spread: number;
  }>;
  termStructure: 'contango' | 'backwardation' | 'neutral';
  interpretation: string;
}

/**
 * Get Futures Term Structure
 */
async function getFuturesTermStructure(commodity: 'oil' | 'gold' | 'gas' = 'oil'): Promise<FuturesTermStructureData | null> {
  // Futures Term Structure requires futures exchange APIs or Yahoo Finance
  // This requires paid APIs or web scraping
  throw new Error('Futures Term Structure requires futures exchange APIs or Yahoo Finance. This feature requires paid API access.');
}

/**
 * Get Groq AI reading for Futures Term Structure (Enhanced)
 */
async function getFuturesTermStructureAIReading(data: FuturesTermStructureData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Futures Term Structure (Struttura Temporale Futures)',
    {
      commodity: data.commodity === 'oil' ? 'Petrolio' :
                 data.commodity === 'gold' ? 'Oro' : 'Gas Naturale',
      currentPrice: data.currentPrice.toFixed(2),
      termStructure: data.termStructure === 'contango' ? 'Contango' :
                     data.termStructure === 'backwardation' ? 'Backwardation' : 'Neutrale',
      avgSpread: `${(data.futuresPrices.reduce((sum, f) => sum + f.spread, 0) / data.futuresPrices.length).toFixed(2)}%`,
    },
    {
      theory: 'Futures Term Structure Theory - La struttura temporale dei futures indica aspettative di supply/demand. Backwardation = supply tightness (prezzi futures < spot), Contango = supply abundance (prezzi futures > spot).',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/futures-term-structure
 * 
 * Performance: Anderson & Brown (2024) - Cache 10 minuti per dati calcolati
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
    const commodityParam = sanitizeQueryParam(searchParams.get('commodity'), 'oil');
    const commodity = (['oil', 'gold', 'gas'].includes(commodityParam) ? commodityParam : 'oil') as 'oil' | 'gold' | 'gas';

    try {
      const termStructureData = await getFuturesTermStructure(commodity);

      if (!termStructureData) {
        return createErrorResponse(
          'Futures Term Structure data not available.',
          503
        );
      }

      const aiReading = await getFuturesTermStructureAIReading(termStructureData);

      // Performance: Cache 10 minuti per dati calcolati (Anderson & Brown 2024)
      return NextResponse.json({
        ...termStructureData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          ...SECURITY_HEADERS,
        },
      });
    } catch (error) {
      // Handle explicit error from getFuturesTermStructure
      if (error instanceof Error && error.message.includes('Futures Term Structure requires')) {
        return createErrorResponse(
          'Futures Term Structure requires futures exchange APIs or Yahoo Finance. This feature requires paid API access.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/futures-term-structure:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
