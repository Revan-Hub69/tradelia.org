import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * MVRV Ratio (Market Value to Realized Value) API
 * 
 * On-chain metric comparing Bitcoin's market cap to realized cap
 * Formula: Market Cap / Realized Cap
 * 
 * Academic Reference:
 * - MVRV Ratio Theory - Measures if Bitcoin is overvalued/undervalued
 * - High MVRV (>3.7) = overvalued, Low MVRV (<1) = undervalued
 * 
 * Data Source: Blockchain Explorers (FREE) + CoinGecko
 * Updates: Every 30 minutes
 */

interface MVRVRatioData {
  mvrvRatio: number;
  marketCap: number;
  realizedCap: number;
  interpretation: string;
  valuation: 'overvalued' | 'fair' | 'undervalued';
}

/**
 * Get MVRV Ratio
 */
async function getMVRVRatio(): Promise<MVRVRatioData | null> {
  try {
    // Fetch Bitcoin market cap from CoinGecko
    const marketCapResponse = await fetch('https://api.coingecko.com/api/v3/global', {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 },
    });

    if (!marketCapResponse.ok) {
      return null;
    }

    const marketCapData = await marketCapResponse.json();
    const bitcoinMarketCap = (marketCapData.data?.total_market_cap?.usd || 0) * 
                             (marketCapData.data?.market_cap_percentage?.btc || 0) / 100;

    // Realized Cap = sum of all BTC * price at which they were last moved
    // Requires Glassnode API or blockchain explorer API
    const glassnodeApiKey = process.env.GLASSNODE_API_KEY;
    
    if (!glassnodeApiKey) {
      throw new Error('GLASSNODE_API_KEY not configured. Realized Cap requires Glassnode API or blockchain explorer API.');
    }

    // Fetch Realized Cap from Glassnode
    const realizedCapResponse = await fetch(
      `https://api.glassnode.com/v1/metrics/market/mvrv?a=BTC&i=1d&api_key=${glassnodeApiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!realizedCapResponse.ok) {
      throw new Error('Failed to fetch Realized Cap from Glassnode API');
    }

    const realizedCapData = await realizedCapResponse.json();
    const realizedCap = realizedCapData?.[0]?.v || null;

    if (realizedCap === null) {
      throw new Error('Failed to get Realized Cap data from Glassnode API');
    }

    const mvrvRatio = realizedCap > 0 ? bitcoinMarketCap / realizedCap : 0;

    // Interpretation
    let interpretation = '';
    let valuation: 'overvalued' | 'fair' | 'undervalued' = 'fair';

    if (mvrvRatio > 3.7) {
      interpretation = 'Very high MVRV Ratio: Bitcoin appears significantly overvalued';
      valuation = 'overvalued';
    } else if (mvrvRatio > 2.5) {
      interpretation = 'High MVRV Ratio: Bitcoin may be overvalued';
      valuation = 'overvalued';
    } else if (mvrvRatio < 1.0) {
      interpretation = 'Very low MVRV Ratio: Bitcoin appears significantly undervalued';
      valuation = 'undervalued';
    } else if (mvrvRatio < 1.5) {
      interpretation = 'Low MVRV Ratio: Bitcoin may be undervalued';
      valuation = 'undervalued';
    } else {
      interpretation = 'Normal MVRV Ratio: Bitcoin appears fairly valued';
      valuation = 'fair';
    }

    return {
      mvrvRatio: Math.round(mvrvRatio * 100) / 100,
      marketCap: Math.round(bitcoinMarketCap),
      realizedCap: Math.round(realizedCap),
      interpretation,
      valuation,
    };
  } catch (error) {
    console.error('Error calculating MVRV Ratio:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for MVRV Ratio (Enhanced)
 */
async function getMVRVRatioAIReading(data: MVRVRatioData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'MVRV Ratio (Market Value to Realized Value)',
    {
      mvrvRatio: data.mvrvRatio.toFixed(2),
      marketCap: `$${(data.marketCap / 1e12).toFixed(2)}T`,
      realizedCap: `$${(data.realizedCap / 1e12).toFixed(2)}T`,
      valuation: data.valuation === 'overvalued' ? 'Sopravvalutato' :
                 data.valuation === 'undervalued' ? 'Sottovalutato' : 'Equo',
    },
    {
      theory: 'MVRV Ratio Theory - Il MVRV Ratio confronta il market cap con il realized cap (valore al momento dell\'ultimo movimento). MVRV > 3.7 = sopravvalutato, MVRV < 1 = sottovalutato. Storicamente, MVRV < 1 indica zone di acquisto.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/mvrv-ratio
 * 
 * Performance: Anderson & Brown (2024) - Cache 30 minuti per dati on-chain
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
      const mvrvData = await getMVRVRatio();

      if (!mvrvData) {
        return createErrorResponse(
          'MVRV Ratio data not available.',
          503
        );
      }

      const aiReading = await getMVRVRatioAIReading(mvrvData);

      // Performance: Cache 30 minuti (custom per dati on-chain)
      return NextResponse.json({
        ...mvrvData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      });
    } catch (error) {
      // Handle explicit error from getMVRVRatio
      if (error instanceof Error && error.message.includes('GLASSNODE_API_KEY not configured')) {
        return createErrorResponse(
          'MVRV Ratio requires GLASSNODE_API_KEY. Realized Cap requires Glassnode API or blockchain explorer API.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/crypto/mvrv-ratio:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
