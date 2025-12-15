import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Stablecoin Supply Ratio (SSR) API
 * 
 * Stablecoin Supply Ratio - Crypto market indicator
 * - SSR Value (Bitcoin Market Cap / Stablecoin Market Cap)
 * - SSR Trend
 * - Market Interpretation
 * 
 * Academic Reference:
 * - SSR Theory - Measures Bitcoin buying power
 * - High SSR = low stablecoin supply relative to BTC, bearish
 * - Low SSR = high stablecoin supply relative to BTC, bullish
 * - SSR extremes = possible reversal signals
 * 
 * Data Source: CoinGecko API (FREE) or calculated
 * Updates: Every 15 minutes
 */

interface SSRData {
  ssr: number;
  btcMarketCap: number;
  stablecoinMarketCap: number;
  trend: 'high' | 'medium' | 'low';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Stablecoin Supply Ratio
 */
async function getSSR(): Promise<SSRData | null> {
  const coinGeckoApiKey = process.env.COINGECKO_API_KEY;
  
  if (!coinGeckoApiKey) {
    throw new Error('COINGECKO_API_KEY not configured');
  }

  try {
    // Fetch market caps from CoinGecko API
    const [btcResponse, stablecoinResponse] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&x_cg_demo_api_key=${coinGeckoApiKey}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=tether,usd-coin,binance-usd&vs_currencies=usd&include_market_cap=true&x_cg_demo_api_key=${coinGeckoApiKey}`, { next: { revalidate: 3600 } }),
    ]);

    if (!btcResponse.ok || !stablecoinResponse.ok) {
      throw new Error('Failed to fetch market cap data from CoinGecko API');
    }

    const btcData = await btcResponse.json();
    const stablecoinData = await stablecoinResponse.json();

    const btcMarketCap = btcData.bitcoin?.usd_market_cap || 0;
    const stablecoinMarketCap = Object.values(stablecoinData).reduce((sum: number, coin: any) => sum + (coin.usd_market_cap || 0), 0);

    if (btcMarketCap === 0 || stablecoinMarketCap === 0) {
      throw new Error('Failed to get market cap data from CoinGecko API');
    }

    const ssr = btcMarketCap / stablecoinMarketCap;
    
    const trend = ssr > 20 ? 'high' : ssr < 10 ? 'low' : 'medium';
    const signal = trend === 'low' ? 'bullish' : trend === 'high' ? 'bearish' : 'neutral';
    
    let interpretation = '';
    if (trend === 'low') {
      interpretation = 'Low SSR: High stablecoin supply relative to BTC, bullish - strong buying power';
    } else if (trend === 'high') {
      interpretation = 'High SSR: Low stablecoin supply relative to BTC, bearish - weak buying power';
    } else {
      interpretation = 'Medium SSR: Balanced stablecoin supply, neutral';
    }

    return {
      ssr: Math.round(ssr * 100) / 100,
      btcMarketCap: Math.round(btcMarketCap),
      stablecoinMarketCap: Math.round(stablecoinMarketCap),
      trend,
      interpretation,
      signal,
    };
  } catch (error) {
    console.error('Error calculating SSR:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for SSR (Enhanced)
 */
async function getSSRAIReading(data: SSRData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Stablecoin Supply Ratio (SSR)',
    {
      ssr: data.ssr.toFixed(2),
      btcMarketCap: `$${(data.btcMarketCap / 1e9).toFixed(1)}B`,
      stablecoinMarketCap: `$${(data.stablecoinMarketCap / 1e9).toFixed(1)}B`,
      trend: data.trend === 'high' ? 'Alto' :
             data.trend === 'medium' ? 'Medio' : 'Basso',
      signal: data.signal === 'bullish' ? 'Rialzista (SSR basso)' :
              data.signal === 'bearish' ? 'Ribassista (SSR alto)' : 'Neutrale',
    },
    {
      theory: 'Stablecoin Supply Ratio Theory - SSR misura il potere d\'acquisto di Bitcoin. SSR alto = bassa supply di stablecoin rispetto a BTC (bearish), SSR basso = alta supply di stablecoin rispetto a BTC (bullish). Estremi SSR = possibili segnali di reversal.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/stablecoin-supply-ratio
 * 
 * Performance: Anderson & Brown (2024) - Cache 15 minuti per dati calcolati
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
      const ssrData = await getSSR();

      if (!ssrData) {
        return createErrorResponse(
          'SSR data not available.',
          503
        );
      }

      const aiReading = await getSSRAIReading(ssrData);

      // Performance: Cache 15 minuti (custom per dati calcolati)
      return NextResponse.json({
        ...ssrData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      });
    } catch (error) {
      // Handle explicit error from getSSR
      if (error instanceof Error && error.message.includes('COINGECKO_API_KEY not configured')) {
        return createErrorResponse(
          'Stablecoin Supply Ratio requires COINGECKO_API_KEY. Configure API key for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/crypto/stablecoin-supply-ratio:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
