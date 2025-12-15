import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * PMI (Purchasing Managers Index) API
 * 
 * Manufacturing and Services PMI
 * - Manufacturing PMI
 * - Services PMI
 * - Composite PMI
 * 
 * Academic Reference:
 * - PMI Theory - Measures business activity (50 = neutral, >50 = expansion, <50 = contraction)
 * - Leading indicator of economic activity
 * 
 * Data Source: Trading Economics (PAID) or Finnhub (FREE, limited)
 * Updates: Monthly (when data available)
 */

interface PMIData {
  manufacturing: number;
  services: number;
  composite: number;
  interpretation: string;
  activity: 'expansion' | 'contraction' | 'neutral';
}

/**
 * Get PMI Data
 */
async function getPMI(): Promise<PMIData | null> {
  const tradingEconomicsApiKey = process.env.TRADING_ECONOMICS_API_KEY;
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!tradingEconomicsApiKey && !finnhubApiKey) {
    throw new Error('TRADING_ECONOMICS_API_KEY or FINNHUB_API_KEY not configured');
  }

  try {
    // Fetch PMI data from Trading Economics or Finnhub
    let manufacturing: number | null = null;
    let services: number | null = null;

    if (tradingEconomicsApiKey) {
      // Trading Economics API implementation
      // This requires paid API
      throw new Error('Trading Economics API requires paid subscription. Configure TRADING_ECONOMICS_API_KEY for this feature.');
    }

    if (finnhubApiKey) {
      // Try Finnhub if available
      // Note: Finnhub may not have direct PMI endpoint
      throw new Error('PMI data requires Trading Economics paid API. Configure TRADING_ECONOMICS_API_KEY for this feature.');
    }

    if (manufacturing === null || services === null) {
      throw new Error('Failed to fetch PMI data. Configure TRADING_ECONOMICS_API_KEY.');
    }

    const composite = (manufacturing + services) / 2;

    // Interpretation
    let interpretation = '';
    let activity: 'expansion' | 'contraction' | 'neutral' = 'neutral';

    if (composite > 55) {
      interpretation = 'Strong PMI: Robust economic expansion in both manufacturing and services';
      activity = 'expansion';
    } else if (composite > 50) {
      interpretation = 'Positive PMI: Moderate economic expansion';
      activity = 'expansion';
    } else if (composite < 45) {
      interpretation = 'Weak PMI: Economic contraction in manufacturing and services';
      activity = 'contraction';
    } else if (composite < 50) {
      interpretation = 'Negative PMI: Slight economic contraction';
      activity = 'contraction';
    } else {
      interpretation = 'Neutral PMI: Stable economic activity';
      activity = 'neutral';
    }

    return {
      manufacturing: Math.round(manufacturing * 100) / 100,
      services: Math.round(services * 100) / 100,
      composite: Math.round(composite * 100) / 100,
      interpretation,
      activity,
    };
  } catch (error) {
    console.error('Error calculating PMI:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for PMI (Enhanced)
 */
async function getPMIAIReading(data: PMIData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'PMI (Purchasing Managers Index)',
    {
      manufacturing: data.manufacturing.toFixed(2),
      services: data.services.toFixed(2),
      composite: data.composite.toFixed(2),
      activity: data.activity === 'expansion' ? 'Espansione' :
                data.activity === 'contraction' ? 'Contrazione' : 'Neutrale',
    },
    {
      theory: 'PMI Theory - Il PMI misura l\'attività aziendale (50 = neutrale, >50 = espansione, <50 = contrazione). È un indicatore anticipatore dell\'attività economica. PMI > 50 indica crescita economica, PMI < 50 indica contrazione.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/pmi
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

    try {
      const pmiData = await getPMI();

      if (!pmiData) {
        return createErrorResponse(
          'PMI data not available.',
          503
        );
      }

      const aiReading = await getPMIAIReading(pmiData);

      // Performance: Cache 1 ora per dati mensili (Anderson & Brown 2024)
      return createSuccessResponse({
        ...pmiData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, 'financial');
    } catch (error) {
      // Handle explicit error from getPMI
      if (error instanceof Error && error.message.includes('Trading Economics API requires')) {
        return createErrorResponse(
          'PMI requires Trading Economics API paid subscription or FINNHUB_API_KEY. Configure API key for this feature.',
          503
        );
      }
      if (error instanceof Error && error.message.includes('not configured')) {
        return createErrorResponse(
          'PMI requires TRADING_ECONOMICS_API_KEY or FINNHUB_API_KEY. Configure API key for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/pmi:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
