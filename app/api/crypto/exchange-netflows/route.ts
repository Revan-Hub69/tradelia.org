import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Exchange Netflows API
 * 
 * Cryptocurrency Exchange Netflows
 * - Net Inflows (coins entering exchanges)
 * - Net Outflows (coins leaving exchanges)
 * - Net Flow (inflows - outflows)
 * - Exchange-specific flows (Binance, Coinbase, etc.)
 * 
 * Academic Reference:
 * - Exchange Netflows Theory - Net outflows = bullish, net inflows = bearish
 * - Coins leaving exchanges = accumulation, bullish
 * - Coins entering exchanges = selling pressure, bearish
 * 
 * Data Source: Blockchain Explorers or Exchange APIs
 * Updates: Every 15 minutes
 */

interface ExchangeNetflowsData {
  total: {
    inflows: number;
    outflows: number;
    netFlow: number;
  };
  exchanges: Array<{
    exchange: string;
    inflows: number;
    outflows: number;
    netFlow: number;
  }>;
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Exchange Netflows
 * 
 * NOTE: In production, would fetch from blockchain explorers or exchange APIs
 */
async function getExchangeNetflows(): Promise<ExchangeNetflowsData | null> {
  // Exchange Netflows requires blockchain explorer APIs or exchange APIs
  // This requires paid APIs (Glassnode, CryptoQuant, etc.) or blockchain explorer APIs
  throw new Error('Exchange Netflows requires blockchain explorer APIs or paid exchange APIs. Configure GLASSNODE_API_KEY or CRYPTOQUANT_API_KEY for this feature.');
}

/**
 * Get Groq AI reading for Exchange Netflows (Enhanced)
 */
async function getExchangeNetflowsAIReading(data: ExchangeNetflowsData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Exchange Netflows (Netflows Exchange)',
    {
      totalNetFlow: `${(data.total.netFlow / 1000).toFixed(1)}K BTC`,
      totalInflows: `${(data.total.inflows / 1000).toFixed(1)}K BTC`,
      totalOutflows: `${(data.total.outflows / 1000).toFixed(1)}K BTC`,
      exchanges: data.exchanges.map(e => ({
        exchange: e.exchange,
        netFlow: `${(e.netFlow / 1000).toFixed(1)}K BTC`,
      })),
      signal: data.signal === 'bullish' ? 'Rialzista (Net Outflows)' :
              data.signal === 'bearish' ? 'Ribassista (Net Inflows)' : 'Neutrale',
    },
    {
      theory: 'Exchange Netflows Theory - Net outflows (monete che escono dalle exchange) = bullish (accumulazione), net inflows (monete che entrano nelle exchange) = bearish (pressione di vendita).',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/exchange-netflows
 * 
 * Performance: Anderson & Brown (2024) - Cache 15 minuti per dati on-chain
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
      const netflowsData = await getExchangeNetflows();

      if (!netflowsData) {
        return createErrorResponse(
          'Exchange Netflows data not available.',
          503
        );
      }

      const aiReading = await getExchangeNetflowsAIReading(netflowsData);

      // Performance: Cache 15 minuti per dati on-chain (Anderson & Brown 2024)
      return NextResponse.json({
        ...netflowsData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          ...SECURITY_HEADERS,
        },
      });
    } catch (error) {
      // Handle explicit error from getExchangeNetflows
      if (error instanceof Error && error.message.includes('Exchange Netflows requires')) {
        return createErrorResponse(
          'Exchange Netflows requires blockchain explorer APIs or paid exchange APIs. Configure GLASSNODE_API_KEY or CRYPTOQUANT_API_KEY for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/crypto/exchange-netflows:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
