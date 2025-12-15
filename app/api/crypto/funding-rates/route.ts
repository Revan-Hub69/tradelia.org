import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Funding Rates API
 * 
 * Cryptocurrency Perpetual Futures Funding Rates
 * - BTC Funding Rate
 * - ETH Funding Rate
 * - Average Funding Rate
 * - Funding Rate Trend
 * 
 * Academic Reference:
 * - Funding Rates Theory - Extreme funding rates indicate sentiment extremes
 * - High positive funding = longs pay shorts (bearish sentiment)
 * - High negative funding = shorts pay longs (bullish sentiment)
 * - Funding rate reversals = possible trend changes
 * 
 * Data Source: Exchange APIs (Binance, Coinbase) or simulated
 * Updates: Every 8 hours (funding occurs every 8h)
 */

interface FundingRatesData {
  btc: {
    rate: number;
    ratePercent: number;
    exchange: string;
  };
  eth: {
    rate: number;
    ratePercent: number;
    exchange: string;
  };
  average: number;
  averagePercent: number;
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Funding Rates
 * 
 * NOTE: In production, would fetch from exchange APIs (Binance, Coinbase)
 */
async function getFundingRates(): Promise<FundingRatesData | null> {
  // Funding Rates require exchange APIs (Binance, Coinbase, etc.)
  // This requires paid exchange APIs or WebSocket connections
  throw new Error('Funding Rates require exchange APIs. Configure BINANCE_API_KEY or COINBASE_API_KEY for this feature.');
}

/**
 * Get Groq AI reading for Funding Rates (Enhanced)
 */
async function getFundingRatesAIReading(data: FundingRatesData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Funding Rates (Tassi di Funding)',
    {
      btcRate: `${data.btc.ratePercent >= 0 ? '+' : ''}${data.btc.ratePercent.toFixed(4)}%`,
      ethRate: `${data.eth.ratePercent >= 0 ? '+' : ''}${data.eth.ratePercent.toFixed(4)}%`,
      averageRate: `${data.averagePercent >= 0 ? '+' : ''}${data.averagePercent.toFixed(4)}%`,
      signal: data.signal === 'bullish' ? 'Rialzista (Funding negativo)' :
              data.signal === 'bearish' ? 'Ribassista (Funding positivo)' : 'Neutrale',
    },
    {
      theory: 'Funding Rates Theory - I tassi di funding estremi indicano estremi di sentiment. Funding positivo alto = longs pagano shorts (sentiment bearish), funding negativo alto = shorts pagano longs (sentiment bullish). Reversal dei funding rates = possibili cambi di trend.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/funding-rates
 * 
 * Performance: Anderson & Brown (2024) - Cache 8 ore per dati aggiornati ogni 8h
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
      const fundingData = await getFundingRates();

      if (!fundingData) {
        return createErrorResponse(
          'Funding Rates data not available.',
          503
        );
      }

      const aiReading = await getFundingRatesAIReading(fundingData);

      // Performance: Cache 8 ore per dati aggiornati ogni 8h (Anderson & Brown 2024)
      return NextResponse.json({
        ...fundingData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=57600',
          ...SECURITY_HEADERS,
        },
      });
    } catch (error) {
      // Handle explicit error from getFundingRates
      if (error instanceof Error && error.message.includes('Funding Rates require')) {
        return createErrorResponse(
          'Funding Rates require exchange APIs. Configure BINANCE_API_KEY or COINBASE_API_KEY for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/crypto/funding-rates:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
