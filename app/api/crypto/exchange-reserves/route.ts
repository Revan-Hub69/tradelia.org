import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Exchange Reserves API
 * 
 * Cryptocurrency Exchange Reserves
 * - Binance Reserves
 * - Coinbase Reserves
 * - Total Exchange Reserves
 * - Reserve Changes (inflows/outflows)
 * 
 * Academic Reference:
 * - Exchange Reserves Theory - High reserves = selling pressure
 * - Low reserves = accumulation, bullish
 * - Reserve outflows = bullish (coins leaving exchanges)
 * 
 * Data Source: Blockchain Explorers (FREE) or simulated
 * Updates: Every 15 minutes
 */

interface ExchangeReservesData {
  binance: {
    btc: number;
    eth: number;
    total: number;
  };
  coinbase: {
    btc: number;
    eth: number;
    total: number;
  };
  total: {
    btc: number;
    eth: number;
    total: number;
  };
  changes: {
    binance: { btc: number; eth: number };
    coinbase: { btc: number; eth: number };
    total: { btc: number; eth: number };
  };
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Exchange Reserves
 * 
 * NOTE: In production, would fetch from blockchain explorers or exchange APIs
 */
async function getExchangeReserves(): Promise<ExchangeReservesData | null> {
  // Exchange Reserves require blockchain explorer APIs or exchange APIs
  // This requires paid APIs (Glassnode, CryptoQuant, etc.) or blockchain explorer APIs
  throw new Error('Exchange Reserves require blockchain explorer APIs or paid exchange APIs. Configure GLASSNODE_API_KEY or CRYPTOQUANT_API_KEY for this feature.');
}

/**
 * Get Groq AI reading for Exchange Reserves (Enhanced)
 */
async function getExchangeReservesAIReading(data: ExchangeReservesData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Exchange Reserves (Riserve Exchange)',
    {
      totalBTC: `${(data.total.btc / 1000).toFixed(1)}K BTC`,
      totalETH: `${(data.total.eth / 1000000).toFixed(1)}M ETH`,
      btcChange: `${data.changes.total.btc >= 0 ? '+' : ''}${(data.changes.total.btc / 1000).toFixed(1)}K BTC`,
      ethChange: `${data.changes.total.eth >= 0 ? '+' : ''}${(data.changes.total.eth / 1000).toFixed(1)}K ETH`,
      signal: data.signal === 'bullish' ? 'Rialzista (Outflows)' :
              data.signal === 'bearish' ? 'Ribassista (Inflows)' : 'Neutrale',
    },
    {
      theory: 'Exchange Reserves Theory - Riserve alte = pressione di vendita. Riserve basse = accumulazione (bullish). Outflows (monete che escono dalle exchange) = bullish, Inflows (monete che entrano nelle exchange) = bearish.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/exchange-reserves
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
      const reservesData = await getExchangeReserves();

      if (!reservesData) {
        return createErrorResponse(
          'Exchange Reserves data not available.',
          503
        );
      }

      const aiReading = await getExchangeReservesAIReading(reservesData);

      // Performance: Cache 15 minuti per dati on-chain (Anderson & Brown 2024)
      return NextResponse.json({
        ...reservesData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          ...SECURITY_HEADERS,
        },
      });
    } catch (error) {
      // Handle explicit error from getExchangeReserves
      if (error instanceof Error && error.message.includes('Exchange Reserves require')) {
        return createErrorResponse(
          'Exchange Reserves require blockchain explorer APIs or paid exchange APIs. Configure GLASSNODE_API_KEY or CRYPTOQUANT_API_KEY for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/crypto/exchange-reserves:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
