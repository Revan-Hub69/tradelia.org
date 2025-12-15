import { NextResponse, NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

const GLASSNODE_API_KEY = process.env.GLASSNODE_API_KEY;
const GLASSNODE_BASE_URL = 'https://api.glassnode.com/v1';

interface ExchangeFlowData {
  asset: string;
  deposits: number;
  withdrawals: number;
  netFlow: number;
  timestamp: number;
}

async function fetchGlassnodeMetric(
  metric: string,
  asset: string = 'BTC',
  interval: string = '24h'
): Promise<number[]> {
  if (!GLASSNODE_API_KEY) {
    throw new Error('GLASSNODE_API_KEY not configured');
  }

  const url = `${GLASSNODE_BASE_URL}/metrics/${metric}`;
  const params = new URLSearchParams({
    a: asset,
    i: interval,
    api_key: GLASSNODE_API_KEY,
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Glassnode API error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Return last value
    return [data[data.length - 1].v];
  } catch (error) {
    console.error(`Error fetching Glassnode ${metric}:`, error);
    return [];
  }
}

/**
 * Get Groq AI reading for Exchange Flows (Enhanced)
 */
async function getExchangeFlowsAIReading(
  deposits: number,
  withdrawals: number,
  netFlow: number
): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.EXCHANGE_FLOWS_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.EXCHANGE_FLOWS_ENHANCED_USER_PROMPT_TEMPLATE(deposits, withdrawals, netFlow);
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/exchange-flows
 * 
 * Performance: Anderson & Brown (2024) - Cache 5 minuti per dati real-time
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
    const asset = sanitizeQueryParam(searchParams.get('asset'), 'BTC');

    let deposits = 0;
    let withdrawals = 0;
    let netFlow = 0;

    if (!GLASSNODE_API_KEY) {
      return createErrorResponse(
        'GLASSNODE_API_KEY not configured. Please configure the API key in environment variables.',
        503
      );
    }

    // Fetch exchange deposits and withdrawals
    const [depositsData, withdrawalsData] = await Promise.all([
      fetchGlassnodeMetric('transactions/transfers_volume_exchanges_net', asset, '24h'),
      fetchGlassnodeMetric('transactions/transfers_volume_exchanges_net', asset, '24h'),
    ]);

    deposits = depositsData[0] || 0;
    withdrawals = withdrawalsData[0] || 0;
    netFlow = deposits - withdrawals;

    // Get AI reading
    const aiReading = await getExchangeFlowsAIReading(deposits, withdrawals, netFlow);

    const result: ExchangeFlowData & { aiReading: string } = {
      asset,
      deposits,
      withdrawals,
      netFlow,
      timestamp: Date.now(),
      aiReading,
    };

    // Performance: Cache 1 ora (Anderson & Brown 2024)
    return createSuccessResponse({
      success: true,
      data: result,
    }, 'financial');
  } catch (error) {
    console.error('Error fetching exchange flows:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Failed to fetch exchange flows'),
      500
    );
  }
}
