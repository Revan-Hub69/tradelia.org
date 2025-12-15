import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Commitment of Traders (COT) Reports API
 * 
 * CFTC COT Reports - Weekly positions of commercial and non-commercial traders
 * - Commercial Traders (hedgers)
 * - Non-Commercial Traders (speculators)
 * - Net Positions
 * 
 * Academic Reference:
 * - COT Theory - Commercial traders are typically right at extremes
 * - Extreme commercial positions indicate potential reversals
 * 
 * Data Source: CFTC (FREE, HTML parsing required)
 * Updates: Weekly (Fridays)
 */

interface COTReportData {
  commodity: string;
  commercialLong: number;
  commercialShort: number;
  commercialNet: number;
  nonCommercialLong: number;
  nonCommercialShort: number;
  nonCommercialNet: number;
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get COT Report
 * 
 * NOTE: CFTC provides COT data via HTML pages
 * In production, would parse HTML or use a third-party API
 */
async function getCOTReport(commodity: 'gold' | 'oil' | 'silver' = 'gold'): Promise<COTReportData | null> {
  // CFTC COT data requires web scraping or paid API
  // No free API available - throw error
  throw new Error('COT Reports require web scraping of CFTC website or paid API. This feature is not available in free tier.');
}

/**
 * Get Groq AI reading for COT Reports (Enhanced)
 */
async function getCOTReportAIReading(data: COTReportData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'COT Reports (Commitment of Traders)',
    {
      commodity: data.commodity === 'gold' ? 'Oro' :
                 data.commodity === 'oil' ? 'Petrolio' : 'Argento',
      commercialNet: data.commercialNet.toLocaleString('it-IT'),
      nonCommercialNet: data.nonCommercialNet.toLocaleString('it-IT'),
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'COT Theory - I commercial traders (hedgers) sono tipicamente corretti agli estremi. Posizioni nette commerciali estreme indicano possibili reversal. Commercials net long = bullish, Commercials net short = bearish.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/cot-reports
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati settimanali
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
    const commodityParam = sanitizeQueryParam(searchParams.get('commodity'), 'gold');
    const commodity = (['gold', 'oil', 'silver'].includes(commodityParam) ? commodityParam : 'gold') as 'gold' | 'oil' | 'silver';

    try {
      const cotData = await getCOTReport(commodity);

      if (!cotData) {
        return createErrorResponse(
          'COT Report data not available.',
          503
        );
      }

      const aiReading = await getCOTReportAIReading(cotData);

      // Performance: Cache 1 ora per dati settimanali (Anderson & Brown 2024)
      return createSuccessResponse({
        ...cotData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, 'financial');
    } catch (error) {
      // Handle explicit error from getCOTReport
      if (error instanceof Error && error.message.includes('COT Reports require')) {
        return createErrorResponse(
          'COT Reports require web scraping of CFTC website or paid API. This feature is not available in free tier.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/cot-reports:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
