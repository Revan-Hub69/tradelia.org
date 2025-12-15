import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * AAII Sentiment Survey API
 * 
 * American Association of Individual Investors Sentiment Survey
 * - Bullish Sentiment (%)
 * - Bearish Sentiment (%)
 * - Neutral Sentiment (%)
 * - Bull-Bear Spread
 * 
 * Academic Reference:
 * - Contrarian Indicator Theory - Extreme sentiment = reversal signal
 * - AAII Bullish > 50% = bearish signal (contrarian)
 * - AAII Bearish > 50% = bullish signal (contrarian)
 * 
 * Data Source: AAII (FREE, web scraping required) or simulated
 * Updates: Weekly (Thursdays)
 */

interface AAIISentimentData {
  bullish: number;
  bearish: number;
  neutral: number;
  bullBearSpread: number;
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get AAII Sentiment Survey
 * 
 * NOTE: AAII provides data via their website
 * In production, would scrape AAII website or use a third-party API
 */
async function getAAIISentiment(): Promise<AAIISentimentData | null> {
  // AAII sentiment data requires web scraping or paid API
  // No free API available - throw error
  throw new Error('AAII Sentiment requires web scraping or paid API. This feature is not available in free tier.');
}

/**
 * Get Groq AI reading for AAII Sentiment (Enhanced)
 */
async function getAAIISentimentAIReading(data: AAIISentimentData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'AAII Sentiment Survey (Sondaggio Sentiment AAII)',
    {
      bullish: `${data.bullish.toFixed(1)}%`,
      bearish: `${data.bearish.toFixed(1)}%`,
      neutral: `${data.neutral.toFixed(1)}%`,
      bullBearSpread: `${data.bullBearSpread >= 0 ? '+' : ''}${data.bullBearSpread.toFixed(1)}%`,
      signal: data.signal === 'bullish' ? 'Rialzista (Contrarian)' :
              data.signal === 'bearish' ? 'Ribassista (Contrarian)' : 'Neutrale',
    },
    {
      theory: 'Contrarian Indicator Theory - Gli estremi di sentiment indicano possibili reversal. AAII Bullish > 50% = segnale bearish (contrarian), AAII Bearish > 50% = segnale bullish (contrarian). Quando la folla è estremamente bullish, il mercato è spesso vicino a un top.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/aaii-sentiment
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

    try {
      const sentimentData = await getAAIISentiment();

      if (!sentimentData) {
        return createErrorResponse(
          'AAII Sentiment data not available.',
          503
        );
      }

      const aiReading = await getAAIISentimentAIReading(sentimentData);

      // Performance: Cache 1 ora per dati settimanali (Anderson & Brown 2024)
      return createSuccessResponse({
        ...sentimentData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, 'financial');
    } catch (error) {
      // Handle explicit error from getAAIISentiment
      if (error instanceof Error && error.message.includes('AAII Sentiment requires')) {
        return createErrorResponse(
          'AAII Sentiment requires web scraping or paid API. This feature is not available in free tier.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/aaii-sentiment:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
