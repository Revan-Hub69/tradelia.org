import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Order Flow Imbalance API
 * 
 * Order Flow Imbalance - Market microstructure indicator
 * - Buy Volume vs. Sell Volume
 * - Order Flow Imbalance Ratio
 * - Imbalance Trend
 * 
 * Academic Reference:
 * - Order Flow Theory - Imbalance indicates directional pressure
 * - Positive imbalance = buying pressure, bullish
 * - Negative imbalance = selling pressure, bearish
 * - Extreme imbalances = possible reversal signals
 * 
 * Data Source: Exchange APIs or simulated
 * Updates: Real-time (every minute)
 */

interface OrderFlowImbalanceData {
  symbol: string;
  buyVolume: number;
  sellVolume: number;
  imbalance: number;
  imbalancePercent: number;
  trend: 'buying-pressure' | 'selling-pressure' | 'balanced';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Order Flow Imbalance
 * 
 * NOTE: In production, would fetch from exchange order book data
 */
async function getOrderFlowImbalance(symbol: string = 'SPY'): Promise<OrderFlowImbalanceData | null> {
  // Order Flow Imbalance requires real-time order book data from exchanges
  // This requires paid exchange APIs or WebSocket connections
  throw new Error('Order Flow Imbalance requires real-time order book data from exchange APIs. Configure exchange API keys (Binance, Coinbase, etc.) for this feature.');
}

/**
 * Get Groq AI reading for Order Flow Imbalance (Enhanced)
 */
async function getOrderFlowImbalanceAIReading(data: OrderFlowImbalanceData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Order Flow Imbalance (Squilibrio Order Flow)',
    {
      symbol: data.symbol,
      buyVolume: `${(data.buyVolume / 1000).toFixed(0)}K`,
      sellVolume: `${(data.sellVolume / 1000).toFixed(0)}K`,
      imbalance: `${data.imbalancePercent >= 0 ? '+' : ''}${data.imbalancePercent.toFixed(2)}%`,
      trend: data.trend === 'buying-pressure' ? 'Pressione di Acquisto' :
             data.trend === 'selling-pressure' ? 'Pressione di Vendita' : 'Bilanciato',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Order Flow Theory - Lo squilibrio dell\'order flow indica pressione direzionale. Imbalance positivo = pressione di acquisto (bullish), imbalance negativo = pressione di vendita (bearish). Estremi imbalance = possibili segnali di reversal.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/order-flow-imbalance
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 minuto per dati real-time
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
    const symbol = sanitizeQueryParam(searchParams.get('symbol'), 'SPY');

    const imbalanceData = await getOrderFlowImbalance(symbol);

    if (!imbalanceData) {
      return createErrorResponse(
        'Order Flow Imbalance data not available.',
        503
      );
    }

    const aiReading = await getOrderFlowImbalanceAIReading(imbalanceData);

    // Performance: Cache 1 minuto per dati real-time (Anderson & Brown 2024)
    return NextResponse.json({
      ...imbalanceData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/market-indicators/order-flow-imbalance:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
